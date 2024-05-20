"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorage = void 0;
/// This module provides the abstractions for interacting with persistent storage.
/// The library follows the directory structure below:
///
/// projectdir/com.cvdl.cvdl/
/// ├── data/
///        ├── resumes
///             ├── resume1.json
///             ├── resume2.json
///        ├── data-schemas.json
///        ├── layout-schemas.json
///        |── resume-layouts.json
///
/// The resume.json files contain the resume information, as well as references to the
/// schema names.
///
/// This module provides 3 types of functionalities for all 4 data types:
///     1. List
///     2. Load
///     3. Save
// Initiation Function
const fs_1 = __importDefault(require("fs"));
const Resume_1 = require("./Resume");
const DataSchema_1 = require("./DataSchema");
const LayoutSchema_1 = require("./LayoutSchema");
const ResumeLayout_1 = require("./ResumeLayout");
class FileStorage {
    constructor(dir) {
        this.dir = "";
        this.dir = dir;
    }
    load_font(font) {
        throw new Error("Method not implemented.");
    }
    initiate_storage() {
        // Create data_dir/resumes if it does not exist
        fs_1.default.mkdirSync(this.dir + "/resumes", { recursive: true });
        // Create data_dir/data-schemas.json if it does not exist
        if (!fs_1.default.existsSync(this.dir + "/data-schemas.json")) {
            fs_1.default.writeFileSync(this.dir + "/data-schemas.json", "[]");
        }
        // Create data_dir/layout-schemas.json if it does not exist
        if (!fs_1.default.existsSync(this.dir + "/layout-schemas.json")) {
            fs_1.default.writeFileSync(this.dir + "/layout-schemas.json", "[]");
        }
        // Create data_dir/resume-layouts.json if it does not exist
        if (!fs_1.default.existsSync(this.dir + "/resume-layouts.json")) {
            fs_1.default.writeFileSync(this.dir + "/resume-layouts.json", "[]");
        }
        return;
    }
    async list_resumes() {
        const files = fs_1.default.readdirSync(this.dir + "/resumes");
        return Promise.resolve(files.map(file => file.replace(".json", "")));
    }
    async list_data_schemas() {
        const data_schemas = fs_1.default.readFileSync(this.dir + "/data-schemas.json");
        return Promise.resolve(JSON.parse(data_schemas.toString()).map((schema) => schema.schema_name));
    }
    async list_layout_schemas() {
        const layout_schemas = fs_1.default.readFileSync(this.dir + "/layout-schemas.json");
        return Promise.resolve(JSON.parse(layout_schemas.toString()).map((schema) => schema.schema_name));
    }
    async list_resume_layouts() {
        const resume_layouts = fs_1.default.readFileSync(this.dir + "/resume-layouts.json");
        return Promise.resolve(JSON.parse(resume_layouts.toString()).map((schema) => schema.schema_name));
    }
    // Loading Functions
    async load_resume(resume_name) {
        const resume = fs_1.default.readFileSync(this.dir + "/resumes/" + resume_name + ".json");
        return Promise.resolve(Resume_1.Resume.fromJson(JSON.parse(resume.toString())));
    }
    async load_data_schema(schema_name) {
        const data_schemas = fs_1.default.readFileSync(this.dir + "/data-schemas.json");
        return Promise.resolve(DataSchema_1.DataSchema.fromJson(JSON.parse(data_schemas.toString()).find((schema) => schema.schema_name === schema_name)));
    }
    async load_layout_schema(schema_name) {
        const layout_schemas = fs_1.default.readFileSync(this.dir + "/layout-schemas.json");
        return Promise.resolve(LayoutSchema_1.LayoutSchema.fromJson(JSON.parse(layout_schemas.toString()).find((schema) => schema.schema_name === schema_name)));
    }
    async load_resume_layout(schema_name) {
        const resume_layouts = fs_1.default.readFileSync(this.dir + "/resume-layouts.json");
        return Promise.resolve(ResumeLayout_1.ResumeLayout.fromJson(JSON.parse(resume_layouts.toString()).find((schema) => schema.schema_name === schema_name)));
    }
    // Saving Functions
    save_resume(resume_name, resume_data) {
        fs_1.default.writeFileSync(this.dir + "/resumes/" + resume_name + ".json", JSON.stringify(resume_data));
        return;
    }
    save_data_schema(data_schema) {
        const data_schemas = fs_1.default.readFileSync(this.dir + "/data-schemas.json");
        const data_schemas_json = JSON.parse(data_schemas.toString());
        const index = data_schemas_json.findIndex((schema) => schema.schema_name === data_schema.schema_name);
        if (index !== -1) {
            data_schemas_json[index] = data_schema;
        }
        else {
            data_schemas_json.push(data_schema);
        }
        fs_1.default.writeFileSync(this.dir + "/data-schemas.json", JSON.stringify(data_schemas_json));
        return;
    }
    save_layout_schema(layout_schema) {
        const layout_schemas = fs_1.default.readFileSync(this.dir + "/layout-schemas.json");
        const layout_schemas_json = JSON.parse(layout_schemas.toString());
        const index = layout_schemas_json.findIndex((schema) => schema.schema_name === layout_schema.schema_name);
        if (index !== -1) {
            layout_schemas_json[index] = layout_schema;
        }
        else {
            layout_schemas_json.push(layout_schema);
        }
        fs_1.default.writeFileSync(this.dir + "/layout-schemas.json", JSON.stringify(layout_schemas_json));
        return;
    }
    save_resume_layout(resume_layout) {
        const resume_layouts = fs_1.default.readFileSync(this.dir + "/resume-layouts.json");
        const resume_layouts_json = JSON.parse(resume_layouts.toString());
        const index = resume_layouts_json.findIndex((schema) => schema.schema_name === resume_layout.schema_name);
        if (index !== -1) {
            resume_layouts_json[index] = resume_layout;
        }
        else {
            resume_layouts_json.push(resume_layout);
        }
        fs_1.default.writeFileSync(this.dir + "/resume-layouts.json", JSON.stringify(resume_layouts_json));
        return;
    }
}
exports.FileStorage = FileStorage;
