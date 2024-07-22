// Import a jsonresume file and convert it to a resume object/
import { ItemContent, ResumeSection } from "cvdl-ts/dist/Resume";
import * as Resume from "cvdl-ts/dist/Resume";
import * as Utils from "cvdl-ts/dist/Utils";
import { Item } from "cvdl-ts/dist/Resume";

export type JsonResume = {
	basics?: {
		name?: string;
		label?: string;
		image?: string;
		email?: string;
		phone?: string;
		url?: string;
		summary?: string;
		location?: {
			address?: string;
			postalCode?: string;
			city?: string;
			countryCode?: string;
			region?: string;
		};
		profiles?: {
			network?: string;
			username?: string;
			url?: string;
		};
	};
	work?: {
		name?: string;
		position?: string;
		url?: string;
		startDate?: string;
		endDate?: string;
		summary?: string;
		highlights?: string[];
	}[];
	volunteer?: {
		organization?: string;
		position?: string;
		url?: string;
		startDate?: string;
		endDate?: string;
		summary?: string;
		highlights?: string[];
	}[];
	education?: {
		institution?: string;
		url?: string;
		area?: string;
		studyType?: string;
		startDate?: string;
		endDate?: string;
		score?: string;
		courses?: string[];
	}[];
	awards?: {
		title?: string;
		date?: string;
		awarder?: string;
		summary?: string;
	}[];
	certificates?: {
		name?: string;
		date?: string;
		issuer?: string;
		url?: string;
	}[];
	publications?: {
		name?: string;
		publisher?: string;
		releaseDate?: string;
		url?: string;
		summary?: string;
	}[];
	skills?: {
		name?: string;
		level?: string;
		keywords?: string[];
	}[];
	languages?: {
		language?: string;
		fluency?: string;
	}[];
	interests?: {
		name?: string;
		keywords?: string[];
	}[];
	references?: {
		name?: string;
		reference?: string;
	}[];
	projects?: {
		name?: string;
		startDate?: string;
		endDate?: string;
		description?: string;
		highlights?: string[];
		url?: string;
	}[];
};

const get = (obj: any, key: string): ItemContent.t => {
	return obj[key]
		? { tag: "String", value: obj[key] }
		: { tag: "String", value: "" };
};

const injId = (content: { [key: string]: ItemContent.t }): Item => {
	return {
		id: Utils.randomString(),
		fields: content
	};
}

export const convert = (json: JsonResume): Resume.t => {
	const basics: ResumeSection.t = ResumeSection.resumeSection(
		"Basics",
		"Basics",
		"Basics",
		injId({
			"name": get(json.basics, "name"),
			"email": get(json.basics, "email"),
			"phone": get(json.basics, "phone"),
		}),
		[]
	);

	const work: ResumeSection.t = ResumeSection.resumeSection(
		"Work Experience",
		"Work Experience",
		"Work Experience",
		injId({}),
		json.work ? json.work.map((w) => {
			return injId({
				"name": get(w, "name"),
				"position": get(w, "position"),
				"url": get(w, "url"),
				"startDate": get(w, "startDate"),
				"endDate": get(w, "endDate"),
				"summary": get(w, "summary"),
				"highlights": {
					tag: "List",
					value: w.highlights ? w.highlights.map((h) => {
						return { tag: "String", value: h };
					}) : [],
				},
			});
		}) : []
	);

	const volunteer: ResumeSection.t = ResumeSection.resumeSection(
		"Volunteer Experience",
		"Volunteer Experience",
		"Volunteer Experience",
		injId({}),
		json.volunteer ? json.volunteer.map(
			(v) => (injId({
				"organization": get(v, "organization"),
				"position": get(v, "position"),
				"url": get(v, "url"),
				"startDate": get(v, "startDate"),
				"endDate": get(v, "endDate"),
				"summary": get(v, "summary"),
				"highlights":
				{
					tag: "List",
					value:
						v.highlights ? v.highlights.map((h: string) => ({
							tag: "String",
							value: h,
						})) : [],
				}
			}))) : []
	);

	const education: ResumeSection.t = ResumeSection.resumeSection(
		"Education",
		"Education",
		"Education",
		injId({}),
		json.education ? json.education.map(
			(e) => (injId({
				"institution": get(e, "institution"),
				"url": get(e, "url"),
				"area": get(e, "area"),
				"studyType": get(e, "studyType"),
				"startDate": get(e, "startDate"),
				"endDate": get(e, "endDate"),
				"score": get(e, "score"),
				"courses": {
					tag: "List",
					value: e.courses ? e.courses.map((c: string) => ({
						tag: "String",
						value: c,
					})) : [],
				},
			}))) : []
	);

	const awards: ResumeSection.t = ResumeSection.resumeSection(
		"Awards",
		"Awards",
		"Awards",
		injId({}),
		json.awards ? json.awards.map(
			(a) => (injId({
				"title": get(a, "title"),
				"date": get(a, "date"),
				"awarder": get(a, "awarder"),
				"summary": get(a, "summary"),
			}))) : []
	);


	const certificates: ResumeSection.t = ResumeSection.resumeSection(
		"Certificates",
		"Certificates",
		"Certificates",
		injId({}),
		json.certificates ? json.certificates.map(
			(c) => (injId({
				"name": get(c, "name"),
				"date": get(c, "date"),
				"issuer": get(c, "issuer"),
				"url": get(c, "url"),
			}))) : []
	);

	const publications: ResumeSection.t = ResumeSection.resumeSection(
		"Publications",
		"Publications",
		"Publications",
		injId({}),
		json.publications ? json.publications.map(
			(p) => (injId({
				"name": get(p, "name"),
				"publisher": get(p, "publisher"),
				"releaseDate": get(p, "releaseDate"),
				"url": get(p, "url"),
				"summary": get(p, "summary"),
			}))) : []
	);

	const skills: ResumeSection.t = ResumeSection.resumeSection(
		"Skills",
		"Skills",
		"Skills",
		injId({}),
		json.skills ? json.skills.map(
			(s) => (injId({
				"name": get(s, "name"),
				"level": get(s, "level"),
				"keywords": {
					tag: "List",
					value: s.keywords ? s.keywords.map((k: string) => ({
						tag: "String",
						value: k,
					})) : [],
				},
			}))) : []
	);

	const languages: ResumeSection.t = ResumeSection.resumeSection(
		"Languages",
		"Languages",
		"Languages",
		injId({}),
		json.languages ? json.languages.map(
			(l) => (injId({
				"language": get(l, "language"),
				"fluency": get(l, "fluency"),
			}))) : []
	);

	const interests: ResumeSection.t = ResumeSection.resumeSection(
		"Interests",
		"Interests",
		"Interests",
		injId({}),
		json.interests ? json.interests.map(
			(i) => (injId({
				"name": get(i, "name"),
				"keywords": {
					tag: "List",
					value: i.keywords ? i.keywords.map((k: string) => ({
						tag: "String",
						value: k,
					})) : [],
				},
			}))) : []
	);

	const references: ResumeSection.t = ResumeSection.resumeSection(
		"References",
		"References",
		"References",
		injId({}),
		json.references ? json.references.map(
			(r) => (injId({
				"name": get(r, "name"),
				"reference": get(r, "reference"),
			}))) : []
	);

	const projects: ResumeSection.t = ResumeSection.resumeSection(
		"Projects",
		"Projects",
		"Projects",
		injId({}),
		json.projects ? json.projects.map(
			(p) => (injId({
				"name": get(p, "name"),
				"startDate": get(p, "startDate"),
				"endDate": get(p, "endDate"),
				"description": get(p, "description"),
				"highlights": {
					tag: "List",
					value: p.highlights ? p.highlights.map((h: string) => ({
						tag: "String",
						value: h,
					})) : [],
				},
				"url": get(p, "url"),
			}))) : []
	);

	return Resume.resume(
		ItemContent.toString(get(json.basics, "name")),
		"SingleColumnSchema",
		[
			basics,
			work,
			volunteer,
			education,
			awards,
			certificates,
			publications,
			skills,
			languages,
			interests,
			references,
			projects,
		]
	);
};
