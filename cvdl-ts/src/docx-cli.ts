import { readFileSync, writeFileSync } from "fs";
import { FontDict } from "./AnyLayout";
import * as Defaults from "./Defaults";
import * as DocxLayout from "./DocxLayout";
import * as Resume from "./Resume";
import { ResumeSection } from "./Resume";
import * as ItemContent from "./Resume";
import { FileStorage } from "./FileStorage";
import * as Utils from "./Utils";

// Convert a JsonResume JSON object to Tail's Resume.t format
function jsonResumeToTail(json: Record<string, unknown>): Resume.t {
	const sections: ResumeSection.t[] = [];

	const str = (v: unknown): ItemContent.ItemContent.t =>
		({ tag: "String", value: String(v ?? "") }) as ItemContent.ItemContent.PureString;

	const url = (
		text: unknown,
		href: unknown,
	): ItemContent.ItemContent.t =>
		({
			tag: "Url",
			value: { text: String(text ?? ""), url: String(href ?? "") },
		}) as ItemContent.ItemContent.Url;

	const list = (arr: unknown[]): ItemContent.ItemContent.t =>
		({
			tag: "List",
			value: (arr ?? []).map(
				(v) => ({ tag: "String", value: String(v) }) as ItemContent.ItemContent.PureString,
			),
		}) as ItemContent.ItemContent.List;

	const id = () => Utils.randomString();

	// Basics
	const basics = json.basics as Record<string, string> | undefined;
	if (basics) {
		sections.push(
			ResumeSection.resumeSection("Basics", "Basics", "Basics", {
				id: id(),
				fields: {
					name: str(basics.name),
					email: str(basics.email),
					phone: str(basics.phone),
				},
			}, []),
		);
	}

	// Work
	const work = json.work as Record<string, unknown>[] | undefined;
	if (work?.length) {
		sections.push(
			ResumeSection.resumeSection("Work Experience", "Work Experience", "Work Experience", {
				id: id(),
				fields: {},
			}, work.map((w) => ({
				id: id(),
				fields: {
					name: url(w.name, w.url),
					position: str(w.position),
					startDate: str(w.startDate),
					endDate: str(w.endDate),
					summary: str(w.summary),
					highlights: list(w.highlights as unknown[] ?? []),
				},
			}))),
		);
	}

	// Volunteer
	const volunteer = json.volunteer as Record<string, unknown>[] | undefined;
	if (volunteer?.length) {
		sections.push(
			ResumeSection.resumeSection("Volunteer Experience", "Volunteer Experience", "Volunteer Experience", {
				id: id(),
				fields: {},
			}, volunteer.map((v) => ({
				id: id(),
				fields: {
					organization: url(v.organization, v.url),
					position: str(v.position),
					startDate: str(v.startDate),
					endDate: str(v.endDate),
					summary: str(v.summary),
					highlights: list(v.highlights as unknown[] ?? []),
				},
			}))),
		);
	}

	// Education
	const education = json.education as Record<string, unknown>[] | undefined;
	if (education?.length) {
		sections.push(
			ResumeSection.resumeSection("Education", "Education", "Education", {
				id: id(),
				fields: {},
			}, education.map((e) => ({
				id: id(),
				fields: {
					institution: url(e.institution, e.url),
					area: str(e.area),
					studyType: str(e.studyType),
					startDate: str(e.startDate),
					endDate: str(e.endDate),
					score: str(e.score),
					courses: list(e.courses as unknown[] ?? []),
				},
			}))),
		);
	}

	// Awards
	const awards = json.awards as Record<string, unknown>[] | undefined;
	if (awards?.length) {
		sections.push(
			ResumeSection.resumeSection("Awards", "Awards", "Awards", {
				id: id(),
				fields: {},
			}, awards.map((a) => ({
				id: id(),
				fields: {
					title: str(a.title),
					date: str(a.date),
					awarder: str(a.awarder),
					summary: str(a.summary),
				},
			}))),
		);
	}

	// Certificates
	const certificates = json.certificates as Record<string, unknown>[] | undefined;
	if (certificates?.length) {
		sections.push(
			ResumeSection.resumeSection("Certificates", "Certificates", "Certificates", {
				id: id(),
				fields: {},
			}, certificates.map((c) => ({
				id: id(),
				fields: {
					name: url(c.name, c.url),
					date: str(c.date),
					issuer: str(c.issuer),
				},
			}))),
		);
	}

	// Publications
	const publications = json.publications as Record<string, unknown>[] | undefined;
	if (publications?.length) {
		sections.push(
			ResumeSection.resumeSection("Publications", "Publications", "Publications", {
				id: id(),
				fields: {},
			}, publications.map((p) => ({
				id: id(),
				fields: {
					name: url(p.name, p.url),
					publisher: str(p.publisher),
					releaseDate: str(p.releaseDate),
					summary: str(p.summary),
				},
			}))),
		);
	}

	// Skills
	const skills = json.skills as Record<string, unknown>[] | undefined;
	if (skills?.length) {
		sections.push(
			ResumeSection.resumeSection("Skills", "Skills", "Skills", {
				id: id(),
				fields: {},
			}, skills.map((s) => ({
				id: id(),
				fields: {
					name: str(s.name),
					level: str(s.level),
					keywords: list(s.keywords as unknown[] ?? []),
				},
			}))),
		);
	}

	// Languages
	const languages = json.languages as Record<string, unknown>[] | undefined;
	if (languages?.length) {
		sections.push(
			ResumeSection.resumeSection("Languages", "Languages", "Languages", {
				id: id(),
				fields: {},
			}, languages.map((l) => ({
				id: id(),
				fields: {
					language: str(l.language),
					fluency: str(l.fluency),
				},
			}))),
		);
	}

	// Interests
	const interests = json.interests as Record<string, unknown>[] | undefined;
	if (interests?.length) {
		sections.push(
			ResumeSection.resumeSection("Interests", "Interests", "Interests", {
				id: id(),
				fields: {},
			}, interests.map((i) => ({
				id: id(),
				fields: {
					name: str(i.name),
					keywords: list(i.keywords as unknown[] ?? []),
				},
			}))),
		);
	}

	// References
	const references = json.references as Record<string, unknown>[] | undefined;
	if (references?.length) {
		sections.push(
			ResumeSection.resumeSection("References", "References", "References", {
				id: id(),
				fields: {},
			}, references.map((r) => ({
				id: id(),
				fields: {
					name: str(r.name),
					reference: str(r.reference),
				},
			}))),
		);
	}

	// Projects
	const projects = json.projects as Record<string, unknown>[] | undefined;
	if (projects?.length) {
		sections.push(
			ResumeSection.resumeSection("Projects", "Projects", "Projects", {
				id: id(),
				fields: {},
			}, projects.map((p) => ({
				id: id(),
				fields: {
					name: url(p.name, p.url),
					startDate: str(p.startDate),
					endDate: str(p.endDate),
					description: str(p.description),
					highlights: list(p.highlights as unknown[] ?? []),
				},
			}))),
		);
	}

	return Resume.resume("JsonResume", "SingleColumnSchema", sections);
}

async function main() {
	const outputPath = process.argv[2] ?? "output.docx";
	const inputPath = process.argv[3];

	let resume: Resume.t;
	if (inputPath?.endsWith(".json")) {
		const json = JSON.parse(readFileSync(inputPath, "utf-8"));
		resume = jsonResumeToTail(json);
	} else if (inputPath === "comparison") {
		resume = Defaults.ComparisonResume;
	} else {
		resume = Defaults.DefaultResume;
	}

	const storage = new FileStorage("assets/fonts/");
	const fontDict = new FontDict();
	await fontDict.load_fonts(storage);

	const result = await DocxLayout.render({
		resume,
		data_schemas: Defaults.DefaultDataSchemas,
		layout_schemas: Defaults.DefaultLayoutSchemas,
		resume_layout: Defaults.DefaultResumeLayout,
		bindings: Defaults.DefaultBindings,
		fontDict,
		storage,
	});

	const buffer = new Uint8Array(await result.blob.arrayBuffer());
	writeFileSync(outputPath, buffer);
	console.log(`Document saved to ${outputPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
