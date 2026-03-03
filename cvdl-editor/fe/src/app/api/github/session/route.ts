import { NextRequest, NextResponse } from "next/server";
import { readGithubSession } from "@/lib/githubSession";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	const session = readGithubSession(request);
	if (!session) {
		return NextResponse.json({ connected: false });
	}

	return NextResponse.json({
		connected: true,
		login: session.login ?? null,
		name: session.name ?? null,
		avatarUrl: session.avatarUrl ?? null,
		scope: session.scope ?? "",
	});
}
