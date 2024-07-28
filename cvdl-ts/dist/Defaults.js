"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultResume = exports.DefaultSections = exports.DefaultResumeLayout = exports.DefaultBindings = exports.DefaultLayoutSchemas = exports.DefaultDataSchemas = exports.ProjectsLayout = exports.Projects = exports.ReferencesLayout = exports.References = exports.InterestsLayout = exports.Interests = exports.LanguagesLayout = exports.Languages = exports.SkillsLayout = exports.Skills = exports.PublicationsLayout = exports.Publications = exports.CertificatesLayout = exports.Certificates = exports.AwardsLayout = exports.Awards = exports.EducationLayout = exports.Education = exports.VolunteerLayout = exports.Volunteer = exports.WorkLayout = exports.Work = exports.BasicsLayout = exports.Basics = exports.SmallFont = exports.MediumFont = exports.LargeFont = exports.SectionTitleFont = exports.TitleFont = void 0;
const Stack = __importStar(require("./Stack"));
const Margin = __importStar(require("./Margin"));
const Font = __importStar(require("./Font"));
const Elem = __importStar(require("./Elem"));
const Row = __importStar(require("./Row"));
const Utils = __importStar(require("./Utils"));
const Width = __importStar(require("./Width"));
const Layout = __importStar(require("./Layout"));
const DataSchema_1 = require("./DataSchema");
const LayoutSchema_1 = require("./LayoutSchema");
const ResumeLayout_1 = require("./ResumeLayout");
const Resume = __importStar(require("./Resume"));
const Resume_1 = require("./Resume");
exports.TitleFont = Font.font("Exo", 20, "Bold", "Normal");
exports.SectionTitleFont = Font.font("Exo", 16, "Bold", "Normal");
exports.LargeFont = Font.font("Exo", 14, "Bold", "Normal");
exports.MediumFont = Font.font("Exo", 12, "Medium", "Normal");
exports.SmallFont = Font.font("Exo", 10, "Medium", "Normal");
exports.Basics = {
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
exports.BasicsLayout = new LayoutSchema_1.LayoutSchema("Basics", "Basics", Utils.with_(Stack.default_(), {
    elements: [
        Utils.with_(Elem.default_(), {
            item: "name",
            is_ref: true,
            font: exports.TitleFont,
            width: Width.percent(100),
            alignment: "Center",
        }),
        Utils.with_(Row.default_(), {
            elements: [
                Utils.with_(Elem.default_(), {
                    item: "email",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                }),
                Utils.with_(Elem.default_(), {
                    item: "phone",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                    alignment: "Right",
                }),
            ],
        }),
    ],
}), Layout.empty());
exports.Work = DataSchema_1.DataSchema.dataSchema("Work Experience", [], [
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
]);
exports.WorkLayout = new LayoutSchema_1.LayoutSchema("Work Experience", "Work Experience", Elem.from({
    item: "Work Experience",
    width: Width.percent(100),
    alignment: "Center",
    font: exports.SectionTitleFont
}), Stack.from({
    elements: [
        Elem.from({
            item: "name",
            is_ref: true,
            width: Width.percent(100),
            font: exports.LargeFont,
        }),
        Row.from({
            width: Width.percent(100),
            elements: [
                Elem.from({
                    item: "position",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                }),
                Row.from({
                    width: Width.percent(50),
                    alignment: "Right",
                    elements: [
                        Elem.from({
                            item: "startDate",
                            is_ref: true,
                            font: exports.MediumFont,
                            alignment: "Left",
                        }),
                        Elem.from({
                            item: "-",
                            font: exports.MediumFont,
                            alignment: "Center",
                        }),
                        Elem.from({
                            item: "endDate",
                            is_ref: true,
                            font: exports.MediumFont,
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
            font: exports.MediumFont,
        }),
        Elem.from({
            item: "highlights",
            is_ref: true,
            width: Width.percent(100),
            font: exports.MediumFont,
        }),
    ],
}));
exports.Volunteer = DataSchema_1.DataSchema.dataSchema("Volunteer Experience", [], [
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
]);
exports.VolunteerLayout = new LayoutSchema_1.LayoutSchema("Volunteer Experience", "Volunteer Experience", Elem.from({
    item: "Volunteer Experience",
    width: Width.percent(100),
    alignment: "Center",
    font: exports.SectionTitleFont
}), Stack.from({
    elements: [
        Elem.from({
            item: "organization",
            is_ref: true,
            width: Width.percent(100),
            font: exports.LargeFont,
        }),
        Row.from({
            width: Width.percent(100),
            elements: [
                Elem.from({
                    item: "position",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                }),
                Row.from({
                    width: Width.percent(50),
                    alignment: "Right",
                    elements: [
                        Elem.from({
                            item: "startDate",
                            is_ref: true,
                            font: exports.MediumFont,
                            alignment: "Left",
                        }),
                        Elem.from({
                            item: "-",
                            font: exports.MediumFont,
                            alignment: "Center",
                        }),
                        Elem.from({
                            item: "endDate",
                            is_ref: true,
                            font: exports.MediumFont,
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
            font: exports.MediumFont,
        }),
        Elem.from({
            item: "highlights",
            is_ref: true,
            width: Width.percent(100),
            font: exports.MediumFont,
        }),
    ],
}));
exports.Education = DataSchema_1.DataSchema.dataSchema("Education", [], [
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
]);
exports.EducationLayout = new LayoutSchema_1.LayoutSchema("Education", "Education", Elem.from({
    item: "Education",
    width: Width.percent(100),
    alignment: "Center",
    font: exports.SectionTitleFont
}), Stack.from({
    elements: [
        Elem.from({
            item: "institution",
            is_ref: true,
            width: Width.percent(100),
            font: exports.LargeFont,
        }),
        Row.from({
            width: Width.percent(100),
            elements: [
                Elem.from({
                    item: "area",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                }),
                Row.from({
                    width: Width.percent(50),
                    alignment: "Right",
                    elements: [
                        Elem.from({
                            item: "startDate",
                            is_ref: true,
                            font: exports.MediumFont,
                            alignment: "Left",
                        }),
                        Elem.from({
                            item: "-",
                            font: exports.MediumFont,
                            alignment: "Center",
                        }),
                        Elem.from({
                            item: "endDate",
                            is_ref: true,
                            font: exports.MediumFont,
                            alignment: "Right",
                        }),
                    ],
                }),
            ],
        }),
        Elem.from({
            item: "studyType",
            is_ref: true,
            font: exports.MediumFont,
            width: Width.percent(50),
        }),
        Elem.from({
            item: "score",
            is_ref: true,
            width: Width.percent(100),
            font: exports.MediumFont,
        }),
        Elem.from({
            item: "courses",
            is_ref: true,
            width: Width.percent(100),
            font: exports.MediumFont,
        }),
    ],
}));
exports.Awards = DataSchema_1.DataSchema.dataSchema("Awards", [], [
    // title?: string;
    { name: "title", type: { tag: "String" } },
    // date?: string;
    { name: "date", type: { tag: "Date", format: "unknown" } },
    // awarder?: string;
    { name: "awarder", type: { tag: "String" } },
    // summary?: string;
    { name: "summary", type: { tag: "MarkdownString" } },
]);
exports.AwardsLayout = new LayoutSchema_1.LayoutSchema("Awards", "Awards", Elem.from({
    item: "Awards",
    width: Width.percent(100),
    alignment: "Center",
    font: exports.SectionTitleFont
}), Stack.from({
    elements: [
        Elem.from({
            item: "title",
            is_ref: true,
            width: Width.percent(100),
            font: exports.LargeFont,
        }),
        Row.from({
            width: Width.percent(100),
            elements: [
                Elem.from({
                    item: "date",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                }),
                Elem.from({
                    item: "awarder",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                    alignment: "Right",
                }),
            ],
        }),
        Elem.from({
            item: "summary",
            is_ref: true,
            font: exports.MediumFont,
            width: Width.percent(70),
        }),
    ],
}));
exports.Certificates = DataSchema_1.DataSchema.dataSchema("Certificates", [], [
    // name?: string;
    { name: "name", type: { tag: "Url" } },
    // date?: string;
    { name: "date", type: { tag: "Date", format: "unknown" } },
    // issuer?: string;
    { name: "issuer", type: { tag: "String" } },
    // url?: string;
    // { name: "url", type: { tag: "String" } },
]);
exports.CertificatesLayout = new LayoutSchema_1.LayoutSchema("Certificates", "Certificates", Elem.from({
    item: "Certificates",
    width: Width.percent(100),
    alignment: "Center",
    font: exports.SectionTitleFont
}), Stack.from({
    elements: [
        Elem.from({
            item: "name",
            is_ref: true,
            width: Width.percent(100),
            font: exports.LargeFont,
        }),
        Row.from({
            width: Width.percent(100),
            elements: [
                Elem.from({
                    item: "date",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                }),
                Elem.from({
                    item: "issuer",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                    alignment: "Right",
                }),
            ],
        }),
    ],
}));
exports.Publications = DataSchema_1.DataSchema.dataSchema("Publications", [], [
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
]);
exports.PublicationsLayout = new LayoutSchema_1.LayoutSchema("Publications", "Publications", Elem.from({
    item: "Publications",
    width: Width.percent(100),
    alignment: "Center",
    font: exports.SectionTitleFont
}), Stack.from({
    elements: [
        Elem.from({
            item: "name",
            is_ref: true,
            width: Width.percent(100),
            font: exports.LargeFont,
        }),
        Row.from({
            width: Width.percent(100),
            elements: [
                Elem.from({
                    item: "publisher",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                }),
                Elem.from({
                    item: "releaseDate",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                    alignment: "Right",
                }),
            ],
        }),
        Elem.from({
            item: "summary",
            is_ref: true,
            font: exports.MediumFont,
            width: Width.percent(50),
        }),
    ],
}));
exports.Skills = DataSchema_1.DataSchema.dataSchema("Skills", [], [
    // name?: string;
    { name: "name", type: { tag: "String" } },
    // level?: string;
    { name: "level", type: { tag: "String" } },
    // keywords?: string[];
    { name: "keywords", type: { tag: "List", value: { tag: "String" } } },
]);
exports.SkillsLayout = new LayoutSchema_1.LayoutSchema("Skills", "Skills", Elem.from({
    item: "Skills",
    width: Width.percent(100),
    alignment: "Center",
    font: exports.SectionTitleFont
}), Stack.from({
    elements: [
        Elem.from({
            item: "name",
            is_ref: true,
            width: Width.percent(100),
            font: exports.LargeFont,
        }),
        Elem.from({
            item: "level",
            is_ref: true,
            font: exports.MediumFont,
            width: Width.percent(50),
        }),
        Elem.from({
            item: "keywords",
            is_ref: true,
            font: exports.MediumFont,
            width: Width.percent(50),
        }),
    ],
}));
exports.Languages = DataSchema_1.DataSchema.dataSchema("Languages", [], [
    // language?: string;
    { name: "language", type: { tag: "String" } },
    // fluency?: string;
    { name: "fluency", type: { tag: "String" } },
]);
exports.LanguagesLayout = new LayoutSchema_1.LayoutSchema("Languages", "Languages", Elem.from({
    item: "Languages",
    width: Width.percent(100),
    alignment: "Center",
    font: exports.SectionTitleFont
}), Stack.from({
    elements: [
        Elem.from({
            item: "language",
            is_ref: true,
            width: Width.percent(100),
            font: exports.LargeFont,
        }),
        Elem.from({
            item: "fluency",
            is_ref: true,
            font: exports.MediumFont,
            width: Width.percent(50),
        }),
    ],
}));
exports.Interests = DataSchema_1.DataSchema.dataSchema("Interests", [], [
    // name?: string;
    { name: "name", type: { tag: "String" } },
    // keywords?: string[];
    { name: "keywords", type: { tag: "List", value: { tag: "String" } } },
]);
exports.InterestsLayout = new LayoutSchema_1.LayoutSchema("Interests", "Interests", Elem.from({
    item: "Interests",
    width: Width.percent(100),
    alignment: "Center",
    font: exports.SectionTitleFont
}), Stack.from({
    elements: [
        Elem.from({
            item: "name",
            is_ref: true,
            width: Width.percent(100),
            font: exports.LargeFont,
        }),
        Elem.from({
            item: "keywords",
            is_ref: true,
            font: exports.MediumFont,
            width: Width.percent(100),
        }),
    ],
}));
exports.References = DataSchema_1.DataSchema.dataSchema("References", [], [
    // name?: string;
    { name: "name", type: { tag: "String" } },
    // reference?: string;
    { name: "reference", type: { tag: "String" } },
]);
exports.ReferencesLayout = new LayoutSchema_1.LayoutSchema("References", "References", Elem.from({
    item: "References",
    width: Width.percent(100),
    alignment: "Center",
    font: exports.SectionTitleFont
}), Stack.from({
    elements: [
        Elem.from({
            item: "name",
            is_ref: true,
            width: Width.percent(100),
            font: exports.LargeFont,
        }),
        Elem.from({
            item: "reference",
            is_ref: true,
            font: exports.MediumFont,
            width: Width.percent(100),
        }),
    ],
}));
exports.Projects = {
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
exports.ProjectsLayout = new LayoutSchema_1.LayoutSchema("Projects", "Projects", Elem.from({
    item: "Projects",
    width: Width.percent(100),
    alignment: "Center",
    font: exports.SectionTitleFont
}), Stack.from({
    elements: [
        Elem.from({
            item: "name",
            is_ref: true,
            width: Width.percent(100),
            font: exports.LargeFont,
        }),
        Row.from({
            width: Width.percent(100),
            elements: [
                Elem.from({
                    item: "startDate",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                }),
                Elem.from({
                    item: "endDate",
                    is_ref: true,
                    font: exports.MediumFont,
                    width: Width.percent(50),
                    alignment: "Right",
                }),
            ],
        }),
        Elem.from({
            item: "description",
            is_ref: true,
            font: exports.MediumFont,
            width: Width.percent(80),
        }),
        Elem.from({
            item: "highlights",
            is_ref: true,
            font: exports.MediumFont,
            width: Width.percent(80),
        }),
    ],
}));
exports.DefaultDataSchemas = [
    exports.Basics,
    exports.Work,
    exports.Volunteer,
    exports.Education,
    exports.Awards,
    exports.Certificates,
    exports.Publications,
    exports.Skills,
    exports.Languages,
    exports.Interests,
    exports.References,
    exports.Projects,
];
exports.DefaultLayoutSchemas = [
    exports.BasicsLayout,
    exports.WorkLayout,
    exports.VolunteerLayout,
    exports.EducationLayout,
    exports.AwardsLayout,
    exports.CertificatesLayout,
    exports.PublicationsLayout,
    exports.SkillsLayout,
    exports.LanguagesLayout,
    exports.InterestsLayout,
    exports.ReferencesLayout,
    exports.ProjectsLayout,
];
exports.DefaultBindings = new Map();
exports.DefaultResumeLayout = new ResumeLayout_1.ResumeLayout("SingleColumnSchema", { tag: "SingleColumn" }, Margin.margin(20, 20, 20, 20), 612, 792);
exports.DefaultSections = [
    Resume_1.ResumeSection.resumeSection("Basics", "Basics", "Basics", {
        id: Utils.randomString(),
        fields: {
            "name": { tag: "String", value: "John Doe" },
            "email": { tag: "String", value: "john@doe.com" },
            "phone": { tag: "String", value: "555-555-5555" },
        }
    }, []),
    Resume_1.ResumeSection.resumeSection("Work Experience", "Work Experience", "Work Experience", {
        id: Utils.randomString(),
        fields: {}
    }, [
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "Url", value: { text: "Company", url: "http://company.com" } },
                "position": { tag: "String", value: "President" },
                "startDate": { tag: "String", value: "2013-01-01" },
                "endDate": { tag: "String", value: "2014-01-01" },
                "summary": { tag: "String", value: "Description..." },
                "highlights": { tag: "List", value: [{ "tag": "String", "value": "Started the company" }] },
            }
        },
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "Url", value: { text: "Company", url: "http://company.com" } },
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
                "name": { tag: "Url", value: { text: "Company", url: "http://company.com" } },
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
                "name": { tag: "Url", value: { text: "Company", url: "http://company.com" } },
                "position": { tag: "String", value: "President" },
                "url": { tag: "String", value: "http://company.com" },
                "startDate": { tag: "String", value: "2013-01-01" },
                "endDate": { tag: "String", value: "2014-01-01" },
                "summary": { tag: "String", value: "Description..." },
                "highlights": { tag: "List", value: [{ "tag": "String", "value": "Started the company" }] },
            }
        }
    ]),
    Resume_1.ResumeSection.resumeSection("Volunteer Experience", "Volunteer Experience", "Volunteer Experience", {
        id: Utils.randomString(),
        fields: {}
    }, [
        {
            id: Utils.randomString(),
            fields: {
                "organization": { tag: "Url", value: { text: "Organization", url: "http://organization.com" } },
                "position": { tag: "String", value: "Volunteer" },
                "startDate": { tag: "String", value: "2012-01-01" },
                "endDate": { tag: "String", value: "2013-01-01" },
                "summary": { tag: "String", value: "Description..." },
                "highlights": { tag: "List", value: [{ "tag": "String", "value": "Awarded 'Volunteer of the Month'" }] },
            }
        },
        {
            id: Utils.randomString(),
            fields: {
                "organization": { tag: "Url", value: { text: "Organization", url: "http://organization.com" } },
                "position": { tag: "String", value: "Volunteer" },
                "startDate": { tag: "String", value: "2012-01-01" },
                "endDate": { tag: "String", value: "2013-01-01" },
                "summary": { tag: "String", value: "Description..." },
                "highlights": { tag: "List", value: [{ "tag": "String", "value": "Awarded 'Volunteer of the Month'" }] },
            }
        },
    ]),
    Resume_1.ResumeSection.resumeSection("Education", "Education", "Education", {
        id: Utils.randomString(),
        fields: {}
    }, [
        {
            id: Utils.randomString(),
            fields: {
                "institution": { tag: "Url", value: { text: "University", url: "http://university.com" } },
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
                "institution": { tag: "Url", value: { text: "University", url: "http://university.com" } },
                "area": { tag: "String", value: "Software Development" },
                "studyType": { tag: "String", value: "Bachelor" },
                "startDate": { tag: "String", value: "2011-01-01" },
                "endDate": { tag: "String", value: "2013-01-01" },
                "score": { tag: "String", value: "4.0" },
                "courses": { tag: "List", value: [{ "tag": "String", "value": "DB1101 - Basic SQL" }] },
            }
        },
    ]),
    Resume_1.ResumeSection.resumeSection("Awards", "Awards", "Awards", {
        id: Utils.randomString(),
        fields: {}
    }, [
        {
            id: Utils.randomString(),
            fields: {
                "title": { tag: "String", value: "Greatest Software Developer" },
                "awarder": { tag: "String", value: "SoftwareAwards.inc" },
                "date": { tag: "String", value: "01-01-1970" },
                "summary": { tag: "String", value: "An award given only to the best of the best" },
            }
        },
        {
            id: Utils.randomString(),
            fields: {
                "title": { tag: "String", value: "Greatest Software Developer" },
                "awarder": { tag: "String", value: "SoftwareAwards.inc" },
                "date": { tag: "String", value: "01-01-1970" },
                "summary": { tag: "String", value: "An award given only to the best of the best" },
            }
        },
    ]),
    Resume_1.ResumeSection.resumeSection("Certificates", "Certificates", "Certificates", {
        id: Utils.randomString(),
        fields: {}
    }, [
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "Url", value: { text: "Greatest Software Development Course", url: "www.google.com" } },
                "date": { tag: "String", value: "01-01-1970" },
                "issuer": { tag: "String", value: "An course that teaches only to the best of the best" },
            }
        },
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "Url", value: { text: "Greatest Software Development Course", url: "www.google.com" } },
                "date": { tag: "String", value: "01-01-1970" },
                "issuer": { tag: "String", value: "An course that teaches only to the best of the best" },
            }
        },
    ]),
    Resume_1.ResumeSection.resumeSection("Publications", "Publications", "Publications", {
        id: Utils.randomString(),
        fields: {}
    }, [
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "Url", value: { text: "How to develop good software", url: "www.google.com" } },
                "publisher": { tag: "String", value: "SoftwareAwards.inc" },
                "releaseDate": { tag: "String", value: "01-01-1970" },
                "summary": { tag: "String", value: "A publication worthy of the best of the best" },
            }
        },
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "Url", value: { text: "How to develop good software", url: "www.google.com" } },
                "publisher": { tag: "String", value: "SoftwareAwards.inc" },
                "releaseDate": { tag: "String", value: "01-01-1970" },
                "summary": { tag: "String", value: "A publication worthy of the best of the best" },
            }
        },
    ]),
    Resume_1.ResumeSection.resumeSection("Skills", "Skills", "Skills", {
        id: Utils.randomString(),
        fields: {}
    }, [
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "String", value: "Software Development" },
                "level": { tag: "String", value: "Senior" },
                "keywords": { tag: "List", value: [{ tag: "String", value: "Javascript" }, { tag: "String", value: "Typescript" }] },
            }
        },
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "String", value: "Software Development" },
                "level": { tag: "String", value: "Senior" },
                "keywords": { tag: "List", value: [{ tag: "String", value: "Javascript" }, { tag: "String", value: "Typescript" }] },
            }
        },
    ]),
    Resume_1.ResumeSection.resumeSection("Languages", "Languages", "Languages", {
        id: Utils.randomString(),
        fields: {}
    }, [
        {
            id: Utils.randomString(),
            fields: {
                "language": { tag: "String", value: "Turkish" },
                "fluency": { tag: "String", value: "Native" },
            }
        },
        {
            id: Utils.randomString(),
            fields: {
                "language": { tag: "String", value: "English" },
                "fluency": { tag: "String", value: "Proficient" },
            }
        },
    ]),
    Resume_1.ResumeSection.resumeSection("Interests", "Interests", "Interests", {
        id: Utils.randomString(),
        fields: {}
    }, [
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "String", value: "Software Development" },
                "keywords": { tag: "List", value: [{ tag: "String", value: "Javascript" }, { tag: "String", value: "Typescript" }] },
            }
        },
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "String", value: "Software Development" },
                "keywords": { tag: "List", value: [{ tag: "String", value: "Javascript" }, { tag: "String", value: "Typescript" }] },
            }
        },
    ]),
    Resume_1.ResumeSection.resumeSection("References", "References", "References", {
        id: Utils.randomString(),
        fields: {}
    }, [
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "String", value: "Ken Thompson" },
                "reference": { tag: "String", value: "Legendary Programmer" },
            }
        },
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "String", value: "Alperen Keles" },
                "reference": { tag: "String", value: "Random fun guy" },
            }
        },
    ]),
    Resume_1.ResumeSection.resumeSection("Projects", "Projects", "Projects", {
        id: Utils.randomString(),
        fields: {}
    }, [
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "Url", value: { text: "Tail", url: "http://tail.rocks" } },
                "startDate": { tag: "String", value: "2012-01-01" },
                "endDate": { tag: "String", value: "Never ends" },
                "description": { tag: "String", value: "Next generation document builder" },
                "highlights": { tag: "List", value: [{ "tag": "String", "value": "Looks pretty cool" }] },
            }
        },
        {
            id: Utils.randomString(),
            fields: {
                "name": { tag: "Url", value: { text: "Tail", url: "http://tail.rocks" } },
                "startDate": { tag: "String", value: "2012-01-01" },
                "endDate": { tag: "String", value: "Never ends" },
                "description": { tag: "String", value: "Next generation document builder" },
                "highlights": { tag: "List", value: [{ "tag": "String", "value": "Looks pretty cool" }] },
            }
        },
    ]),
];
exports.DefaultResume = Resume.resume("Default", "SingleColumnSchema", exports.DefaultSections);
