/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { Resume } from "./Resume";
import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import { ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";
import { SectionLayout } from "./Layout";
import { Font } from "./Font";

export class RemoteStorage implements Storage {
    url: string = '';

    constructor(url: string) {
        this.url = url;
    }

    initiate_storage(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async list_resumes(): Promise<string[]> {
        const response = await fetch(this.url + "/resumes");
        const resumes = await response.json();
        return resumes;
    }

    async list_data_schemas(): Promise<string[]> {
        const response = await fetch(this.url + "/data_schemas");
        const resumes = await response.json();
        return resumes;
    }

    async list_layout_schemas(): Promise<string[]> {
        const response = await fetch(this.url + "/layout_schemas");
        const resumes = await response.json();
        return resumes;
    }

    async list_resume_layouts(): Promise<string[]> {
        const response = await fetch(this.url + "/resume_layouts");
        const resumes = await response.json();
        return resumes;
    }


    // Loading Functions

    async load_resume(resume_name: string): Promise<Resume> {
        const response = await fetch(this.url + "/resume/" + resume_name);
        const resume = await response.json();
        return Resume.fromJson(resume.data);
    }

    async load_data_schema(schema_name: string): Promise<DataSchema> {
        const response = await fetch(this.url + "/data_schema/" + schema_name);
        const schema = await response.json();
        return DataSchema.fromJson(schema);
    }

    async load_layout_schema(schema_name: string): Promise<LayoutSchema> {
        const response = await fetch(this.url + "/layout_schema/" + schema_name);
        const schema = await response.json();
        return LayoutSchema.fromJson(schema);
    }

    async load_resume_layout(schema_name: string): Promise<ResumeLayout> {
        const response = await fetch(this.url + "/resume_layout/" + schema_name);
        const schema = await response.json();
        return new ResumeLayout(schema.schema_name, schema.column_type, schema.margin, schema.width, schema.height)
    }


    // Saving Functions

    async save_resume(resume_name: string, resume_data: Resume) {

    }

    async save_data_schema(data_schema: DataSchema) {

    }

    async save_layout_schema(layout_schema: LayoutSchema) {

    }

    async save_resume_layout(resume_layout: ResumeLayout) {

    }

    async load_font(font: Font): Promise<Buffer> {
        const response = await fetch(this.url + "/font/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(font)
        });
        console.log(response);
        const font_data = await response.arrayBuffer();
        console.log(font_data);
        return Buffer.from(font_data);
    }
}
