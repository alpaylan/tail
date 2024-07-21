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
exports.IndexedDB = void 0;
const DataSchema_1 = require("./DataSchema");
const Font = __importStar(require("./Font"));
const LayoutSchema_1 = require("./LayoutSchema");
const Resume_1 = require("./Resume");
const ResumeLayout_1 = require("./ResumeLayout");
const dexie_1 = require("dexie");
class IndexedDB {
    async initiate_storage() {
        const resumes = new dexie_1.Dexie("resumes");
        resumes.version(1).stores({
            resumes: "name",
        });
        resumes.resumes.get("Default").then((resume) => {
            if (!resume) {
                fetch("https://d2bnplhbawocbk.cloudfront.net/data/resumes/resume5.json").then((response) => {
                    response.json().then((resume) => {
                        resumes.resumes.add({ name: "Default", data: resume });
                    });
                });
            }
        }).catch((error) => {
            console.error("Error getting resume", error);
        });
        const data_schemas = new dexie_1.Dexie("data_schemas");
        data_schemas.version(1).stores({
            data_schemas: "schema_name",
        });
        data_schemas.data_schemas.toArray().then((schemas) => {
            if (schemas.length === 0) {
                fetch("https://d2bnplhbawocbk.cloudfront.net/data/data-schemas.json").then((response) => {
                    response.json().then((schemas) => {
                        for (const schema of schemas) {
                            data_schemas.data_schemas.add(schema);
                        }
                    });
                });
            }
        });
        const section_layouts = new dexie_1.Dexie("section_layouts");
        section_layouts.version(1).stores({
            section_layouts: "schema_name",
        });
        section_layouts.section_layouts.toArray().then((schemas) => {
            if (schemas.length === 0) {
                fetch("https://d2bnplhbawocbk.cloudfront.net/data/layout-schemas3.json").then((response) => {
                    response.json().then((schemas) => {
                        for (const schema of schemas) {
                            section_layouts.section_layouts.add(schema);
                        }
                    });
                });
            }
        });
        const resume_layouts = new dexie_1.Dexie("resume_layouts");
        resume_layouts.version(1).stores({
            resume_layouts: "schema_name",
        });
        resume_layouts.resume_layouts.toArray().then((layouts) => {
            if (layouts.length === 0) {
                fetch("https://d2bnplhbawocbk.cloudfront.net/data/resume-layouts.json").then((response) => {
                    response.json().then((layouts) => {
                        for (const layout of layouts) {
                            resume_layouts.resume_layouts.add(layout);
                        }
                    });
                });
            }
        });
    }
    list_resumes() {
        const resumes = new dexie_1.Dexie("resumes");
        resumes.version(1).stores({
            resumes: "name",
        });
        return resumes.resumes.toArray().then((resumes) => {
            return resumes.map((resume) => resume.name);
        });
    }
    list_data_schemas() {
        const data_schemas = new dexie_1.Dexie("data_schemas");
        data_schemas.version(1).stores({
            data_schemas: "schema_name",
        });
        return data_schemas.data_schemas.toArray().then((schemas) => {
            return schemas.map((schema) => schema.schema_name);
        });
    }
    list_layout_schemas() {
        const section_layouts = new dexie_1.Dexie("section_layouts");
        section_layouts.version(1).stores({
            section_layouts: "schema_name",
        });
        return section_layouts.section_layouts.toArray().then((schemas) => {
            return schemas.map((schema) => schema.schema_name);
        });
    }
    list_resume_layouts() {
        const resume_layouts = new dexie_1.Dexie("resume_layouts");
        resume_layouts.version(1).stores({
            resume_layouts: "schema_name",
        });
        return resume_layouts.resume_layouts.toArray().then((layouts) => {
            return layouts.map((layout) => layout.schema_name);
        });
    }
    load_resume(resume_name) {
        const resumes = new dexie_1.Dexie("resumes");
        resumes.version(1).stores({
            resumes: "name",
        });
        return resumes.resumes.get(resume_name).then((resume) => {
            return Resume_1.Resume.fromJson(resume.data);
        });
    }
    load_data_schema(schema_name) {
        const data_schemas = new dexie_1.Dexie("data_schemas");
        data_schemas.version(1).stores({
            data_schemas: "schema_name",
        });
        return data_schemas.data_schemas.get(schema_name).then((schema) => {
            return DataSchema_1.DataSchema.fromJson(schema);
        });
    }
    load_layout_schema(schema_name) {
        const section_layouts = new dexie_1.Dexie("section_layouts");
        section_layouts.version(1).stores({
            section_layouts: "schema_name",
        });
        return section_layouts.section_layouts.get(schema_name).then((schema) => {
            return LayoutSchema_1.LayoutSchema.fromJson(schema);
        });
    }
    load_resume_layout(schema_name) {
        const resume_layouts = new dexie_1.Dexie("resume_layouts");
        resume_layouts.version(1).stores({
            resume_layouts: "schema_name",
        });
        return resume_layouts.resume_layouts.get(schema_name).then((layout) => {
            return ResumeLayout_1.ResumeLayout.fromJson(layout);
        });
    }
    save_resume(resume_name, resume_data) {
        const resumes = new dexie_1.Dexie("resumes");
        resumes.version(1).stores({
            resumes: "name",
        });
        resumes.resumes.put({ name: resume_name, data: resume_data });
        return Promise.resolve();
    }
    save_data_schema(data_schema) {
        const data_schemas = new dexie_1.Dexie("data_schemas");
        data_schemas.version(1).stores({
            data_schemas: "schema_name",
        });
        data_schemas.data_schemas.put(data_schema);
        return Promise.resolve();
    }
    save_layout_schema(layout_schema) {
        const section_layouts = new dexie_1.Dexie("section_layouts");
        section_layouts.version(1).stores({
            section_layouts: "schema_name",
        });
        section_layouts.section_layouts.put(layout_schema);
        return Promise.resolve();
    }
    save_resume_layout(resume_layout) {
        const resume_layouts = new dexie_1.Dexie("resume_layouts");
        resume_layouts.version(1).stores({
            resume_layouts: "schema_name",
        });
        resume_layouts.resume_layouts.put(resume_layout);
        return Promise.resolve();
    }
    async load_font(font) {
        const path = `fonts/${Font.full_name(font)}.ttf`;
        const fonts = new dexie_1.Dexie("fonts");
        fonts.version(1).stores({
            fonts: "name",
        });
        return fonts.fonts.get(path).then((font) => {
            if (font) {
                return font.data;
            }
            return fetch(`https://d2bnplhbawocbk.cloudfront.net/data/${path}`).then((response) => {
                if (!response.ok) {
                    console.error("Error loading font", response);
                    fonts.fonts.add({ name: path, success: false, data: Buffer.from("") });
                    return Buffer.from("");
                }
                return response.arrayBuffer().then((arrayBuffer) => {
                    const buffer = Buffer.from(arrayBuffer);
                    fonts.fonts.add({ name: path, success: true, data: buffer });
                    return buffer;
                });
            });
        });
    }
}
exports.IndexedDB = IndexedDB;
