import { NextResponse } from "next/server";
import { clearGithubSession } from "@/lib/githubSession";

export const runtime = "nodejs";

export async function POST() {
	const response = NextResponse.json({ ok: true });
	clearGithubSession(response);
	return response;
}
