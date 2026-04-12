import { NextRequest, NextResponse } from "next/server";
import {
	getDebugStateSnapshot,
	setDebugStateSnapshot,
} from "@/lib/debugStateStore";

const unavailableResponse = () =>
	NextResponse.json(
		{ error: "Debug state API is only available in development." },
		{ status: 404 },
	);

export async function GET() {
	if (process.env.NODE_ENV === "production") {
		return unavailableResponse();
	}

	const snapshot = getDebugStateSnapshot();
	if (!snapshot) {
		return NextResponse.json(
			{ error: "No debug snapshot captured yet." },
			{ status: 404 },
		);
	}
	return NextResponse.json(snapshot);
}

export async function POST(request: NextRequest) {
	if (process.env.NODE_ENV === "production") {
		return unavailableResponse();
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
	}

	const snapshot = setDebugStateSnapshot(body);
	return NextResponse.json({ ok: true, capturedAt: snapshot.capturedAt });
}
