/// <reference types="node" />
import { DataSchema } from "./DataSchema";
import { Font } from "./Font";
import { LayoutSchema } from "./LayoutSchema";
import { Resume } from "./Resume";
import { ResumeLayout } from "./ResumeLayout";
export interface Storage {
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
    load_font(font: Font): Promise<Buffer>;
}
