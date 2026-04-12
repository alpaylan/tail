import { NextRequest, NextResponse } from "next/server";
import { readGithubSession } from "@/lib/githubSession";

export const runtime = "nodejs";

const githubHeaders = (token: string): HeadersInit => ({
	Accept: "application/vnd.github+json",
	"X-GitHub-Api-Version": "2022-11-28",
	"Content-Type": "application/json",
	Authorization: `Bearer ${token}`,
});

type GithubGistFile = {
	filename: string;
};

type GithubGistResponse = {
	id: string;
	html_url: string;
	updated_at: string;
	files?: Record<string, GithubGistFile>;
	message?: string;
};

type UpdateGistBody = {
	content?: string;
	fileName?: string;
	description?: string;
};

const selectGistFile = (gist: GithubGistResponse): GithubGistFile | null => {
	const files = Object.values(gist.files ?? {});
	if (files.length === 0) {
		return null;
	}

	const jsonFile = files.find((file) => file.filename.endsWith(".json"));
	return jsonFile ?? files[0];
};

const parseGistId = (input: string) => input.trim().replace(/\/+$/, "");

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { gistId: string } },
) {
	const session = readGithubSession(request);
	if (!session) {
		return NextResponse.json(
			{ error: "GitHub account is not connected." },
			{ status: 401 },
		);
	}

	let body: UpdateGistBody;
	try {
		body = (await request.json()) as UpdateGistBody;
	} catch {
		return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
	}

	if (
		!body.content ||
		typeof body.content !== "string" ||
		!body.content.trim()
	) {
		return NextResponse.json(
			{ error: "Missing resume JSON content." },
			{ status: 400 },
		);
	}

	const gistId = parseGistId(params.gistId);
	let fileName = body.fileName?.trim();
	if (!fileName) {
		const existingResponse = await fetch(
			`https://api.github.com/gists/${gistId}`,
			{
				headers: githubHeaders(session.accessToken),
			},
		);
		const existingData = (await existingResponse.json()) as GithubGistResponse;
		if (!existingResponse.ok) {
			return NextResponse.json(
				{ error: existingData.message ?? "Failed to load gist metadata." },
				{ status: existingResponse.status },
			);
		}
		fileName = selectGistFile(existingData)?.filename ?? "resume.json";
	}

	const updateResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
		method: "PATCH",
		headers: githubHeaders(session.accessToken),
		body: JSON.stringify({
			description: body.description,
			files: {
				[fileName]: {
					content: body.content,
				},
			},
		}),
	});
	const updateData = (await updateResponse.json()) as GithubGistResponse;
	if (!updateResponse.ok) {
		return NextResponse.json(
			{ error: updateData.message ?? "Failed to update gist." },
			{ status: updateResponse.status },
		);
	}

	return NextResponse.json({
		id: updateData.id,
		htmlUrl: updateData.html_url,
		fileName,
		updatedAt: updateData.updated_at,
	});
}
