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
import fs from "fs";
import * as Resume from "./Resume";
import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import { ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";
import * as Font from "./Font";

export class FileStorage implements Storage {
	dir: string = "";

	constructor(dir: string) {
		this.dir = dir;
	}
	load_bindings(): Promise<Map<string, unknown>> {
		if (!fs.existsSync(this.dir + "/bindings.json")) {
			fs.writeFileSync(this.dir + "/bindings.json", "{}");
		}

		const bindingsObject = JSON.parse(
			fs.readFileSync(this.dir + "/bindings.json").toString(),
		);
		const bindings = new Map<string, unknown>();
		for (const [key, value] of Object.entries(bindingsObject)) {
			bindings.set(key, value);
		}
		return Promise.resolve(bindings);
	}

	save_bindings(bindings: Map<string, unknown>): Promise<void> {
		const bindingsObject: any = {};
		for (const [key, value] of bindings) {
			bindingsObject[key] = value;
		}
		fs.writeFileSync(
			this.dir + "/bindings.json",
			JSON.stringify(bindingsObject),
		);
		return Promise.resolve();
	}

	load_font(fontName: string): Promise<Buffer> {
		return Promise.resolve(fs.readFileSync(this.dir + fontName + ".ttf"));
	}

	initiate_storage(): Promise<void> {
		// Create data_dir/resumes if it does not exist
		fs.mkdirSync(this.dir + "/resumes", { recursive: true });

		// Create data_dir/data-schemas.json if it does not exist
		if (!fs.existsSync(this.dir + "/data-schemas.json")) {
			fs.writeFileSync(this.dir + "/data-schemas.json", "[]");
		}
		// Create data_dir/bindings.json if it does not exist
		if (!fs.existsSync(this.dir + "/bindings.json")) {
			fs.writeFileSync(this.dir + "/bindings.json", "{}");
		}
		// Create data_dir/layout-schemas.json if it does not exist
		if (!fs.existsSync(this.dir + "/layout-schemas.json")) {
			fs.writeFileSync(this.dir + "/layout-schemas.json", "[]");
		}
		// Create data_dir/resume-layouts.json if it does not exist
		if (!fs.existsSync(this.dir + "/resume-layouts.json")) {
			fs.writeFileSync(this.dir + "/resume-layouts.json", "[]");
		}

		return;
	}

	async list_resumes(): Promise<string[]> {
		const files = fs.readdirSync(this.dir + "/resumes");
		return Promise.resolve(files.map((file) => file.replace(".json", "")));
	}

	async list_data_schemas(): Promise<string[]> {
		const data_schemas = fs.readFileSync(this.dir + "/data-schemas.json");
		return Promise.resolve(
			JSON.parse(data_schemas.toString()).map(
				(schema: any) => schema.schema_name,
			),
		);
	}

	async list_layout_schemas(): Promise<string[]> {
		const layout_schemas = fs.readFileSync(this.dir + "/layout-schemas.json");
		return Promise.resolve(
			JSON.parse(layout_schemas.toString()).map(
				(schema: any) => schema.schema_name,
			),
		);
	}

	async list_resume_layouts(): Promise<string[]> {
		const resume_layouts = fs.readFileSync(this.dir + "/resume-layouts.json");
		return Promise.resolve(
			JSON.parse(resume_layouts.toString()).map(
				(schema: any) => schema.schema_name,
			),
		);
	}

	// Loading Functions

	async load_resume(resume_name: string): Promise<Resume.t> {
		const resume = fs.readFileSync(
			this.dir + "/resumes/" + resume_name + ".json",
		);
		return Promise.resolve(JSON.parse(resume.toString()));
	}

	async load_data_schema(schema_name: string): Promise<DataSchema.t> {
		const data_schemas = fs.readFileSync(this.dir + "/data-schemas.json");
		return Promise.resolve(
			JSON.parse(data_schemas.toString()).find(
				(schema: any) => schema.schema_name === schema_name,
			),
		);
	}

	async load_layout_schema(schema_name: string): Promise<LayoutSchema> {
		const layout_schemas = fs.readFileSync(this.dir + "/layout-schemas.json");
		return Promise.resolve(
			LayoutSchema.fromJson(
				JSON.parse(layout_schemas.toString()).find(
					(schema: any) => schema.schema_name === schema_name,
				),
			),
		);
	}

	async load_resume_layout(schema_name: string): Promise<ResumeLayout> {
		const resume_layouts = fs.readFileSync(this.dir + "/resume-layouts.json");
		return Promise.resolve(
			ResumeLayout.fromJson(
				JSON.parse(resume_layouts.toString()).find(
					(schema: any) => schema.schema_name === schema_name,
				),
			),
		);
	}

	// Saving Functions

	save_resume(resume_name: string, resume_data: Resume.t): Promise<void> {
		fs.writeFileSync(
			this.dir + "/resumes/" + resume_name + ".json",
			JSON.stringify(resume_data),
		);
		return;
	}

	save_data_schema(data_schema: DataSchema.t): Promise<void> {
		const data_schemas = fs.readFileSync(this.dir + "/data-schemas.json");
		const data_schemas_json = JSON.parse(data_schemas.toString());
		const index = data_schemas_json.findIndex(
			(schema: any) => schema.schema_name === data_schema.schema_name,
		);
		if (index !== -1) {
			data_schemas_json[index] = data_schema;
		} else {
			data_schemas_json.push(data_schema);
		}
		fs.writeFileSync(
			this.dir + "/data-schemas.json",
			JSON.stringify(data_schemas_json),
		);
		return;
	}

	save_layout_schema(layout_schema: LayoutSchema): Promise<void> {
		const layout_schemas = fs.readFileSync(this.dir + "/layout-schemas.json");
		const layout_schemas_json = JSON.parse(layout_schemas.toString());
		const index = layout_schemas_json.findIndex(
			(schema: any) => schema.schema_name === layout_schema.schema_name,
		);
		if (index !== -1) {
			layout_schemas_json[index] = layout_schema;
		} else {
			layout_schemas_json.push(layout_schema);
		}
		fs.writeFileSync(
			this.dir + "/layout-schemas.json",
			JSON.stringify(layout_schemas_json),
		);
		return;
	}

	save_resume_layout(resume_layout: ResumeLayout): Promise<void> {
		const resume_layouts = fs.readFileSync(this.dir + "/resume-layouts.json");
		const resume_layouts_json = JSON.parse(resume_layouts.toString());
		const index = resume_layouts_json.findIndex(
			(schema: any) => schema.schema_name === resume_layout.schema_name,
		);
		if (index !== -1) {
			resume_layouts_json[index] = resume_layout;
		} else {
			resume_layouts_json.push(resume_layout);
		}
		fs.writeFileSync(
			this.dir + "/resume-layouts.json",
			JSON.stringify(resume_layouts_json),
		);
		return;
	}
}
