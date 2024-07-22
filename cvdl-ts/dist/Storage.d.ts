import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import * as Resume from "./Resume";
import { ResumeLayout } from "./ResumeLayout";
export interface Storage {
    initiate_storage(): Promise<void>;
    list_resumes(): Promise<string[]>;
    list_data_schemas(): Promise<string[]>;
    list_layout_schemas(): Promise<string[]>;
    list_resume_layouts(): Promise<string[]>;
    load_resume(resume_name: string): Promise<Resume.t>;
    load_data_schema(schema_name: string): Promise<DataSchema.t>;
    load_bindings(): Promise<Map<string, unknown>>;
    load_layout_schema(schema_name: string): Promise<LayoutSchema>;
    load_resume_layout(schema_name: string): Promise<ResumeLayout>;
    save_resume(resume_name: string, resume_data: Resume.t): Promise<void>;
    save_data_schema(data_schema: DataSchema.t): Promise<void>;
    save_bindings(bindings: Map<string, unknown>): Promise<void>;
    save_layout_schema(layout_schema: LayoutSchema): Promise<void>;
    save_resume_layout(resume_layout: ResumeLayout): Promise<void>;
    load_font(fontName: string): Promise<Buffer>;
}
