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
exports.LocalStorage = void 0;
const DataSchema_1 = require("./DataSchema");
const Font = __importStar(require("./Font"));
const LayoutSchema_1 = require("./LayoutSchema");
const Resume_1 = require("./Resume");
const ResumeLayout_1 = require("./ResumeLayout");
class LocalStorage {
    constructor() {
        this.prefix = "https://d2bnplhbawocbk.cloudfront.net/data/";
    }
    async initiate_storage() {
        if (!localStorage.getItem("resumes")) {
            fetch("https://d2bnplhbawocbk.cloudfront.net/data/resumes/resume5.json").then((response) => {
                response.json().then((resume) => {
                    localStorage.setItem("resumes", JSON.stringify([{ name: "Default", data: resume }]));
                });
            });
        }
        if (!localStorage.getItem("data_schemas")) {
            fetch("https://d2bnplhbawocbk.cloudfront.net/data/data-schemas.json").then((response) => {
                response.json().then((data_schemas) => {
                    localStorage.setItem("data_schemas", JSON.stringify(data_schemas));
                });
            });
        }
        if (!localStorage.getItem("section_layouts")) {
            fetch("https://d2bnplhbawocbk.cloudfront.net/data/layout-schemas3.json").then((response) => {
                response.json().then((section_layouts) => {
                    localStorage.setItem("section_layouts", JSON.stringify(section_layouts));
                });
            });
        }
        if (!localStorage.getItem("resume_layouts")) {
            const response = await fetch("https://d2bnplhbawocbk.cloudfront.net/data/resume-layouts.json");
            const resume_layouts = await response.json();
            localStorage.setItem("resume_layouts", JSON.stringify(resume_layouts));
            return Promise.resolve();
        }
    }
    list_resumes() {
        const resumes = JSON.parse(localStorage.getItem("resumes") || "[]").map((resume) => resume.name);
        return Promise.resolve(resumes);
    }
    list_data_schemas() {
        const schemas = JSON.parse(localStorage.getItem("data_schemas") || "[]").map((schema) => schema.schema_name);
        return Promise.resolve(schemas);
    }
    list_layout_schemas() {
        const schemas = JSON.parse(localStorage.getItem("section_layouts") || "[]").map((schema) => schema.schema_name);
        return Promise.resolve(schemas);
    }
    list_resume_layouts() {
        const schemas = JSON.parse(localStorage.getItem("resume_layouts") || "[]").map((schema) => schema.schema_name);
        return Promise.resolve(schemas);
    }
    load_resume(resume_name) {
        const resume = JSON.parse(localStorage.getItem("resumes") || "[]").find((resume) => resume.name === resume_name);
        if (!resume) {
            throw new Error(`Resume(${resume_name}) not found`);
        }
        return Promise.resolve(Resume_1.Resume.fromJson(resume.data));
    }
    load_data_schema(schema_name) {
        const schema = JSON.parse(localStorage.getItem("data_schemas") || "[]").find((schema) => schema.schema_name === schema_name);
        if (!schema) {
            throw new Error(`Data Schema(${schema_name}) not found`);
        }
        return Promise.resolve(DataSchema_1.DataSchema.fromJson(schema));
    }
    load_layout_schema(schema_name) {
        const schema = JSON.parse(localStorage.getItem("section_layouts") || "[]").find((schema) => schema.schema_name === schema_name);
        if (!schema) {
            throw new Error(`Layout Schema(${schema_name}) not found`);
        }
        return Promise.resolve(LayoutSchema_1.LayoutSchema.fromJson(schema));
    }
    load_resume_layout(schema_name) {
        const schema = JSON.parse(localStorage.getItem("resume_layouts") || "[]").find((schema) => schema.schema_name === schema_name);
        if (!schema) {
            throw new Error(`Resume Layout(${schema_name}) not found`);
        }
        return Promise.resolve(ResumeLayout_1.ResumeLayout.fromJson(schema));
    }
    save_resume(resume_name, resume_data) {
        const resumes = JSON.parse(localStorage.getItem("resumes") || "[]");
        const resume = resumes.find((resume) => resume.name === resume_name);
        if (!resume) {
            resumes.push({ name: resume_name, data: resume_data.toJson() });
        }
        else {
            resume.data = resume_data.toJson();
        }
        localStorage.setItem("resumes", JSON.stringify(resumes));
        return Promise.resolve();
    }
    save_data_schema(data_schema) {
        const schemasDirectMapped = JSON.parse(localStorage.getItem("data_schemas") || "[]");
        const schemas = schemasDirectMapped.map((schema) => DataSchema_1.DataSchema.fromJson(schema));
        const schema = schemas.find((schema) => schema.schema_name === data_schema.schema_name);
        if (!schema) {
            schemas.push(data_schema);
        }
        else {
            schema.header_schema = data_schema.header_schema;
            schema.item_schema = data_schema.item_schema;
        }
        localStorage.setItem("data_schemas", JSON.stringify(schemas.map((schema) => schema.toJson())));
        return Promise.resolve();
    }
    save_layout_schema(layout_schema) {
        const schemasDirectMapped = JSON.parse(localStorage.getItem("section_layouts") || "[]");
        const schemas = schemasDirectMapped.map((schema) => LayoutSchema_1.LayoutSchema.fromJson(schema));
        const schema = schemas.find((schema) => schema.schema_name === layout_schema.schema_name);
        if (!schema) {
            schemas.push(layout_schema);
        }
        else {
            schema.header_layout_schema = layout_schema.header_layout_schema;
            schema.item_layout_schema = layout_schema.item_layout_schema;
        }
        localStorage.setItem("section_layouts", JSON.stringify(schemas.map((schema) => schema.toJson())));
        return Promise.resolve();
    }
    save_resume_layout(resume_layout) {
        throw new Error("Method not implemented.");
    }
    async load_font(font) {
        const path = `fonts/${Font.full_name(font)}.ttf`;
        if (!localStorage.getItem(path)) {
            const response = await fetch(`https://d2bnplhbawocbk.cloudfront.net/data/${path}`);
            const font_data = await response.arrayBuffer();
            // localStorage.setItem(path, font_data.toString());
            return Buffer.from(font_data);
        }
        throw new Error("Font not found");
    }
}
exports.LocalStorage = LocalStorage;
