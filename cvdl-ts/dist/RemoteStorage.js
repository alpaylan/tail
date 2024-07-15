"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteStorage = void 0;
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
const Resume_1 = require("./Resume");
const DataSchema_1 = require("./DataSchema");
const LayoutSchema_1 = require("./LayoutSchema");
const ResumeLayout_1 = require("./ResumeLayout");
class RemoteStorage {
    constructor(url) {
        this.url = '';
        this.url = url;
    }
    initiate_storage() {
        throw new Error("Method not implemented.");
    }
    async list_resumes() {
        const response = await fetch(this.url + "/resumes");
        const resumes = await response.json();
        return resumes;
    }
    async list_data_schemas() {
        const response = await fetch(this.url + "/data_schemas");
        const resumes = await response.json();
        return resumes;
    }
    async list_layout_schemas() {
        const response = await fetch(this.url + "/layout_schemas");
        const resumes = await response.json();
        return resumes;
    }
    async list_resume_layouts() {
        const response = await fetch(this.url + "/resume_layouts");
        const resumes = await response.json();
        return resumes;
    }
    // Loading Functions
    async load_resume(resume_name) {
        const response = await fetch(this.url + "/resume/" + resume_name);
        const resume = await response.json();
        return Resume_1.Resume.fromJson(resume.data);
    }
    async load_data_schema(schema_name) {
        const response = await fetch(this.url + "/data_schema/" + schema_name);
        const schema = await response.json();
        return DataSchema_1.DataSchema.fromJson(schema);
    }
    async load_layout_schema(schema_name) {
        const response = await fetch(this.url + "/layout_schema/" + schema_name);
        const schema = await response.json();
        return LayoutSchema_1.LayoutSchema.fromJson(schema);
    }
    async load_resume_layout(schema_name) {
        const response = await fetch(this.url + "/resume_layout/" + schema_name);
        const schema = await response.json();
        return new ResumeLayout_1.ResumeLayout(schema.schema_name, schema.column_type, schema.margin, schema.width, schema.height);
    }
    // Saving Functions
    async save_resume(resume_name, resume_data) {
    }
    async save_data_schema(data_schema) {
    }
    async save_layout_schema(layout_schema) {
    }
    async save_resume_layout(resume_layout) {
    }
    async load_font(font) {
        const response = await fetch(this.url + "/font/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(font)
        });
        const font_data = await response.arrayBuffer();
        return Buffer.from(font_data);
    }
}
exports.RemoteStorage = RemoteStorage;
