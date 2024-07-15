/// <reference types="pdfkit" />
import { FontDict } from "./AnyLayout";
import { Resume } from "./Resume";
import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import { ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";
import { Layout } from ".";
export type RenderResult = {
    blob: Blob;
    fontDict: FontDict;
};
export type RenderProps = {
    resume_name?: string;
    resume?: Resume;
    data_schemas?: DataSchema[];
    layout_schemas?: LayoutSchema[];
    resume_layout?: ResumeLayout;
    storage: Storage;
    fontDict?: FontDict;
    debug: boolean;
};
export declare const render: ({ resume_name, resume, data_schemas, layout_schemas, resume_layout, storage, fontDict, debug }: RenderProps) => Promise<RenderResult>;
export declare const renderSectionLayout: (layout: Layout.RenderedLayout, resume_layout: ResumeLayout, current_height: number, doc: PDFKit.PDFDocument) => void;
