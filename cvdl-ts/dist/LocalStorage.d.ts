/// <reference types="node" />
import { DataSchema } from "./DataSchema";
import { Font } from "./Font";
import { LayoutSchema } from "./LayoutSchema";
import { Resume } from "./Resume";
import { ResumeLayout } from "./ResumeLayout";
export declare class LocalStorage {
    initiate_storage(): Promise<void>;
    list_resumes(): string[];
    list_data_schemas(): string[];
    list_layout_schemas(): string[];
    list_resume_layouts(): string[];
    load_resume(resume_name: string): Resume;
    load_data_schema(schema_name: string): DataSchema;
    load_layout_schema(schema_name: string): LayoutSchema;
    load_resume_layout(schema_name: string): ResumeLayout;
    save_resume(resume_name: string, resume_data: Resume): void;
    save_data_schema(data_schema: DataSchema): void;
    save_layout_schema(layout_schema: LayoutSchema): void;
    save_resume_layout(resume_layout: ResumeLayout): void;
    load_font(font: Font): Promise<Buffer>;
}
