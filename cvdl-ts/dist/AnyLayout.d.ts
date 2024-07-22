import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import { Storage } from "./Storage";
import { ResumeLayout } from "./ResumeLayout";
import * as fontkit from "fontkit";
import * as Layout from "./Layout";
import * as Resume from "./Resume";
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
    resume: Resume.t;
    layout_schemas: LayoutSchema[];
    data_schemas: DataSchema.t[];
    resume_layout: ResumeLayout;
    bindings: Map<string, unknown>;
    storage: Storage;
    fontDict?: FontDict;
};
export declare class FontDict {
    fonts: Map<string, fontkit.Font>;
    constructor();
    load_fonts(storage: Storage): Promise<this>;
    get_font(name: string): fontkit.Font;
}
export declare function render({ resume, layout_schemas, data_schemas, resume_layout, bindings, fontDict, }: RenderProps): Promise<Layout.RenderedLayout[]>;
