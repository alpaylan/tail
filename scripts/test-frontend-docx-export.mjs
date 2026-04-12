import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const Defaults = require("../cvdl-ts/dist/Defaults.js");

const HOST = "127.0.0.1";
const PORT = 3011;
const baseUrl = process.env.TAIL_FRONTEND_TEST_BASE_URL || `http://${HOST}:${PORT}`;
const fontRoot = path.join(repoRoot, "cvdl-ts", "assets", "fonts");

function resolveBrowserExecutable() {
	const candidates = [
		chromium.executablePath(),
		"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
		"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
		"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
	];

	for (const candidate of candidates) {
		if (candidate && fs.existsSync(candidate)) {
			return candidate;
		}
	}

	throw new Error("Could not find a Chromium-based browser executable for Playwright.");
}

function clone(value) {
	return structuredClone(value);
}

function buildFrontendSeed() {
	const resume = clone(Defaults.DefaultResume);
	resume.name = "FrontendDocxHarness";

	const basics = resume.sections.find((section) => section.section_name === "Basics");
	assert.ok(basics, "Expected Basics section in default resume");
	basics.data.fields.name.value = "Frontend Harness";
	basics.data.fields.email.value = "frontend@tail.test";

	const work = resume.sections.find(
		(section) => section.section_name === "Work Experience",
	);
	assert.ok(work, "Expected Work Experience section in default resume");
	work.items = work.items.slice(0, 1);
	work.items[0].fields.summary = {
		tag: "String",
		value: "Testing custom emoji :geyik: in markdown output",
	};

	return {
		version: "0.1.3",
		activeResume: resume.name,
		resumes: [resume],
		dataSchemas: clone(Defaults.DefaultDataSchemas),
		layoutSchemas: clone(
			Defaults.DefaultLayoutSchemas.map((schema) =>
				typeof schema.toJson === "function" ? schema.toJson() : schema,
			),
		),
		resumeLayouts: [clone(Defaults.DefaultResumeLayout)],
	};
}

function startFrontendServer() {
	const child =
		process.platform === "win32"
			? spawn(
					process.env.ComSpec || "cmd.exe",
					[
						"/d",
						"/s",
						"/c",
						`npm run dev --workspace cvdl-editor/fe -- --hostname ${HOST} --port ${PORT}`,
					],
					{
						cwd: repoRoot,
						env: { ...process.env, NODE_ENV: "development" },
						stdio: ["ignore", "pipe", "pipe"],
					},
				)
			: spawn(
					"npm",
					[
						"run",
						"dev",
						"--workspace",
						"cvdl-editor/fe",
						"--",
						"--hostname",
						HOST,
						"--port",
						String(PORT),
					],
					{
						cwd: repoRoot,
						env: { ...process.env, NODE_ENV: "development" },
						stdio: ["ignore", "pipe", "pipe"],
					},
				);

	let output = "";
	child.stdout.on("data", (chunk) => {
		output += chunk.toString();
		if (output.length > 16000) output = output.slice(-16000);
	});
	child.stderr.on("data", (chunk) => {
		output += chunk.toString();
		if (output.length > 16000) output = output.slice(-16000);
	});

	return { child, getOutput: () => output };
}

async function waitForServer(server) {
	const deadline = Date.now() + 120000;
	while (Date.now() < deadline) {
		if (server.child.exitCode !== null) {
			throw new Error(`Frontend server exited early\n${server.getOutput()}`);
		}

		try {
			const response = await fetch(baseUrl, { redirect: "manual" });
			if (response.ok || response.status === 307 || response.status === 308) {
				return;
			}
		} catch {
			// retry until timeout
		}

		await delay(500);
	}

	throw new Error(`Timed out waiting for frontend server\n${server.getOutput()}`);
}

async function stopFrontendServer(server) {
	if (server.child.exitCode !== null) return;

	server.child.kill("SIGTERM");
	await Promise.race([
		new Promise((resolve) => server.child.once("exit", resolve)),
		delay(5000),
	]);

	if (server.child.exitCode === null) {
		server.child.kill("SIGKILL");
		await Promise.race([
			new Promise((resolve) => server.child.once("exit", resolve)),
			delay(5000),
		]);
	}
}

async function openArchive(filePath) {
	return JSZip.loadAsync(fs.readFileSync(filePath));
}

async function listArchiveEntries(filePath) {
	const archive = await openArchive(filePath);
	return Object.keys(archive.files);
}

async function readArchiveEntry(filePath, entryPath) {
	const archive = await openArchive(filePath);
	const entry = archive.file(entryPath);
	assert.ok(entry, `Missing DOCX entry ${entryPath}`);
	return entry.async("string");
}

async function main() {
	const server =
		process.env.TAIL_FRONTEND_TEST_BASE_URL ? null : startFrontendServer();
	const seed = buildFrontendSeed();

	try {
		if (server) {
			await waitForServer(server);
		}
		console.log(`Using frontend test target ${baseUrl}`);
		const browserExecutable = resolveBrowserExecutable();
		console.log(`Using browser executable ${browserExecutable}`);

		const browser = await chromium.launch({
			headless: true,
			executablePath: browserExecutable,
		});
		try {
			const context = await browser.newContext({ acceptDownloads: true });

			await context.route(
				"https://d2bnplhbawocbk.cloudfront.net/data/fonts/*",
				async (route) => {
					const url = new URL(route.request().url());
					const fontName = path.basename(url.pathname);
					const localFontPath = path.join(fontRoot, fontName);
					if (!fs.existsSync(localFontPath)) {
						await route.abort();
						return;
					}

					await route.fulfill({
						status: 200,
						contentType: "font/ttf",
						body: fs.readFileSync(localFontPath),
					});
				},
			);

			await context.addInitScript((payload) => {
				window.__tailCapturedDownloads = [];
				window.__tailFrontendErrors = [];
				const originalAnchorClick = HTMLAnchorElement.prototype.click;
				HTMLAnchorElement.prototype.click = function (...args) {
					if (this.download) {
						window.__tailCapturedDownloads.push({
							download: this.download,
							href: this.href,
						});
					}
					return originalAnchorClick.apply(this, args);
				};
				window.addEventListener("error", (event) => {
					window.__tailFrontendErrors.push({
						type: "error",
						message: event.message,
					});
				});
				window.addEventListener("unhandledrejection", (event) => {
					window.__tailFrontendErrors.push({
						type: "unhandledrejection",
						message:
							event.reason instanceof Error
								? event.reason.stack || event.reason.message
								: String(event.reason),
					});
				});

				localStorage.clear();
				localStorage.setItem("version", payload.version);
				localStorage.setItem("resumes", JSON.stringify(payload.resumes));
				localStorage.setItem("data_schemas", JSON.stringify(payload.dataSchemas));
				localStorage.setItem(
					"section_layouts",
					JSON.stringify(payload.layoutSchemas),
				);
				localStorage.setItem(
					"resume_layouts",
					JSON.stringify(payload.resumeLayouts),
				);
				localStorage.setItem("tail_active_resume", payload.activeResume);
			}, seed);

			const page = await context.newPage();
			const consoleErrors = [];
			page.on("console", (msg) => {
				if (["error", "warning"].includes(msg.type())) {
					consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
				}
			});
			page.on("pageerror", (error) => {
				consoleErrors.push(`[pageerror] ${error.stack || error.message}`);
			});
			console.log("Opening frontend page");
			await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

			console.log("Waiting for preview container");
			await page.locator("#pdf-container").waitFor();
			console.log("Waiting for seeded content");
			await page.locator("text=Frontend Harness").first().waitFor();
			console.log("Waiting for preview emoji image");
			await page.locator('#pdf-container img[src*="geyik.png"]').waitFor();

			const exportButton = page
				.locator("button")
				.filter({ has: page.locator("select") })
				.filter({ hasText: "Export" })
				.first();
			await exportButton.locator("select").selectOption("1");
			await page.waitForTimeout(250);
			const exportLabel = exportButton.locator("span", { hasText: "Export" }).first();

			console.log("Triggering DOCX download");
			await exportLabel.click();
			try {
				await page.waitForFunction(
					() =>
						Array.isArray(window.__tailCapturedDownloads) &&
						window.__tailCapturedDownloads.some((download) =>
							String(download?.download || "").endsWith(".docx"),
						),
				);
			} catch (error) {
				const capturedDownloads = await page.evaluate(
					() => window.__tailCapturedDownloads || [],
				);
				const frontendErrors = await page.evaluate(
					() => window.__tailFrontendErrors || [],
				);
				console.error("Captured downloads before timeout:", capturedDownloads);
				console.error("Frontend errors before timeout:", frontendErrors);
				console.error("Console/page errors before timeout:", consoleErrors);
				throw error;
			}

			const capturedDownload = await page.evaluate(async () => {
				const download = window.__tailCapturedDownloads.findLast((entry) =>
					String(entry?.download || "").endsWith(".docx"),
				);
				if (!download) return null;

				const response = await fetch(download.href);
				const buffer = await response.arrayBuffer();
				return {
					download: download.download,
					bytes: Array.from(new Uint8Array(buffer)),
				};
			});
			assert.ok(capturedDownload, "Expected frontend export to capture a DOCX blob");
			assert.equal(
				capturedDownload.download,
				"FrontendDocxHarness.docx",
				"Expected DOCX download filename from frontend export",
			);

			const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tail-frontend-docx-"));
			const downloadPath = path.join(tmpDir, "frontend-docx-export.docx");
			try {
				fs.writeFileSync(downloadPath, Buffer.from(capturedDownload.bytes));
				const entries = await listArchiveEntries(downloadPath);
				const documentXml = await readArchiveEntry(downloadPath, "word/document.xml");

				assert.ok(
					entries.some(
						(entry) =>
							entry.startsWith("word/media/") &&
							entry.toLowerCase().endsWith(".png"),
					),
					"Expected frontend DOCX export to embed an emoji image",
				);
				assert.ok(
					documentXml.includes("<w:drawing>"),
					"Expected frontend DOCX export to contain drawing markup",
				);
				assert.ok(
					!documentXml.includes("WTF"),
					'Expected frontend DOCX export to avoid the internal "WTF" placeholder',
				);
			} finally {
				fs.rmSync(tmpDir, { recursive: true, force: true });
			}
		} finally {
			await browser.close();
		}

		console.log("Frontend DOCX export smoke test passed");
	} finally {
		if (server) {
			await stopFrontendServer(server);
		}
	}
}

main().catch((error) => {
	console.error("Frontend DOCX export smoke test failed");
	console.error(error);
	process.exitCode = 1;
});
