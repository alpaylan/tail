import {
	createCipheriv,
	createDecipheriv,
	createHash,
	randomBytes,
} from "crypto";
import { NextRequest, NextResponse } from "next/server";

const GITHUB_SESSION_COOKIE = "tail_github_session";
const GITHUB_OAUTH_STATE_COOKIE = "tail_github_oauth_state";
const GITHUB_OAUTH_RETURN_TO_COOKIE = "tail_github_oauth_return_to";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;
const AES_ALGORITHM = "aes-256-gcm";

export type GithubSession = {
	accessToken: string;
	scope: string;
	tokenType: string;
	login?: string;
	name?: string;
	avatarUrl?: string;
	createdAt: number;
};

const getCookieOptions = () => ({
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax" as const,
	path: "/",
});

const getSessionSecret = () => {
	const secret = process.env.GITHUB_SESSION_SECRET;
	if (!secret) {
		throw new Error(
			"GITHUB_SESSION_SECRET is required for GitHub OAuth session encryption.",
		);
	}
	return secret;
};

const getSessionKey = () =>
	createHash("sha256").update(getSessionSecret(), "utf8").digest();

const encryptSession = (session: GithubSession) => {
	const key = getSessionKey();
	const iv = randomBytes(12);
	const cipher = createCipheriv(AES_ALGORITHM, key, iv);
	const payload = Buffer.from(JSON.stringify(session), "utf8");
	const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
	const authTag = cipher.getAuthTag();
	return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
};

const decryptSession = (encoded: string): GithubSession | null => {
	try {
		const data = Buffer.from(encoded, "base64url");
		if (data.length < 29) {
			return null;
		}
		const key = getSessionKey();
		const iv = data.subarray(0, 12);
		const authTag = data.subarray(12, 28);
		const encrypted = data.subarray(28);
		const decipher = createDecipheriv(AES_ALGORITHM, key, iv);
		decipher.setAuthTag(authTag);
		const decrypted = Buffer.concat([
			decipher.update(encrypted),
			decipher.final(),
		]);
		return JSON.parse(decrypted.toString("utf8")) as GithubSession;
	} catch {
		return null;
	}
};

export const readGithubSession = (
	request: NextRequest,
): GithubSession | null => {
	const raw = request.cookies.get(GITHUB_SESSION_COOKIE)?.value;
	if (!raw) {
		return null;
	}
	return decryptSession(raw);
};

export const writeGithubSession = (
	response: NextResponse,
	session: GithubSession,
) => {
	response.cookies.set(GITHUB_SESSION_COOKIE, encryptSession(session), {
		...getCookieOptions(),
		maxAge: SESSION_MAX_AGE_SECONDS,
	});
};

export const clearGithubSession = (response: NextResponse) => {
	response.cookies.set(GITHUB_SESSION_COOKIE, "", {
		...getCookieOptions(),
		maxAge: 0,
	});
};

export const writeGithubOauthState = (
	response: NextResponse,
	state: string,
	returnTo: string,
) => {
	response.cookies.set(GITHUB_OAUTH_STATE_COOKIE, state, {
		...getCookieOptions(),
		maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
	});
	response.cookies.set(GITHUB_OAUTH_RETURN_TO_COOKIE, returnTo, {
		...getCookieOptions(),
		maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
	});
};

export const readGithubOauthState = (request: NextRequest) => ({
	state: request.cookies.get(GITHUB_OAUTH_STATE_COOKIE)?.value,
	returnTo: request.cookies.get(GITHUB_OAUTH_RETURN_TO_COOKIE)?.value,
});

export const clearGithubOauthState = (response: NextResponse) => {
	response.cookies.set(GITHUB_OAUTH_STATE_COOKIE, "", {
		...getCookieOptions(),
		maxAge: 0,
	});
	response.cookies.set(GITHUB_OAUTH_RETURN_TO_COOKIE, "", {
		...getCookieOptions(),
		maxAge: 0,
	});
};

export const normalizeReturnTo = (input: string | null) => {
	if (!input || !input.startsWith("/")) {
		return "/";
	}
	if (input.startsWith("//")) {
		return "/";
	}
	return input;
};
