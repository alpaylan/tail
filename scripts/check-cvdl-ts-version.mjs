#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const cvdlTsPackageJsonPath = path.join(repoRoot, "cvdl-ts", "package.json");
const fePackageJsonPath = path.join(repoRoot, "cvdl-editor", "fe", "package.json");
const registryUrl = "https://registry.npmjs.org/cvdl-ts/latest";

const fail = (message) => {
	console.error(`cvdl-ts version check failed: ${message}`);
	process.exit(1);
};

const readJsonFile = (filePath) => {
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch (error) {
		fail(`could not parse ${filePath}: ${String(error)}`);
	}
};

const runGit = (args) => {
	try {
		return execFileSync("git", args, {
			cwd: repoRoot,
			encoding: "utf8",
		}).trim();
	} catch (error) {
		fail(`git command failed (git ${args.join(" ")}): ${String(error)}`);
	}
};

const gitCommitExists = (sha) => {
	try {
		execFileSync("git", ["cat-file", "-e", `${sha}^{commit}`], {
			cwd: repoRoot,
			stdio: "ignore",
		});
		return true;
	} catch {
		return false;
	}
};

const extractVersionFromSpec = (spec) => {
	const match = spec.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/);
	return match ? match[0] : null;
};

const parseSemver = (version) => {
	const semverMatch = version.match(
		/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/,
	);
	if (!semverMatch) {
		return null;
	}
	return {
		major: Number(semverMatch[1]),
		minor: Number(semverMatch[2]),
		patch: Number(semverMatch[3]),
		preRelease: semverMatch[4] ?? null,
	};
};

const comparePreRelease = (a, b) => {
	if (a === b) return 0;
	if (a === null) return 1;
	if (b === null) return -1;

	const aParts = a.split(".");
	const bParts = b.split(".");
	const maxLength = Math.max(aParts.length, bParts.length);

	for (let i = 0; i < maxLength; i++) {
		const aPart = aParts[i];
		const bPart = bParts[i];
		if (aPart === undefined) return -1;
		if (bPart === undefined) return 1;

		const aNumeric = /^\d+$/.test(aPart);
		const bNumeric = /^\d+$/.test(bPart);

		if (aNumeric && bNumeric) {
			const aNum = Number(aPart);
			const bNum = Number(bPart);
			if (aNum > bNum) return 1;
			if (aNum < bNum) return -1;
			continue;
		}

		if (aNumeric && !bNumeric) return -1;
		if (!aNumeric && bNumeric) return 1;
		if (aPart > bPart) return 1;
		if (aPart < bPart) return -1;
	}

	return 0;
};

const compareSemver = (a, b) => {
	const parsedA = parseSemver(a);
	const parsedB = parseSemver(b);
	if (!parsedA || !parsedB) {
		fail(`invalid semver comparison between "${a}" and "${b}"`);
	}

	if (parsedA.major !== parsedB.major) {
		return parsedA.major > parsedB.major ? 1 : -1;
	}
	if (parsedA.minor !== parsedB.minor) {
		return parsedA.minor > parsedB.minor ? 1 : -1;
	}
	if (parsedA.patch !== parsedB.patch) {
		return parsedA.patch > parsedB.patch ? 1 : -1;
	}

	return comparePreRelease(parsedA.preRelease, parsedB.preRelease);
};

const getLatestPublishedVersion = () =>
	new Promise((resolve, reject) => {
		const request = https.get(registryUrl, (response) => {
			if (response.statusCode !== 200) {
				reject(
					new Error(`npm registry returned status ${String(response.statusCode)}`),
				);
				response.resume();
				return;
			}

			let body = "";
			response.setEncoding("utf8");
			response.on("data", (chunk) => {
				body += chunk;
			});
			response.on("end", () => {
				try {
					const parsed = JSON.parse(body);
					if (!parsed.version || typeof parsed.version !== "string") {
						reject(new Error("registry response did not include a version"));
						return;
					}
					resolve({
						version: parsed.version,
						gitHead:
							typeof parsed.gitHead === "string" ? parsed.gitHead : undefined,
					});
				} catch (error) {
					reject(error);
				}
			});
		});

		request.setTimeout(10000, () => {
			request.destroy(new Error("timed out contacting npm registry"));
		});
		request.on("error", reject);
	});

const main = async () => {
	const cvdlTsPackageJson = readJsonFile(cvdlTsPackageJsonPath);
	const fePackageJson = readJsonFile(fePackageJsonPath);

	const localCvdlTsVersion = cvdlTsPackageJson?.version;
	if (!localCvdlTsVersion || typeof localCvdlTsVersion !== "string") {
		fail(`cvdl-ts/package.json does not declare a valid version`);
	}

	const declaredDependency = fePackageJson?.dependencies?.["cvdl-ts"];
	if (!declaredDependency) {
		fail(`cvdl-editor/fe/package.json does not declare a cvdl-ts dependency`);
	}

	if (typeof declaredDependency !== "string") {
		fail(`cvdl-editor/fe/package.json has an invalid cvdl-ts dependency`);
	}

	const dependencyVersion = extractVersionFromSpec(declaredDependency);
	if (!dependencyVersion) {
		fail(
			`cvdl-editor/fe/package.json has cvdl-ts "${declaredDependency}". Use a published semver version.`,
		);
	}

	let latestPublishedVersion;
	let latestPublishedGitHead;
	try {
		const latestPublished = await getLatestPublishedVersion();
		latestPublishedVersion = latestPublished.version;
		latestPublishedGitHead = latestPublished.gitHead;
	} catch (error) {
		fail(`could not fetch latest version from npm: ${String(error)}`);
	}

	if (!latestPublishedVersion || typeof latestPublishedVersion !== "string") {
		fail("npm latest metadata did not include a valid version");
	}
	if (!latestPublishedGitHead || typeof latestPublishedGitHead !== "string") {
		fail(
			`npm latest metadata for cvdl-ts@${latestPublishedVersion} is missing gitHead; cannot perform commit-based ahead check.`,
		);
	}

	// Rule 1: local cvdl-ts commits ahead of the published gitHead -> publish first.
	if (!gitCommitExists(latestPublishedGitHead)) {
		fail(
			`published gitHead ${latestPublishedGitHead} is not present locally. Fetch full history before pushing.`,
		);
	}
	const mergeBase = runGit(["merge-base", latestPublishedGitHead, "HEAD"]);
	const headOnlyCvdlTsCommitCount = Number(
		runGit(["rev-list", "--count", `${mergeBase}..HEAD`, "--", "cvdl-ts"]),
	);
	if (Number.isNaN(headOnlyCvdlTsCommitCount)) {
		fail("could not compute commit count for cvdl-ts changes");
	}
	if (headOnlyCvdlTsCommitCount > 0) {
		fail(
			`cvdl-ts has ${headOnlyCvdlTsCommitCount} local commit(s) not in published gitHead ${latestPublishedGitHead}. Publish a new cvdl-ts version before pushing.`,
		);
	}

	// Rule 2: frontend dependency lags behind npm latest -> update dependency.
	if (compareSemver(dependencyVersion, latestPublishedVersion) < 0) {
		fail(
			`cvdl-editor/fe depends on cvdl-ts "${declaredDependency}" (resolved "${dependencyVersion}") but latest published is "${latestPublishedVersion}". Update cvdl-editor/fe/package.json.`,
		);
	}

	console.log(
		`cvdl-ts push check passed (localVersion=${localCvdlTsVersion}, dependency=${declaredDependency}, latest=${latestPublishedVersion}, publishedGitHead=${latestPublishedGitHead})`,
	);
};

void main();
