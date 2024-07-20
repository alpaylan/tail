import { DataSchema } from "./DataSchema";
import * as Font from "./Font";
import { LayoutSchema } from "./LayoutSchema";
import { Resume } from "./Resume";
import { ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";

export class LocalStorage implements Storage {
	prefix: string;
	constructor() {
		this.prefix = "https://d2bnplhbawocbk.cloudfront.net/data/";
	}

	async initiate_storage(): Promise<void> {
		if (!localStorage.getItem("resumes")) {
			fetch(
				"https://d2bnplhbawocbk.cloudfront.net/data/resumes/resume5.json",
			).then((response) => {
				response.json().then((resume) => {
					localStorage.setItem(
						"resumes",
						JSON.stringify([{ name: "Default", data: resume }]),
					);
				});
			});
		}

		if (!localStorage.getItem("data_schemas")) {
			fetch(
				"https://d2bnplhbawocbk.cloudfront.net/data/data-schemas.json",
			).then((response) => {
				response.json().then((data_schemas) => {
					localStorage.setItem("data_schemas", JSON.stringify(data_schemas));
				});
			});
		}

		if (!localStorage.getItem("section_layouts")) {
			fetch(
				"https://d2bnplhbawocbk.cloudfront.net/data/layout-schemas3.json",
			).then((response) => {
				response.json().then((section_layouts) => {
					localStorage.setItem(
						"section_layouts",
						JSON.stringify(section_layouts),
					);
				});
			});
		}

		if (!localStorage.getItem("resume_layouts")) {
			const response = await fetch(
				"https://d2bnplhbawocbk.cloudfront.net/data/resume-layouts.json",
			);
			const resume_layouts = await response.json();
			localStorage.setItem("resume_layouts", JSON.stringify(resume_layouts));
			return Promise.resolve();
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
	load_resume(resume_name: string): Promise<Resume> {
		const resume = JSON.parse(localStorage.getItem("resumes") || "[]").find(
			(resume: any) => resume.name === resume_name,
		);
		if (!resume) {
			throw new Error(`Resume(${resume_name}) not found`);
		}
		return Promise.resolve(Resume.fromJson(resume.data));
	}
	load_data_schema(schema_name: string): Promise<DataSchema> {
		const schema = JSON.parse(
			localStorage.getItem("data_schemas") || "[]",
		).find((schema: any) => schema.schema_name === schema_name);
		if (!schema) {
			throw new Error(`Data Schema(${schema_name}) not found`);
		}
		return Promise.resolve(DataSchema.fromJson(schema));
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
	save_resume(resume_name: string, resume_data: Resume): Promise<void> {
		const resumes = JSON.parse(localStorage.getItem("resumes") || "[]");
		const resume = resumes.find((resume: any) => resume.name === resume_name);
		if (!resume) {
			resumes.push({ name: resume_name, data: resume_data.toJson() });
		} else {
			resume.data = resume_data.toJson();
		}
		localStorage.setItem("resumes", JSON.stringify(resumes));

		return Promise.resolve();
	}
	save_data_schema(data_schema: DataSchema): Promise<void> {
		const schemasDirectMapped = JSON.parse(
			localStorage.getItem("data_schemas") || "[]",
		);
		const schemas = schemasDirectMapped.map((schema: any) =>
			DataSchema.fromJson(schema),
		);
		const schema = schemas.find(
			(schema: DataSchema) => schema.schema_name === data_schema.schema_name,
		);
		if (!schema) {
			schemas.push(data_schema);
		} else {
			schema.header_schema = data_schema.header_schema;
			schema.item_schema = data_schema.item_schema;
		}
		localStorage.setItem(
			"data_schemas",
			JSON.stringify(schemas.map((schema: DataSchema) => schema.toJson())),
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
	
	async load_font(font: Font.t): Promise<Buffer> {
		const path = `fonts/${Font.full_name(font)}.ttf`;
		if (!localStorage.getItem(path)) {
			const response = await fetch(
				`https://d2bnplhbawocbk.cloudfront.net/data/${path}`,
			);
			const font_data = await response.arrayBuffer();
			return Buffer.from(font_data);
		}

    }
}
