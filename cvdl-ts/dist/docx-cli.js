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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const AnyLayout_1 = require("./AnyLayout");
const Defaults = __importStar(require("./Defaults"));
const DocxLayout = __importStar(require("./DocxLayout"));
const Resume = __importStar(require("./Resume"));
const Resume_1 = require("./Resume");
const FileStorage_1 = require("./FileStorage");
const Utils = __importStar(require("./Utils"));
// Convert a JsonResume JSON object to Tail's Resume.t format
function jsonResumeToTail(json) {
    const sections = [];
    const str = (v) => ({ tag: "String", value: String(v !== null && v !== void 0 ? v : "") });
    const url = (text, href) => ({
        tag: "Url",
        value: { text: String(text !== null && text !== void 0 ? text : ""), url: String(href !== null && href !== void 0 ? href : "") },
    });
    const list = (arr) => ({
        tag: "List",
        value: (arr !== null && arr !== void 0 ? arr : []).map((v) => ({ tag: "String", value: String(v) })),
    });
    const id = () => Utils.randomString();
    // Basics
    const basics = json.basics;
    if (basics) {
        sections.push(Resume_1.ResumeSection.resumeSection("Basics", "Basics", "Basics", {
            id: id(),
            fields: {
                name: str(basics.name),
                email: str(basics.email),
                phone: str(basics.phone),
            },
        }, []));
    }
    // Work
    const work = json.work;
    if (work === null || work === void 0 ? void 0 : work.length) {
        sections.push(Resume_1.ResumeSection.resumeSection("Work Experience", "Work Experience", "Work Experience", {
            id: id(),
            fields: {},
        }, work.map((w) => {
            var _a;
            return ({
                id: id(),
                fields: {
                    name: url(w.name, w.url),
                    position: str(w.position),
                    startDate: str(w.startDate),
                    endDate: str(w.endDate),
                    summary: str(w.summary),
                    highlights: list((_a = w.highlights) !== null && _a !== void 0 ? _a : []),
                },
            });
        })));
    }
    // Volunteer
    const volunteer = json.volunteer;
    if (volunteer === null || volunteer === void 0 ? void 0 : volunteer.length) {
        sections.push(Resume_1.ResumeSection.resumeSection("Volunteer Experience", "Volunteer Experience", "Volunteer Experience", {
            id: id(),
            fields: {},
        }, volunteer.map((v) => {
            var _a;
            return ({
                id: id(),
                fields: {
                    organization: url(v.organization, v.url),
                    position: str(v.position),
                    startDate: str(v.startDate),
                    endDate: str(v.endDate),
                    summary: str(v.summary),
                    highlights: list((_a = v.highlights) !== null && _a !== void 0 ? _a : []),
                },
            });
        })));
    }
    // Education
    const education = json.education;
    if (education === null || education === void 0 ? void 0 : education.length) {
        sections.push(Resume_1.ResumeSection.resumeSection("Education", "Education", "Education", {
            id: id(),
            fields: {},
        }, education.map((e) => {
            var _a;
            return ({
                id: id(),
                fields: {
                    institution: url(e.institution, e.url),
                    area: str(e.area),
                    studyType: str(e.studyType),
                    startDate: str(e.startDate),
                    endDate: str(e.endDate),
                    score: str(e.score),
                    courses: list((_a = e.courses) !== null && _a !== void 0 ? _a : []),
                },
            });
        })));
    }
    // Awards
    const awards = json.awards;
    if (awards === null || awards === void 0 ? void 0 : awards.length) {
        sections.push(Resume_1.ResumeSection.resumeSection("Awards", "Awards", "Awards", {
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
        }))));
    }
    // Certificates
    const certificates = json.certificates;
    if (certificates === null || certificates === void 0 ? void 0 : certificates.length) {
        sections.push(Resume_1.ResumeSection.resumeSection("Certificates", "Certificates", "Certificates", {
            id: id(),
            fields: {},
        }, certificates.map((c) => ({
            id: id(),
            fields: {
                name: url(c.name, c.url),
                date: str(c.date),
                issuer: str(c.issuer),
            },
        }))));
    }
    // Publications
    const publications = json.publications;
    if (publications === null || publications === void 0 ? void 0 : publications.length) {
        sections.push(Resume_1.ResumeSection.resumeSection("Publications", "Publications", "Publications", {
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
        }))));
    }
    // Skills
    const skills = json.skills;
    if (skills === null || skills === void 0 ? void 0 : skills.length) {
        sections.push(Resume_1.ResumeSection.resumeSection("Skills", "Skills", "Skills", {
            id: id(),
            fields: {},
        }, skills.map((s) => {
            var _a;
            return ({
                id: id(),
                fields: {
                    name: str(s.name),
                    level: str(s.level),
                    keywords: list((_a = s.keywords) !== null && _a !== void 0 ? _a : []),
                },
            });
        })));
    }
    // Languages
    const languages = json.languages;
    if (languages === null || languages === void 0 ? void 0 : languages.length) {
        sections.push(Resume_1.ResumeSection.resumeSection("Languages", "Languages", "Languages", {
            id: id(),
            fields: {},
        }, languages.map((l) => ({
            id: id(),
            fields: {
                language: str(l.language),
                fluency: str(l.fluency),
            },
        }))));
    }
    // Interests
    const interests = json.interests;
    if (interests === null || interests === void 0 ? void 0 : interests.length) {
        sections.push(Resume_1.ResumeSection.resumeSection("Interests", "Interests", "Interests", {
            id: id(),
            fields: {},
        }, interests.map((i) => {
            var _a;
            return ({
                id: id(),
                fields: {
                    name: str(i.name),
                    keywords: list((_a = i.keywords) !== null && _a !== void 0 ? _a : []),
                },
            });
        })));
    }
    // References
    const references = json.references;
    if (references === null || references === void 0 ? void 0 : references.length) {
        sections.push(Resume_1.ResumeSection.resumeSection("References", "References", "References", {
            id: id(),
            fields: {},
        }, references.map((r) => ({
            id: id(),
            fields: {
                name: str(r.name),
                reference: str(r.reference),
            },
        }))));
    }
    // Projects
    const projects = json.projects;
    if (projects === null || projects === void 0 ? void 0 : projects.length) {
        sections.push(Resume_1.ResumeSection.resumeSection("Projects", "Projects", "Projects", {
            id: id(),
            fields: {},
        }, projects.map((p) => {
            var _a;
            return ({
                id: id(),
                fields: {
                    name: url(p.name, p.url),
                    startDate: str(p.startDate),
                    endDate: str(p.endDate),
                    description: str(p.description),
                    highlights: list((_a = p.highlights) !== null && _a !== void 0 ? _a : []),
                },
            });
        })));
    }
    return Resume.resume("JsonResume", "SingleColumnSchema", sections);
}
async function main() {
    var _a;
    const outputPath = (_a = process.argv[2]) !== null && _a !== void 0 ? _a : "output.docx";
    const inputPath = process.argv[3];
    let resume;
    if (inputPath === null || inputPath === void 0 ? void 0 : inputPath.endsWith(".json")) {
        const json = JSON.parse((0, fs_1.readFileSync)(inputPath, "utf-8"));
        resume = jsonResumeToTail(json);
    }
    else if (inputPath === "comparison") {
        resume = Defaults.ComparisonResume;
    }
    else {
        resume = Defaults.DefaultResume;
    }
    const storage = new FileStorage_1.FileStorage("assets/fonts/");
    const fontDict = new AnyLayout_1.FontDict();
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
    (0, fs_1.writeFileSync)(outputPath, buffer);
    console.log(`Document saved to ${outputPath}`);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
