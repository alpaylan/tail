import { NextRequest, NextResponse } from "next/server";
import { readGithubSession } from "@/lib/githubSession";

export const runtime = "nodejs";

const githubHeaders = (token: string): HeadersInit => ({
	Authorization: `Bearer ${token}`,
	Accept: "application/vnd.github+json",
	"X-GitHub-Api-Version": "2022-11-28",
	"Content-Type": "application/json",
});

type CreateGistBody = {
	content?: string;
	fileName?: string;
	description?: string;
	isPublic?: boolean;
};

const normalizeFileName = (input: string | undefined) => {
	const fallback = "resume.json";
	if (!input) {
		return fallback;
	}
	const trimmed = input.trim();
	if (!trimmed) {
		return fallback;
	}
	return trimmed.replace(/[\\/]/g, "-");
};

export async function POST(request: NextRequest) {
	const session = readGithubSession(request);
	if (!session) {
		return NextResponse.json(
			{ error: "GitHub account is not connected." },
			{ status: 401 },
		);
	}

	let body: CreateGistBody;
	try {
		body = (await request.json()) as CreateGistBody;
	} catch {
		return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
	}

	if (!body.content || typeof body.content !== "string" || !body.content.trim()) {
		return NextResponse.json(
			{ error: "Missing resume JSON content." },
			{ status: 400 },
		);
	}

	const fileName = normalizeFileName(body.fileName);
	const createResponse = await fetch("https://api.github.com/gists", {
		method: "POST",
		headers: githubHeaders(session.accessToken),
		body: JSON.stringify({
			description: body.description ?? "Tail Resume",
			public: body.isPublic ?? true,
			files: {
				[fileName]: {
					content: body.content,
				},
			},
		}),
	});
	const createData = await createResponse.json();

	if (!createResponse.ok) {
		return NextResponse.json(
			{
				error:
					(createData as { message?: string }).message ??
					"GitHub gist creation failed.",
			},
			{ status: createResponse.status },
		);
	}

	const gist = createData as {
		id: string;
		html_url: string;
		files?: Record<string, unknown>;
		updated_at: string;
	};
	return NextResponse.json({
		id: gist.id,
		htmlUrl: gist.html_url,
		fileName,
		updatedAt: gist.updated_at,
		files: Object.keys(gist.files ?? {}),
	});
}
