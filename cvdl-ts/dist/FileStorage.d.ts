/// <reference types="node" />
import { Resume } from "./Resume";
import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import { ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";
import { Font } from "./Font";
export declare class FileStorage implements Storage {
    dir: string;
    constructor(dir: string);
    load_font(font: Font): Promise<Buffer>;
    initiate_storage(): Promise<void>;
    list_resumes(): Promise<string[]>;
    list_data_schemas(): Promise<string[]>;
    list_layout_schemas(): Promise<string[]>;
    list_resume_layouts(): Promise<string[]>;
    load_resume(resume_name: string): Promise<Resume>;
    load_data_schema(schema_name: string): Promise<DataSchema>;
    load_layout_schema(schema_name: string): Promise<LayoutSchema>;
    load_resume_layout(schema_name: string): Promise<ResumeLayout>;
    save_resume(resume_name: string, resume_data: Resume): Promise<void>;
    save_data_schema(data_schema: DataSchema): Promise<void>;
    save_layout_schema(layout_schema: LayoutSchema): Promise<void>;
    save_resume_layout(resume_layout: ResumeLayout): Promise<void>;
}
