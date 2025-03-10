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

export const TitleFont = Font.font("Exo", 20, "Bold", "Normal");
export const SectionTitleFont = Font.font("Exo", 16, "Bold", "Normal");
export const LargeFont = Font.font("Exo", 14, "Bold", "Normal");
export const MediumFont = Font.font("Exo", 12, "Medium", "Normal");
export const SmallFont = Font.font("Exo", 10, "Medium", "Normal");

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
};

export const BasicsLayout: LayoutSchema = new LayoutSchema(
	"Basics",
	"Basics",
	Utils.with_(Stack.default_(), {
		elements: [
			Utils.with_(Elem.default_(), {
				item: "name",
				is_ref: true,
				font: TitleFont,
				width: Width.percent(100),
				alignment: "Center",
			}),
			Utils.with_(Row.default_(), {
				elements: [
					Utils.with_(Elem.default_(), {
						item: "email",
						is_ref: true,
						font: MediumFont,
						width: Width.percent(50),
					}),
					Utils.with_(Elem.default_(), {
						item: "phone",
						is_ref: true,
						font: MediumFont,
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
		{ name: "name", type: { tag: "Url" } },
		// position?: string;
		{ name: "position", type: { tag: "String" } },
		// url?: string;
		// { name: "url", type: { tag: "String" } },
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
		font: SectionTitleFont,
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: LargeFont,
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "position",
						is_ref: true,
						font: MediumFont,
						width: Width.percent(50),
					}),
					Row.from({
						width: Width.percent(50),
						alignment: "Right",
						elements: [
							Elem.from({
								item: "startDate",
								is_ref: true,
								font: MediumFont,
								alignment: "Left",
							}),
							Elem.from({
								item: "-",
								font: MediumFont,
								alignment: "Center",
							}),
							Elem.from({
								item: "endDate",
								is_ref: true,
								font: MediumFont,
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
				font: MediumFont,
			}),
			Elem.from({
				item: "highlights",
				is_ref: true,
				width: Width.percent(100),
				font: MediumFont,
			}),
		],
	}),
);

export const Volunteer: DataSchema.t = DataSchema.dataSchema(
	"Volunteer Experience",
	[],
	[
		// organization?: string;
		{ name: "organization", type: { tag: "Url" } },
		// position?: string;
		{ name: "position", type: { tag: "String" } },
		// url?: string;
		// { name: "url", type: { tag: "String" } },
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
		font: SectionTitleFont,
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "organization",
				is_ref: true,
				width: Width.percent(100),
				font: LargeFont,
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "position",
						is_ref: true,
						font: MediumFont,
						width: Width.percent(50),
					}),
					Row.from({
						width: Width.percent(50),
						alignment: "Right",
						elements: [
							Elem.from({
								item: "startDate",
								is_ref: true,
								font: MediumFont,
								alignment: "Left",
							}),
							Elem.from({
								item: "-",
								font: MediumFont,
								alignment: "Center",
							}),
							Elem.from({
								item: "endDate",
								is_ref: true,
								font: MediumFont,
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
				font: MediumFont,
			}),
			Elem.from({
				item: "highlights",
				is_ref: true,
				width: Width.percent(100),
				font: MediumFont,
			}),
		],
	}),
);

export const Education: DataSchema.t = DataSchema.dataSchema(
	"Education",
	[],
	[
		// institution?: string;
		{ name: "institution", type: { tag: "Url" } },
		// url?: string;
		// { name: "url", type: { tag: "String" } },
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
		font: SectionTitleFont,
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "institution",
				is_ref: true,
				width: Width.percent(100),
				font: LargeFont,
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "area",
						is_ref: true,
						font: MediumFont,
						width: Width.percent(50),
					}),
					Row.from({
						width: Width.percent(50),
						alignment: "Right",
						elements: [
							Elem.from({
								item: "startDate",
								is_ref: true,
								font: MediumFont,
								alignment: "Left",
							}),
							Elem.from({
								item: "-",
								font: MediumFont,
								alignment: "Center",
							}),
							Elem.from({
								item: "endDate",
								is_ref: true,
								font: MediumFont,
								alignment: "Right",
							}),
						],
					}),
				],
			}),
			Elem.from({
				item: "studyType",
				is_ref: true,
				font: MediumFont,
				width: Width.percent(50),
			}),
			Elem.from({
				item: "score",
				is_ref: true,
				width: Width.percent(100),
				font: MediumFont,
			}),
			Elem.from({
				item: "courses",
				is_ref: true,
				width: Width.percent(100),
				font: MediumFont,
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
		font: SectionTitleFont,
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "title",
				is_ref: true,
				width: Width.percent(100),
				font: LargeFont,
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "date",
						is_ref: true,
						font: MediumFont,
						width: Width.percent(50),
					}),
					Elem.from({
						item: "awarder",
						is_ref: true,
						font: MediumFont,
						width: Width.percent(50),
						alignment: "Right",
					}),
				],
			}),
			Elem.from({
				item: "summary",
				is_ref: true,
				font: MediumFont,
				width: Width.percent(70),
			}),
		],
	}),
);

export const Certificates: DataSchema.t = DataSchema.dataSchema(
	"Certificates",
	[],
	[
		// name?: string;
		{ name: "name", type: { tag: "Url" } },
		// date?: string;
		{ name: "date", type: { tag: "Date", format: "unknown" } },
		// issuer?: string;
		{ name: "issuer", type: { tag: "String" } },
		// url?: string;
		// { name: "url", type: { tag: "String" } },
	],
);

export const CertificatesLayout = new LayoutSchema(
	"Certificates",
	"Certificates",
	Elem.from({
		item: "Certificates",
		width: Width.percent(100),
		alignment: "Center",
		font: SectionTitleFont,
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: LargeFont,
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "date",
						is_ref: true,
						font: MediumFont,
						width: Width.percent(50),
					}),
					Elem.from({
						item: "issuer",
						is_ref: true,
						font: MediumFont,
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
		{ name: "name", type: { tag: "Url" } },
		// publisher?: string;
		{ name: "publisher", type: { tag: "String" } },
		// releaseDate?: string;
		{ name: "releaseDate", type: { tag: "Date", format: "unknown" } },
		// url?: string;
		// { name: "url", type: { tag: "String" } },
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
		font: SectionTitleFont,
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: LargeFont,
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "publisher",
						is_ref: true,
						font: MediumFont,
						width: Width.percent(50),
					}),
					Elem.from({
						item: "releaseDate",
						is_ref: true,
						font: MediumFont,
						width: Width.percent(50),
						alignment: "Right",
					}),
				],
			}),
			Elem.from({
				item: "summary",
				is_ref: true,
				font: MediumFont,
				width: Width.percent(50),
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
		font: SectionTitleFont,
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: LargeFont,
			}),
			Elem.from({
				item: "level",
				is_ref: true,
				font: MediumFont,
				width: Width.percent(50),
			}),
			Elem.from({
				item: "keywords",
				is_ref: true,
				font: MediumFont,
				width: Width.percent(50),
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
		font: SectionTitleFont,
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "language",
				is_ref: true,
				width: Width.percent(100),
				font: LargeFont,
			}),
			Elem.from({
				item: "fluency",
				is_ref: true,
				font: MediumFont,
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
		font: SectionTitleFont,
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: LargeFont,
			}),
			Elem.from({
				item: "keywords",
				is_ref: true,
				font: MediumFont,
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
		font: SectionTitleFont,
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: LargeFont,
			}),
			Elem.from({
				item: "reference",
				is_ref: true,
				font: MediumFont,
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
		{ name: "name", type: { tag: "Url" } },
		// startDate?: string;
		{ name: "startDate", type: { tag: "Date", format: "unknown" } },
		// endDate?: string;
		{ name: "endDate", type: { tag: "Date", format: "unknown" } },
		// description?: string;
		{ name: "description", type: { tag: "String" } },
		// highlights?: string[];
		{ name: "highlights", type: { tag: "List", value: { tag: "String" } } },
		// url?: string;
		// { name: "url", type: { tag: "String" } },
	],
};

export const ProjectsLayout = new LayoutSchema(
	"Projects",
	"Projects",
	Elem.from({
		item: "Projects",
		width: Width.percent(100),
		alignment: "Center",
		font: SectionTitleFont,
	}),
	Stack.from({
		elements: [
			Elem.from({
				item: "name",
				is_ref: true,
				width: Width.percent(100),
				font: LargeFont,
			}),
			Row.from({
				width: Width.percent(100),
				elements: [
					Elem.from({
						item: "startDate",
						is_ref: true,
						font: MediumFont,
						width: Width.percent(50),
					}),
					Elem.from({
						item: "endDate",
						is_ref: true,
						font: MediumFont,
						width: Width.percent(50),
						alignment: "Right",
					}),
				],
			}),
			Elem.from({
				item: "description",
				is_ref: true,
				font: MediumFont,
				width: Width.percent(80),
			}),
			Elem.from({
				item: "highlights",
				is_ref: true,
				font: MediumFont,
				width: Width.percent(80),
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
	ResumeSection.resumeSection(
		"Basics",
		"Basics",
		"Basics",
		{
			id: Utils.randomString(),
			fields: {
				name: { tag: "String", value: "John Doe" },
				email: { tag: "String", value: "john@doe.com" },
				phone: { tag: "String", value: "555-555-5555" },
			},
		},
		[],
	),
	ResumeSection.resumeSection(
		"Work Experience",
		"Work Experience",
		"Work Experience",
		{
			id: Utils.randomString(),
			fields: {},
		},
		[
			{
				id: Utils.randomString(),
				fields: {
					name: {
						tag: "Url",
						value: { text: "Company", url: "http://company.com" },
					},
					position: { tag: "String", value: "President" },
					startDate: { tag: "String", value: "2013-01-01" },
					endDate: { tag: "String", value: "2014-01-01" },
					summary: { tag: "String", value: "Description..." },
					highlights: {
						tag: "List",
						value: [{ tag: "String", value: "Started the company" }],
					},
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					name: {
						tag: "Url",
						value: { text: "Company", url: "http://company.com" },
					},
					position: { tag: "String", value: "President" },
					url: { tag: "String", value: "http://company.com" },
					startDate: { tag: "String", value: "2013-01-01" },
					endDate: { tag: "String", value: "2014-01-01" },
					summary: { tag: "String", value: "Description..." },
					highlights: {
						tag: "List",
						value: [{ tag: "String", value: "Started the company" }],
					},
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					name: {
						tag: "Url",
						value: { text: "Company", url: "http://company.com" },
					},
					position: { tag: "String", value: "President" },
					url: { tag: "String", value: "http://company.com" },
					startDate: { tag: "String", value: "2013-01-01" },
					endDate: { tag: "String", value: "2014-01-01" },
					summary: { tag: "String", value: "Description..." },
					highlights: {
						tag: "List",
						value: [{ tag: "String", value: "Started the company" }],
					},
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					name: {
						tag: "Url",
						value: { text: "Company", url: "http://company.com" },
					},
					position: { tag: "String", value: "President" },
					url: { tag: "String", value: "http://company.com" },
					startDate: { tag: "String", value: "2013-01-01" },
					endDate: { tag: "String", value: "2014-01-01" },
					summary: { tag: "String", value: "Description..." },
					highlights: {
						tag: "List",
						value: [{ tag: "String", value: "Started the company" }],
					},
				},
			},
		],
	),
	ResumeSection.resumeSection(
		"Volunteer Experience",
		"Volunteer Experience",
		"Volunteer Experience",
		{
			id: Utils.randomString(),
			fields: {},
		},
		[
			{
				id: Utils.randomString(),
				fields: {
					organization: {
						tag: "Url",
						value: { text: "Organization", url: "http://organization.com" },
					},
					position: { tag: "String", value: "Volunteer" },
					startDate: { tag: "String", value: "2012-01-01" },
					endDate: { tag: "String", value: "2013-01-01" },
					summary: { tag: "String", value: "Description..." },
					highlights: {
						tag: "List",
						value: [
							{ tag: "String", value: "Awarded 'Volunteer of the Month'" },
						],
					},
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					organization: {
						tag: "Url",
						value: { text: "Organization", url: "http://organization.com" },
					},
					position: { tag: "String", value: "Volunteer" },
					startDate: { tag: "String", value: "2012-01-01" },
					endDate: { tag: "String", value: "2013-01-01" },
					summary: { tag: "String", value: "Description..." },
					highlights: {
						tag: "List",
						value: [
							{ tag: "String", value: "Awarded 'Volunteer of the Month'" },
						],
					},
				},
			},
		],
	),
	ResumeSection.resumeSection(
		"Education",
		"Education",
		"Education",
		{
			id: Utils.randomString(),
			fields: {},
		},
		[
			{
				id: Utils.randomString(),
				fields: {
					institution: {
						tag: "Url",
						value: { text: "University", url: "http://university.com" },
					},
					area: { tag: "String", value: "Software Development" },
					studyType: { tag: "String", value: "Bachelor" },
					startDate: { tag: "String", value: "2011-01-01" },
					endDate: { tag: "String", value: "2013-01-01" },
					score: { tag: "String", value: "4.0" },
					courses: {
						tag: "List",
						value: [{ tag: "String", value: "DB1101 - Basic SQL" }],
					},
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					institution: {
						tag: "Url",
						value: { text: "University", url: "http://university.com" },
					},
					area: { tag: "String", value: "Software Development" },
					studyType: { tag: "String", value: "Bachelor" },
					startDate: { tag: "String", value: "2011-01-01" },
					endDate: { tag: "String", value: "2013-01-01" },
					score: { tag: "String", value: "4.0" },
					courses: {
						tag: "List",
						value: [{ tag: "String", value: "DB1101 - Basic SQL" }],
					},
				},
			},
		],
	),
	ResumeSection.resumeSection(
		"Awards",
		"Awards",
		"Awards",
		{
			id: Utils.randomString(),
			fields: {},
		},
		[
			{
				id: Utils.randomString(),
				fields: {
					title: { tag: "String", value: "Greatest Software Developer" },
					awarder: { tag: "String", value: "SoftwareAwards.inc" },
					date: { tag: "String", value: "01-01-1970" },
					summary: {
						tag: "String",
						value: "An award given only to the best of the best",
					},
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					title: { tag: "String", value: "Greatest Software Developer" },
					awarder: { tag: "String", value: "SoftwareAwards.inc" },
					date: { tag: "String", value: "01-01-1970" },
					summary: {
						tag: "String",
						value: "An award given only to the best of the best",
					},
				},
			},
		],
	),
	ResumeSection.resumeSection(
		"Certificates",
		"Certificates",
		"Certificates",
		{
			id: Utils.randomString(),
			fields: {},
		},
		[
			{
				id: Utils.randomString(),
				fields: {
					name: {
						tag: "Url",
						value: {
							text: "Greatest Software Development Course",
							url: "www.google.com",
						},
					},
					date: { tag: "String", value: "01-01-1970" },
					issuer: {
						tag: "String",
						value: "An course that teaches only to the best of the best",
					},
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					name: {
						tag: "Url",
						value: {
							text: "Greatest Software Development Course",
							url: "www.google.com",
						},
					},
					date: { tag: "String", value: "01-01-1970" },
					issuer: {
						tag: "String",
						value: "An course that teaches only to the best of the best",
					},
				},
			},
		],
	),
	ResumeSection.resumeSection(
		"Publications",
		"Publications",
		"Publications",
		{
			id: Utils.randomString(),
			fields: {},
		},
		[
			{
				id: Utils.randomString(),
				fields: {
					name: {
						tag: "Url",
						value: {
							text: "How to develop good software",
							url: "www.google.com",
						},
					},
					publisher: { tag: "String", value: "SoftwareAwards.inc" },
					releaseDate: { tag: "String", value: "01-01-1970" },
					summary: {
						tag: "String",
						value: "A publication worthy of the best of the best",
					},
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					name: {
						tag: "Url",
						value: {
							text: "How to develop good software",
							url: "www.google.com",
						},
					},
					publisher: { tag: "String", value: "SoftwareAwards.inc" },
					releaseDate: { tag: "String", value: "01-01-1970" },
					summary: {
						tag: "String",
						value: "A publication worthy of the best of the best",
					},
				},
			},
		],
	),
	ResumeSection.resumeSection(
		"Skills",
		"Skills",
		"Skills",
		{
			id: Utils.randomString(),
			fields: {},
		},
		[
			{
				id: Utils.randomString(),
				fields: {
					name: { tag: "String", value: "Software Development" },
					level: { tag: "String", value: "Senior" },
					keywords: {
						tag: "List",
						value: [
							{ tag: "String", value: "Javascript" },
							{ tag: "String", value: "Typescript" },
						],
					},
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					name: { tag: "String", value: "Software Development" },
					level: { tag: "String", value: "Senior" },
					keywords: {
						tag: "List",
						value: [
							{ tag: "String", value: "Javascript" },
							{ tag: "String", value: "Typescript" },
						],
					},
				},
			},
		],
	),
	ResumeSection.resumeSection(
		"Languages",
		"Languages",
		"Languages",
		{
			id: Utils.randomString(),
			fields: {},
		},
		[
			{
				id: Utils.randomString(),
				fields: {
					language: { tag: "String", value: "Turkish" },
					fluency: { tag: "String", value: "Native" },
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					language: { tag: "String", value: "English" },
					fluency: { tag: "String", value: "Proficient" },
				},
			},
		],
	),
	ResumeSection.resumeSection(
		"Interests",
		"Interests",
		"Interests",
		{
			id: Utils.randomString(),
			fields: {},
		},
		[
			{
				id: Utils.randomString(),
				fields: {
					name: { tag: "String", value: "Software Development" },
					keywords: {
						tag: "List",
						value: [
							{ tag: "String", value: "Javascript" },
							{ tag: "String", value: "Typescript" },
						],
					},
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					name: { tag: "String", value: "Software Development" },
					keywords: {
						tag: "List",
						value: [
							{ tag: "String", value: "Javascript" },
							{ tag: "String", value: "Typescript" },
						],
					},
				},
			},
		],
	),
	ResumeSection.resumeSection(
		"References",
		"References",
		"References",
		{
			id: Utils.randomString(),
			fields: {},
		},
		[
			{
				id: Utils.randomString(),
				fields: {
					name: { tag: "String", value: "Ken Thompson" },
					reference: { tag: "String", value: "Legendary Programmer" },
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					name: { tag: "String", value: "Alperen Keles" },
					reference: { tag: "String", value: "Random fun guy" },
				},
			},
		],
	),
	ResumeSection.resumeSection(
		"Projects",
		"Projects",
		"Projects",
		{
			id: Utils.randomString(),
			fields: {},
		},
		[
			{
				id: Utils.randomString(),
				fields: {
					name: {
						tag: "Url",
						value: { text: "Tail", url: "http://tail.rocks" },
					},
					startDate: { tag: "String", value: "2012-01-01" },
					endDate: { tag: "String", value: "Never ends" },
					description: {
						tag: "String",
						value: "Next generation document builder",
					},
					highlights: {
						tag: "List",
						value: [{ tag: "String", value: "Looks pretty cool" }],
					},
				},
			},
			{
				id: Utils.randomString(),
				fields: {
					name: {
						tag: "Url",
						value: { text: "Tail", url: "http://tail.rocks" },
					},
					startDate: { tag: "String", value: "2012-01-01" },
					endDate: { tag: "String", value: "Never ends" },
					description: {
						tag: "String",
						value: "Next generation document builder",
					},
					highlights: {
						tag: "List",
						value: [{ tag: "String", value: "Looks pretty cool" }],
					},
				},
			},
		],
	),
];

export const DefaultResume = Resume.resume(
	"Default",
	"SingleColumnSchema",
	DefaultSections,
);
