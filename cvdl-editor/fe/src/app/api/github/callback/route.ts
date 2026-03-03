import { NextRequest, NextResponse } from "next/server";
import {
	clearGithubOauthState,
	normalizeReturnTo,
	readGithubOauthState,
	writeGithubSession,
} from "@/lib/githubSession";

export const runtime = "nodejs";

const githubJsonHeaders = (token?: string): HeadersInit => {
	const headers: HeadersInit = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	return headers;
};

const redirectWithStatus = (
	request: NextRequest,
	returnTo: string,
	status: string,
	reason?: string,
) => {
	const redirectUrl = new URL(returnTo, request.nextUrl.origin);
	redirectUrl.searchParams.set("github", status);
	if (reason) {
		redirectUrl.searchParams.set("reason", reason);
	}
	return redirectUrl;
};

export async function GET(request: NextRequest) {
	const clientId = process.env.GITHUB_CLIENT_ID;
	const clientSecret = process.env.GITHUB_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		return NextResponse.json(
			{ error: "Missing GitHub OAuth configuration." },
			{ status: 500 },
		);
	}

	const code = request.nextUrl.searchParams.get("code");
	const providedState = request.nextUrl.searchParams.get("state");
	const { state: expectedState, returnTo: rawReturnTo } = readGithubOauthState(
		request,
	);
	const returnTo = normalizeReturnTo(rawReturnTo ?? "/");

	if (!code || !providedState || !expectedState || providedState !== expectedState) {
		const response = NextResponse.redirect(
			redirectWithStatus(request, returnTo, "error", "invalid_state"),
		);
		clearGithubOauthState(response);
		return response;
	}

	const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
		}),
	});
	const tokenData = (await tokenResponse.json()) as {
		access_token?: string;
		scope?: string;
		token_type?: string;
		error?: string;
	};

	if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
		const response = NextResponse.redirect(
			redirectWithStatus(request, returnTo, "error", "token_exchange_failed"),
		);
		clearGithubOauthState(response);
		return response;
	}

	const profileResponse = await fetch("https://api.github.com/user", {
		headers: githubJsonHeaders(tokenData.access_token),
	});
	const profileData = profileResponse.ok
		? ((await profileResponse.json()) as {
				login?: string;
				name?: string;
				avatar_url?: string;
		  })
		: null;

	const response = NextResponse.redirect(
		redirectWithStatus(request, returnTo, "connected"),
	);
	writeGithubSession(response, {
		accessToken: tokenData.access_token,
		scope: tokenData.scope ?? "",
		tokenType: tokenData.token_type ?? "bearer",
		login: profileData?.login,
		name: profileData?.name,
		avatarUrl: profileData?.avatar_url,
		createdAt: Date.now(),
	});
	clearGithubOauthState(response);
	return response;
}
