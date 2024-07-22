import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import * as Resume from "./Resume";
import { ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";
import * as Defaults from "./Defaults";

export class LocalStorage implements Storage {
	prefix: string;
	constructor() {
		this.prefix = "https://d2bnplhbawocbk.cloudfront.net/data/";
	}

	save_bindings(bindings: Map<string, unknown>): Promise<void> {
		const bindingsObject: any = {};
		for (const [key, value] of bindings) {
			bindingsObject[key] = value;
		}
		localStorage.setItem("bindings", JSON.stringify(bindingsObject));
		return Promise.resolve();
	}

	async initiate_storage(): Promise<void> {
		if (!localStorage.getItem("resumes")) {
			localStorage.setItem("resumes", JSON.stringify([Defaults.DefaultResume]));
		}

		if (!localStorage.getItem("data_schemas")) {
			localStorage.setItem("data_schemas", JSON.stringify(Defaults.DefaultDataSchemas));
		}

		if (!localStorage.getItem("section_layouts")) {
			localStorage.setItem(
				"section_layouts",
				JSON.stringify(Defaults.DefaultLayoutSchemas),
			);
		}

		if (!localStorage.getItem("resume_layouts")) {
			localStorage.setItem(
				"resume_layouts",
				JSON.stringify([Defaults.DefaultResumeLayout]),
			);
		}
	}

	list_resumes(): Promise<string[]> {
		const resumes = JSON.parse(localStorage.getItem("resumes") || "[]").map(
			(resume: any) => resume.name,
		);
		return Promise.resolve(resumes);
	}

	list_data_schemas(): Promise<string[]> {
		const schemas = JSON.parse(
			localStorage.getItem("data_schemas") || "[]",
		).map((schema: any) => schema.schema_name);
		return Promise.resolve(schemas);
	}

	list_layout_schemas(): Promise<string[]> {
		const schemas = JSON.parse(
			localStorage.getItem("section_layouts") || "[]",
		).map((schema: any) => schema.schema_name);
		return Promise.resolve(schemas);
	}

	list_resume_layouts(): Promise<string[]> {
		const schemas = JSON.parse(
			localStorage.getItem("resume_layouts") || "[]",
		).map((schema: any) => schema.schema_name);
		return Promise.resolve(schemas);
	}

	load_resume(resume_name: string): Promise<Resume.t> {
		const resume = JSON.parse(localStorage.getItem("resumes") || "[]").find(
			(resume: any) => resume.name === resume_name,
		);
		if (!resume) {
			throw new Error(`Resume(${resume_name}) not found`);
		}
		return Promise.resolve(resume);
	}

	load_data_schema(schema_name: string): Promise<DataSchema.t> {
		const schema = JSON.parse(
			localStorage.getItem("data_schemas") || "[]",
		).find((schema: any) => schema.schema_name === schema_name);
		if (!schema) {
			throw new Error(`Data Schema(${schema_name}) not found`);
		}
		return Promise.resolve(schema);
	}

	load_bindings(): Promise<Map<string, unknown>> {
		if (!localStorage.getItem("bindings")) {
			localStorage.setItem("bindings", JSON.stringify({}));
		}
		const bindingsObject = JSON.parse(localStorage.getItem("bindings") || "{}");
		const bindings = new Map<string, unknown>();
		for (const [key, value] of Object.entries(bindingsObject)) {
			bindings.set(key, value);
		}
		return Promise.resolve(bindings);
	}

	load_layout_schema(schema_name: string): Promise<LayoutSchema> {
		const schema = JSON.parse(
			localStorage.getItem("section_layouts") || "[]",
		).find((schema: any) => schema.schema_name === schema_name);
		if (!schema) {
			throw new Error(`Layout Schema(${schema_name}) not found`);
		}
		return Promise.resolve(LayoutSchema.fromJson(schema));
	}
	load_resume_layout(schema_name: string): Promise<ResumeLayout> {
		const schema = JSON.parse(
			localStorage.getItem("resume_layouts") || "[]",
		).find((schema: any) => schema.schema_name === schema_name);
		if (!schema) {
			throw new Error(`Resume Layout(${schema_name}) not found`);
		}
		return Promise.resolve(ResumeLayout.fromJson(schema));
	}
	save_resume(resume_name: string, resume_data: Resume.t): Promise<void> {
		const resumes = JSON.parse(localStorage.getItem("resumes") || "[]");
		let resumeIndex = resumes.findIndex((resume: any) => resume.name === resume_name);
		if (resumeIndex === -1) {
			resumes.push(resume_data);
		} else {
			resumes[resumeIndex] = resume_data;
		}
		localStorage.setItem("resumes", JSON.stringify(resumes));

		return Promise.resolve();
	}
	save_data_schema(data_schema: DataSchema.t): Promise<void> {
		const schemas = JSON.parse(
			localStorage.getItem("data_schemas") || "[]",
		);
		const schema = schemas.find(
			(schema: DataSchema.t) => schema.schema_name === data_schema.schema_name,
		);
		if (!schema) {
			schemas.push(data_schema);
		} else {
			schema.header_schema = data_schema.header_schema;
			schema.item_schema = data_schema.item_schema;
		}
		localStorage.setItem(
			"data_schemas",
			JSON.stringify(schemas),
		);

		return Promise.resolve();
	}
	save_layout_schema(layout_schema: LayoutSchema): Promise<void> {
		const schemasDirectMapped = JSON.parse(
			localStorage.getItem("section_layouts") || "[]",
		);
		const schemas = schemasDirectMapped.map((schema: any) =>
			LayoutSchema.fromJson(schema),
		);
		const schema = schemas.find(
			(schema: LayoutSchema) =>
				schema.schema_name === layout_schema.schema_name,
		);
		if (!schema) {
			schemas.push(layout_schema);
		} else {
			schema.header_layout_schema = layout_schema.header_layout_schema;
			schema.item_layout_schema = layout_schema.item_layout_schema;
		}
		localStorage.setItem(
			"section_layouts",
			JSON.stringify(schemas.map((schema: LayoutSchema) => schema.toJson())),
		);

		return Promise.resolve();
	}
	save_resume_layout(resume_layout: ResumeLayout): Promise<void> {
		throw new Error("Method not implemented.");
	}
	async load_font(fontName: string): Promise<Buffer> {
		const path = `fonts/${fontName}.ttf`;
		if (!localStorage.getItem(path)) {
			const response = await fetch(
				`https://d2bnplhbawocbk.cloudfront.net/data/${path}`,
			);
			const font_data = await response.arrayBuffer();
			return Buffer.from(font_data);
		}

		throw new Error("Font not found");
	}
}
