import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { normalizeReturnTo, writeGithubOauthState } from "@/lib/githubSession";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	const clientId = process.env.GITHUB_CLIENT_ID;
	if (!clientId) {
		return NextResponse.json(
			{ error: "Missing GITHUB_CLIENT_ID configuration." },
			{ status: 500 },
		);
	}

	const returnTo = normalizeReturnTo(
		request.nextUrl.searchParams.get("returnTo"),
	);
	const state = randomBytes(16).toString("hex");
	const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
	authorizeUrl.searchParams.set("client_id", clientId);
	authorizeUrl.searchParams.set("scope", "gist");
	authorizeUrl.searchParams.set("state", state);
	authorizeUrl.searchParams.set("allow_signup", "true");

	const response = NextResponse.redirect(authorizeUrl);
	writeGithubOauthState(response, state, returnTo);
	return response;
}
