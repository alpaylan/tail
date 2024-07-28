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
	return { tag: "String", value: obj[key] ?? "" }
};

const getUrl = (obj: any, key: string): ItemContent.t => {
	return {
		tag: "Url", value: {
			text: obj[key] ?? "",
			url: obj.url ?? ""
		}
	};
}

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
				"name": getUrl(w, "name"),
				"position": get(w, "position"),
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
				"organization": getUrl(v, "organization"),
				"position": get(v, "position"),
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
				"institution": getUrl(e, "institution"),
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
				"name": getUrl(c, "name"),
				"date": get(c, "date"),
				"issuer": get(c, "issuer"),
			}))) : []
	);

	const publications: ResumeSection.t = ResumeSection.resumeSection(
		"Publications",
		"Publications",
		"Publications",
		injId({}),
		json.publications ? json.publications.map(
			(p) => (injId({
				"name": getUrl(p, "name"),
				"publisher": get(p, "publisher"),
				"releaseDate": get(p, "releaseDate"),
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
				"name": getUrl(p, "name"),
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

export const convertBack = (resume: Resume.t): JsonResume => {
	let jsonResume: JsonResume = {};
	const basics = resume.sections.find((section) => section.section_name === "Basics");

	jsonResume.basics = {
		name: (basics?.data.fields.name as ItemContent.PureString).value,
		email: (basics?.data.fields.email as ItemContent.PureString).value,
		phone: (basics?.data.fields.phone as ItemContent.PureString).value,
	}

	const work = resume.sections.find((section) => section.section_name === "Work Experience");

	jsonResume.work = work?.items.map((item) => ({
		name: (item.fields.name as ItemContent.Url).value.text,
		position: (item.fields.position as ItemContent.PureString).value,
		url: (item.fields.name as ItemContent.Url).value.url,
		startDate: (item.fields.startDate as ItemContent.PureString).value,
		endDate: (item.fields.endDate as ItemContent.PureString).value,
		summary: (item.fields.summary as ItemContent.PureString).value,
		highlights: (item.fields.highlights as ItemContent.List).value.map((highlight) => (highlight.value)),
	}))

	const volunteer = resume.sections.find((section) => section.section_name === "Volunteer Experience");

	jsonResume.volunteer = volunteer?.items.map((item) => ({
		organization: (item.fields.organization as ItemContent.Url).value.text,
		position: (item.fields.position as ItemContent.PureString).value,
		url: (item.fields.organization as ItemContent.Url).value.url,
		startDate: (item.fields.startDate as ItemContent.PureString).value,
		endDate: (item.fields.endDate as ItemContent.PureString).value,
		summary: (item.fields.summary as ItemContent.PureString).value,
		highlights: (item.fields.highlights as ItemContent.List).value.map((highlight) => (highlight.value)),
	}))

	const education = resume.sections.find((section) => section.section_name === "Education");

	jsonResume.education = education?.items.map((item) => ({
		institution: (item.fields.institution as ItemContent.Url).value.text,
		url: (item.fields.institution as ItemContent.Url).value.url,
		area: (item.fields.area as ItemContent.PureString).value,
		studyType: (item.fields.studyType as ItemContent.PureString).value,
		startDate: (item.fields.startDate as ItemContent.PureString).value,
		endDate: (item.fields.endDate as ItemContent.PureString).value,
		score: (item.fields.score as ItemContent.PureString).value,
		courses: (item.fields.courses as ItemContent.List).value.map((course) => (course.value)),
	}))

	const awards = resume.sections.find((section) => section.section_name === "Awards");

	jsonResume.awards = awards?.items.map((item) => ({
		title: (item.fields.title as ItemContent.PureString).value,
		date: (item.fields.date as ItemContent.PureString).value,
		awarder: (item.fields.awarder as ItemContent.PureString).value,
		summary: (item.fields.summary as ItemContent.PureString).value,
	}))

	const certificates = resume.sections.find((section) => section.section_name === "Certificates");

	jsonResume.certificates = certificates?.items.map((item) => ({
		name: (item.fields.name as ItemContent.Url).value.text,
		url: (item.fields.name as ItemContent.Url).value.url,
		date: (item.fields.date as ItemContent.PureString).value,
		issuer: (item.fields.issuer as ItemContent.PureString).value,
	}))

	const publications = resume.sections.find((section) => section.section_name === "Publications");

	jsonResume.publications = publications?.items.map((item) => ({
		name: (item.fields.name as ItemContent.Url).value.text,
		url: (item.fields.name as ItemContent.Url).value.url,
		publisher: (item.fields.publisher as ItemContent.PureString).value,
		releaseDate: (item.fields.releaseDate as ItemContent.PureString).value,
		summary: (item.fields.summary as ItemContent.PureString).value,
	}))

	const skills = resume.sections.find((section) => section.section_name === "Skills");

	jsonResume.skills = skills?.items.map((item) => ({
		name: (item.fields.name as ItemContent.PureString).value,
		level: (item.fields.level as ItemContent.PureString).value,
		keywords: (item.fields.keywords as ItemContent.List).value.map((keyword) => (keyword.value)),
	}))

	const languages = resume.sections.find((section) => section.section_name === "Languages");

	jsonResume.languages = languages?.items.map((item) => ({
		language: (item.fields.language as ItemContent.PureString).value,
		fluency: (item.fields.fluency as ItemContent.PureString).value,
	}))

	const interests = resume.sections.find((section) => section.section_name === "Interests");

	jsonResume.interests = interests?.items.map((item) => ({
		name: (item.fields.name as ItemContent.PureString).value,
		keywords: (item.fields.keywords as ItemContent.List).value.map((keyword) => (keyword.value)),
	}))

	const references = resume.sections.find((section) => section.section_name === "References");

	jsonResume.references = references?.items.map((item) => ({
		name: (item.fields.name as ItemContent.PureString).value,
		reference: (item.fields.reference as ItemContent.PureString).value,
	}))

	const projects = resume.sections.find((section) => section.section_name === "Projects");

	jsonResume.projects = projects?.items.map((item) => ({
		name: (item.fields.name as ItemContent.Url).value.text,
		url: (item.fields.name as ItemContent.Url).value.url,
		startDate: (item.fields.startDate as ItemContent.PureString).value,
		endDate: (item.fields.endDate as ItemContent.PureString).value,
		description: (item.fields.description as ItemContent.PureString).value,
		highlights: (item.fields.highlights as ItemContent.List).value.map((highlight) => (highlight.value)),
	}))



	return jsonResume;
}