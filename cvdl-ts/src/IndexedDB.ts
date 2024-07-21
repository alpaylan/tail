
import { FontDict } from "./AnyLayout";
import { DataSchema } from "./DataSchema";
import * as Font from "./Font";
import { LayoutSchema } from "./LayoutSchema";
import { Resume } from "./Resume";
import { ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";
import { Dexie } from "dexie";
import * as fontkit from "fontkit";

export class IndexedDB implements Storage {
    async initiate_storage(): Promise<void> {
        const resumes = new Dexie("resumes") as Dexie & { resumes: Dexie.Table<{ name: string, data: Resume }> };
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


        const data_schemas = new Dexie("data_schemas") as Dexie & { data_schemas: Dexie.Table<DataSchema> };

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


        const section_layouts = new Dexie("section_layouts") as Dexie & { section_layouts: Dexie.Table<LayoutSchema> };

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

        const resume_layouts = new Dexie("resume_layouts") as Dexie & { resume_layouts: Dexie.Table<ResumeLayout> };

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


    list_resumes(): Promise<string[]> {
        const resumes = new Dexie("resumes") as Dexie & { resumes: Dexie.Table<{ name: string, data: Resume }> };
        resumes.version(1).stores({
            resumes: "name",
        });

        return resumes.resumes.toArray().then((resumes) => {
            return resumes.map((resume) => resume.name);
        });
    }

    list_data_schemas(): Promise<string[]> {
        const data_schemas = new Dexie("data_schemas") as Dexie & { data_schemas: Dexie.Table<DataSchema> };
        data_schemas.version(1).stores({
            data_schemas: "schema_name",
        });

        return data_schemas.data_schemas.toArray().then((schemas) => {
            return schemas.map((schema) => schema.schema_name);
        });
    }

    list_layout_schemas(): Promise<string[]> {
        const section_layouts = new Dexie("section_layouts") as Dexie & { section_layouts: Dexie.Table<LayoutSchema> };
        section_layouts.version(1).stores({
            section_layouts: "schema_name",
        });

        return section_layouts.section_layouts.toArray().then((schemas) => {
            return schemas.map((schema) => schema.schema_name);
        });
    }

    list_resume_layouts(): Promise<string[]> {
        const resume_layouts = new Dexie("resume_layouts") as Dexie & { resume_layouts: Dexie.Table<ResumeLayout> };
        resume_layouts.version(1).stores({
            resume_layouts: "schema_name",
        });

        return resume_layouts.resume_layouts.toArray().then((layouts) => {
            return layouts.map((layout) => layout.schema_name);
        });
    }

    load_resume(resume_name: string): Promise<Resume> {
        const resumes = new Dexie("resumes") as Dexie & { resumes: Dexie.Table<{ name: string, data: Resume }> };
        resumes.version(1).stores({
            resumes: "name",
        });

        return resumes.resumes.get(resume_name).then((resume) => {
            return Resume.fromJson(resume.data);
        });
    }

    load_data_schema(schema_name: string): Promise<DataSchema> {
        const data_schemas = new Dexie("data_schemas") as Dexie & { data_schemas: Dexie.Table<DataSchema> };
        data_schemas.version(1).stores({
            data_schemas: "schema_name",
        });

        return data_schemas.data_schemas.get(schema_name).then((schema) => {
            return DataSchema.fromJson(schema);
        });
    }

    load_layout_schema(schema_name: string): Promise<LayoutSchema> {
        const section_layouts = new Dexie("section_layouts") as Dexie & { section_layouts: Dexie.Table<LayoutSchema> };
        section_layouts.version(1).stores({
            section_layouts: "schema_name",
        });

        return section_layouts.section_layouts.get(schema_name).then((schema) => {
            return LayoutSchema.fromJson(schema);
        });
    }

    load_resume_layout(schema_name: string): Promise<ResumeLayout> {
        const resume_layouts = new Dexie("resume_layouts") as Dexie & { resume_layouts: Dexie.Table<ResumeLayout> };
        resume_layouts.version(1).stores({
            resume_layouts: "schema_name",
        });

        return resume_layouts.resume_layouts.get(schema_name).then((layout) => {
            return ResumeLayout.fromJson(layout);
        });
    }

    save_resume(resume_name: string, resume_data: Resume): Promise<void> {
        const resumes = new Dexie("resumes") as Dexie & { resumes: Dexie.Table<{ name: string, data: Resume }> };
        resumes.version(1).stores({
            resumes: "name",
        });

        resumes.resumes.put({ name: resume_name, data: resume_data });

        return Promise.resolve();
    }

    save_data_schema(data_schema: DataSchema): Promise<void> {
        const data_schemas = new Dexie("data_schemas") as Dexie & { data_schemas: Dexie.Table<DataSchema> };
        data_schemas.version(1).stores({
            data_schemas: "schema_name",
        });

        data_schemas.data_schemas.put(data_schema);

        return Promise.resolve();
    }

    save_layout_schema(layout_schema: LayoutSchema): Promise<void> {
        const section_layouts = new Dexie("section_layouts") as Dexie & { section_layouts: Dexie.Table<LayoutSchema> };
        section_layouts.version(1).stores({
            section_layouts: "schema_name",
        });

        section_layouts.section_layouts.put(layout_schema);

        return Promise.resolve();
    }

    save_resume_layout(resume_layout: ResumeLayout): Promise<void> {
        const resume_layouts = new Dexie("resume_layouts") as Dexie & { resume_layouts: Dexie.Table<ResumeLayout> };
        resume_layouts.version(1).stores({
            resume_layouts: "schema_name",
        });

        resume_layouts.resume_layouts.put(resume_layout);

        return Promise.resolve();
    }

    async load_font(font: Font.t): Promise<Buffer> {
        const path = `fonts/${Font.full_name(font)}.ttf`;
        const fonts = new Dexie("fonts") as Dexie & { fonts: Dexie.Table<{ name: string, success: boolean, data: Buffer }> };
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