import * as Stack from "./Stack";
import * as Margin from "./Margin";
import * as Font from "./Font";
import * as Elem from "./Elem";
import * as Row from "./Row";
import * as Utils from "./Utils";
import * as Width from "./Width";
import * as Layout from "./Layout";
import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import { ResumeLayout } from "./ResumeLayout";
import * as Resume from "./Resume";
import { ResumeSection } from "./Resume";

export const Basics: DataSchema.t = {
	schema_name: "Basics",
	header_schema: [
		{
			name: "name",
			type: { tag: "String" },
		},
		{
			name: "email",
			type: { tag: "String" },
		},
		{
			name: "phone",
			type: { tag: "String" },
		},
	],
	item_schema: [],
}

export const BasicsLayout: LayoutSchema = new LayoutSchema(
	"Basics",
	"Basics",
	Utils.with_(Stack.default_(), {
		elements: [
			Utils.with_(Elem.default_(), {
				item: "name",
				is_ref: true,
				font: Font.font("Exo", 20, "Bold", "Normal"),
				width: Width.percent(100),
				alignment: "Center",
			}),
			Utils.with_(Row.default_(), {
				elements: [
					Utils.with_(Elem.default_(), {
						item: "email",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
					}),
					Utils.with_(Elem.default_(), {
						item: "phone",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
						alignment: "Right",
					}),
				],
			}),
		],
	}),
	Layout.empty(),
);

export const Work: DataSchema.t = DataSchema.dataSchema(
	"Work Experience",
	[],
	[
		// name?: string;
		{ name: "name", type: { tag: "String" } },
		// position?: string;
		{ name: "position", type: { tag: "String" } },
		// url?: string;
		{ name: "url", type: { tag: "String" } },
		// startDate?: string;
		{ name: "startDate", type: { tag: "Date", format: "unknown" } },
		// endDate?: string;
		{ name: "endDate", type: { tag: "Date", format: "unknown" } },
		// summary?: string;
		{ name: "summary", type: { tag: "MarkdownString" } },
		// highlights?: string[];
		{ name: "highlights", type: { tag: "List", value: { tag: "String" } } },
	],
);

export const WorkLayout: LayoutSchema = new LayoutSchema(
	"Work Experience",
	"Work Experience",
	Elem.from({
		item: "Work Experience",
		width: Width.percent(100),
		alignment: "Center",
		font: Font.font("Exo", 16, "Bold", "Normal"),
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 14, "Bold", "Normal"),
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "position",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
					}),
					Row.from({
						width: Width.percent(50),
						alignment: "Right",
						elements: [
							Elem.from({
								item: "startDate",
								is_ref: true,
								font: Font.font("Exo", 12, "Medium", "Normal"),
								alignment: "Left",
							}),
							Elem.from({
								item: "-",
								font: Font.font("Exo", 12, "Medium", "Normal"),
								alignment: "Center",
							}),
							Elem.from({
								item: "endDate",
								is_ref: true,
								font: Font.font("Exo", 12, "Medium", "Normal"),
								alignment: "Right",
							}),
						],
					}),
				],
			}),
			Elem.from({
				item: "summary",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 12, "Medium", "Normal"),
			}),
		],
	}),
);

export const Volunteer: DataSchema.t = DataSchema.dataSchema(
	"Volunteer Experience",
	[],
	[
		// organization?: string;
		{ name: "organization", type: { tag: "String" } },
		// position?: string;
		{ name: "position", type: { tag: "String" } },
		// url?: string;
		{ name: "url", type: { tag: "String" } },
		// startDate?: string;
		{ name: "startDate", type: { tag: "Date", format: "unknown" } },
		// endDate?: string;
		{ name: "endDate", type: { tag: "Date", format: "unknown" } },
		// summary?: string;
		{ name: "summary", type: { tag: "MarkdownString" } },
		// highlights?: string[];
		{ name: "highlights", type: { tag: "List", value: { tag: "String" } } },
	],
);

export const VolunteerLayout: LayoutSchema = new LayoutSchema(
	"Volunteer Experience",
	"Volunteer Experience",
	Elem.from({
		item: "Volunteer Experience",
		width: Width.percent(100),
		alignment: "Center",
		font: Font.font("Exo", 16, "Bold", "Normal"),
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "organization",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 14, "Bold", "Normal"),
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "position",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
					}),
					Elem.from({
						item: "startDate",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
						alignment: "Right",
					}),
				],
			}),
		],
	}),
);

export const Education: DataSchema.t = DataSchema.dataSchema(
	"Education",
	[],
	[
		// institution?: string;
		{ name: "institution", type: { tag: "String" } },
		// url?: string;
		{ name: "url", type: { tag: "String" } },
		// area?: string;
		{ name: "area", type: { tag: "String" } },
		// studyType?: string;
		{ name: "studyType", type: { tag: "String" } },
		// startDate?: string;
		{ name: "startDate", type: { tag: "Date", format: "unknown" } },
		// endDate?: string;
		{ name: "endDate", type: { tag: "Date", format: "unknown" } },
		// score?: string;
		{ name: "score", type: { tag: "String" } },
		// courses?: string[];
		{ name: "courses", type: { tag: "List", value: { tag: "String" } } },
	],
);

export const EducationLayout = new LayoutSchema(
	"Education",
	"Education",
	Elem.from({
		item: "Education",
		width: Width.percent(100),
		alignment: "Center",
		font: Font.font("Exo", 16, "Bold", "Normal"),
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "institution",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 14, "Bold", "Normal"),
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "area",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
					}),
					Elem.from({
						item: "studyType",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
						alignment: "Right",
					}),
				],
			}),
		],
	}),
);

export const Awards: DataSchema.t = DataSchema.dataSchema(
	"Awards",
	[],
	[
		// title?: string;
		{ name: "title", type: { tag: "String" } },
		// date?: string;
		{ name: "date", type: { tag: "Date", format: "unknown" } },
		// awarder?: string;
		{ name: "awarder", type: { tag: "String" } },
		// summary?: string;
		{ name: "summary", type: { tag: "MarkdownString" } },
	],
);

export const AwardsLayout = new LayoutSchema(
	"Awards",
	"Awards",
	Elem.from({
		item: "Awards",
		width: Width.percent(100),
		alignment: "Center",
		font: Font.font("Exo", 16, "Bold", "Normal"),
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "title",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 14, "Bold", "Normal"),
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "date",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
					}),
					Elem.from({
						item: "awarder",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
						alignment: "Right",
					}),
				],
			}),
		],
	}),
);

export const Certificates: DataSchema.t = DataSchema.dataSchema(
	"Certificates",
	[],
	[
		// name?: string;
		{ name: "name", type: { tag: "String" } },
		// date?: string;
		{ name: "date", type: { tag: "Date", format: "unknown" } },
		// issuer?: string;
		{ name: "issuer", type: { tag: "String" } },
		// url?: string;
		{ name: "url", type: { tag: "String" } },
	],
);

export const CertificatesLayout = new LayoutSchema(
	"Certificates",
	"Certificates",
	Elem.from({
		item: "Certificates",
		width: Width.percent(100),
		alignment: "Center",
		font: Font.font("Exo", 16, "Bold", "Normal"),
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 14, "Bold", "Normal"),
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "date",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
					}),
					Elem.from({
						item: "issuer",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
						alignment: "Right",
					}),
				],
			}),
		],
	}),
);

export const Publications: DataSchema.t = DataSchema.dataSchema(
	"Publications",
	[],
	[
		// name?: string;
		{ name: "name", type: { tag: "String" } },
		// publisher?: string;
		{ name: "publisher", type: { tag: "String" } },
		// releaseDate?: string;
		{ name: "releaseDate", type: { tag: "Date", format: "unknown" } },
		// url?: string;
		{ name: "url", type: { tag: "String" } },
		// summary?: string;
		{ name: "summary", type: { tag: "MarkdownString" } },
	],
);

export const PublicationsLayout = new LayoutSchema(
	"Publications",
	"Publications",
	Elem.from({
		item: "Publications",
		width: Width.percent(100),
		alignment: "Center",
		font: Font.font("Exo", 16, "Bold", "Normal"),
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 14, "Bold", "Normal"),
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "publisher",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
					}),
					Elem.from({
						item: "releaseDate",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
						alignment: "Right",
					}),
				],
			}),
		],
	}),
);

export const Skills: DataSchema.t = DataSchema.dataSchema(
	"Skills",
	[],
	[
		// name?: string;
		{ name: "name", type: { tag: "String" } },
		// level?: string;
		{ name: "level", type: { tag: "String" } },
		// keywords?: string[];
		{ name: "keywords", type: { tag: "List", value: { tag: "String" } } },
	],
);

export const SkillsLayout = new LayoutSchema(
	"Skills",
	"Skills",
	Elem.from({
		item: "Skills",
		width: Width.percent(100),
		alignment: "Center",
		font: Font.font("Exo", 16, "Bold", "Normal"),
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 14, "Bold", "Normal"),
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "level",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
					}),
					Elem.from({
						item: "keywords",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
						alignment: "Right",
					}),
				],
			}),
		],
	}),
);

export const Languages: DataSchema.t = DataSchema.dataSchema(
	"Languages",
	[],
	[
		// language?: string;
		{ name: "language", type: { tag: "String" } },
		// fluency?: string;
		{ name: "fluency", type: { tag: "String" } },
	],
);

export const LanguagesLayout = new LayoutSchema(
	"Languages",
	"Languages",
	Elem.from({
		item: "Languages",
		width: Width.percent(100),
		alignment: "Center",
		font: Font.font("Exo", 16, "Bold", "Normal"),
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "language",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 14, "Bold", "Normal"),
			}),
			Elem.from({
				item: "fluency",
				is_ref: true,
				font: Font.font("Exo", 12, "Medium", "Normal"),
				width: Width.percent(50),
			}),
		],
	}),
);

export const Interests: DataSchema.t = DataSchema.dataSchema(
	"Interests",
	[],
	[
		// name?: string;
		{ name: "name", type: { tag: "String" } },
		// keywords?: string[];
		{ name: "keywords", type: { tag: "List", value: { tag: "String" } } },
	],
);

export const InterestsLayout = new LayoutSchema(
	"Interests",
	"Interests",
	Elem.from({
		item: "Interests",
		width: Width.percent(100),
		alignment: "Center",
		font: Font.font("Exo", 16, "Bold", "Normal"),
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 14, "Bold", "Normal"),
			}),
			Elem.from({
				item: "keywords",
				is_ref: true,
				font: Font.font("Exo", 12, "Medium", "Normal"),
				width: Width.percent(100),
			}),
		],
	}),
);

export const References: DataSchema.t = DataSchema.dataSchema(
	"References",
	[],
	[
		// name?: string;
		{ name: "name", type: { tag: "String" } },
		// reference?: string;
		{ name: "reference", type: { tag: "String" } },
	],
);

export const ReferencesLayout = new LayoutSchema(
	"References",
	"References",
	Elem.from({
		item: "References",
		width: Width.percent(100),
		alignment: "Center",
		font: Font.font("Exo", 16, "Bold", "Normal"),
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 14, "Bold", "Normal"),
			}),
			Elem.from({
				item: "reference",
				is_ref: true,
				font: Font.font("Exo", 12, "Medium", "Normal"),
				width: Width.percent(100),
			}),
		],
	}),
);

export const Projects: DataSchema.t = {
	schema_name: "Projects",
	header_schema: [],
	item_schema: [
		// name?: string;
		{ name: "name", type: { tag: "String" } },
		// startDate?: string;
		{ name: "startDate", type: { tag: "Date", format: "unknown" } },
		// endDate?: string;
		{ name: "endDate", type: { tag: "Date", format: "unknown" } },
		// description?: string;
		{ name: "description", type: { tag: "String" } },
		// highlights?: string[];
		{ name: "highlights", type: { tag: "List", value: { tag: "String" } } },
		// url?: string;
		{ name: "url", type: { tag: "String" } },
	],
}

export const ProjectsLayout = new LayoutSchema(
	"Projects",
	"Projects",
	Elem.from({
		item: "Projects",
		width: Width.percent(100),
		alignment: "Center",
		font: Font.font("Exo", 16, "Bold", "Normal"),
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: Font.font("Exo", 14, "Bold", "Normal"),
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "startDate",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
					}),
					Elem.from({
						item: "endDate",
						is_ref: true,
						font: Font.font("Exo", 12, "Medium", "Normal"),
						width: Width.percent(50),
						alignment: "Right",
					}),
				],
			}),
		],
	}),
);

export const DefaultDataSchemas: DataSchema.t[] = [
	Basics,
	Work,
	Volunteer,
	Education,
	Awards,
	Certificates,
	Publications,
	Skills,
	Languages,
	Interests,
	References,
	Projects,
];

export const DefaultLayoutSchemas: LayoutSchema[] = [
	BasicsLayout,
	WorkLayout,
	VolunteerLayout,
	EducationLayout,
	AwardsLayout,
	CertificatesLayout,
	PublicationsLayout,
	SkillsLayout,
	LanguagesLayout,
	InterestsLayout,
	ReferencesLayout,
	ProjectsLayout,
];

export const DefaultBindings: Map<string, unknown> = new Map();

export const DefaultResumeLayout: ResumeLayout = new ResumeLayout(
	"SingleColumnSchema",
	{ tag: "SingleColumn" },
	Margin.margin(20, 20, 20, 20),
	612,
	792,
);

export const DefaultSections: ResumeSection.t[] = [
	ResumeSection.resumeSection("Basics", "Basics", "Basics",
		{
			id: Utils.randomString(),
			fields: {
				"name": { tag: "String", value: "John Doe" },
				"email": { tag: "String", value: "john@doe.com" },
				"phone": { tag: "String", value: "555-555-5555" },
			}
		}
		,
		[]
	),
	ResumeSection.resumeSection("Work Experience", "Work Experience", "Work Experience", {
		id: Utils.randomString(),
		fields: {}
	},
		[
			{
				id: Utils.randomString(),
				fields: {
					"name": { tag: "String", value: "Company" },
					"position": { tag: "String", value: "President" },
					"url": { tag: "String", value: "http://company.com" },
					"startDate": { tag: "String", value: "2013-01-01" },
					"endDate": { tag: "String", value: "2014-01-01" },
					"summary": { tag: "String", value: "Description..." },
					"highlights": { tag: "List", value: [{ "tag": "String", "value": "Started the company" }] },
				}
			},
			{
				id: Utils.randomString(),
				fields: {
					"name": { tag: "String", value: "Company" },
					"position": { tag: "String", value: "President" },
					"url": { tag: "String", value: "http://company.com" },
					"startDate": { tag: "String", value: "2013-01-01" },
					"endDate": { tag: "String", value: "2014-01-01" },
					"summary": { tag: "String", value: "Description..." },
					"highlights": { tag: "List", value: [{ "tag": "String", "value": "Started the company" }] },
				}
			},
			{
				id: Utils.randomString(),
				fields: {
					"name": { tag: "String", value: "Company" },
					"position": { tag: "String", value: "President" },
					"url": { tag: "String", value: "http://company.com" },
					"startDate": { tag: "String", value: "2013-01-01" },
					"endDate": { tag: "String", value: "2014-01-01" },
					"summary": { tag: "String", value: "Description..." },
					"highlights": { tag: "List", value: [{ "tag": "String", "value": "Started the company" }] },
				}
			},
			{
				id: Utils.randomString(),
				fields: {
					"name": { tag: "String", value: "Company" },
					"position": { tag: "String", value: "President" },
					"url": { tag: "String", value: "http://company.com" },
					"startDate": { tag: "String", value: "2013-01-01" },
					"endDate": { tag: "String", value: "2014-01-01" },
					"summary": { tag: "String", value: "Description..." },
					"highlights": { tag: "List", value: [{ "tag": "String", "value": "Started the company" }] },
				}
			}
		]
	),
	ResumeSection.resumeSection("Volunteer Experience", "Volunteer Experience", "Volunteer Experience", {
		id: Utils.randomString(),
		fields: {}
	},
		[
			{
				id: Utils.randomString(),
				fields: {
					"organization": { tag: "String", value: "Organization" },
					"position": { tag: "String", value: "Volunteer" },
					"url": { tag: "String", value: "http://organization.com" },
					"startDate": { tag: "String", value: "2012-01-01" },
					"endDate": { tag: "String", value: "2013-01-01" },
					"summary": { tag: "String", value: "Description..." },
					"highlights": { tag: "List", value: [{ "tag": "String", "value": "Awarded 'Volunteer of the Month'" }] },
				}
			},
			{
				id: Utils.randomString(),
				fields: {
					"organization": { tag: "String", value: "Organization" },
					"position": { tag: "String", value: "Volunteer" },
					"url": { tag: "String", value: "http://organization.com" },
					"startDate": { tag: "String", value: "2012-01-01" },
					"endDate": { tag: "String", value: "2013-01-01" },
					"summary": { tag: "String", value: "Description..." },
					"highlights": { tag: "List", value: [{ "tag": "String", "value": "Awarded 'Volunteer of the Month'" }] },
				}
			},
		]
	),
	ResumeSection.resumeSection("Education", "Education", "Education", {
		id: Utils.randomString(),
		fields: {}
	},
		[
			{
				id: Utils.randomString(),
				fields: {
					"institution": { tag: "String", value: "University" },
					"url": { tag: "String", value: "http://university.com" },
					"area": { tag: "String", value: "Software Development" },
					"studyType": { tag: "String", value: "Bachelor" },
					"startDate": { tag: "String", value: "2011-01-01" },
					"endDate": { tag: "String", value: "2013-01-01" },
					"score": { tag: "String", value: "4.0" },
					"courses": { tag: "List", value: [{ "tag": "String", "value": "DB1101 - Basic SQL" }] },
				}
			},
			{
				id: Utils.randomString(),
				fields: {
					"institution": { tag: "String", value: "University" },
					"url": { tag: "String", value: "http://university.com" },
					"area": { tag: "String", value: "Software Development" },
					"studyType": { tag: "String", value: "Bachelor" },
					"startDate": { tag: "String", value: "2011-01-01" },
					"endDate": { tag: "String", value: "2013-01-01" },
					"score": { tag: "String", value: "4.0" },
					"courses": { tag: "List", value: [{ "tag": "String", "value": "DB1101 - Basic SQL" }] },
				}
			},
		]
	),

];


export const DefaultResume = Resume.resume(
	"Default",
	"SingleColumnSchema",
	DefaultSections,
);