import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import { Storage } from "./Storage";
import { Resume } from "./Resume";
import { ResumeLayout } from "./ResumeLayout";
import * as fontkit from "fontkit";
import { Layout } from ".";
export type ElementPath = {
    tag: "none";
} | {
    tag: "section";
    section: string;
} | {
    tag: "item";
    section: string;
    item: number;
} | {
    tag: "field";
    section: string;
    item: number;
    field: string;
};
export type RenderProps = {
    resume: Resume;
    layout_schemas: LayoutSchema[];
    data_schemas: DataSchema[];
    resume_layout: ResumeLayout;
    storage: Storage;
    fontDict?: FontDict;
};
export declare class FontDict {
    fonts: Map<string, fontkit.Font>;
    constructor();
    load_fonts_from_schema(schema: LayoutSchema, storage: Storage): Promise<void>;
    get_font(name: string): fontkit.Font;
}
export declare function render({ resume, layout_schemas, data_schemas, resume_layout, storage, fontDict, }: RenderProps): Promise<Layout.RenderedLayout[]>;
