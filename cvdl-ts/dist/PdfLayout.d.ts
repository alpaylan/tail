/// <reference types="pdfkit" />
import { FontDict } from "./AnyLayout";
import { Resume } from "./Resume";
import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import { ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";
import * as Elem from "./Elem";
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
export declare const render: ({ resume_name, resume, data_schemas, layout_schemas, resume_layout, storage, fontDict }: RenderProps) => Promise<RenderResult>;
type Tracker = {
    page: number;
    pageContainer: PDFKit.PDFDocument;
    height: number;
    layout: ResumeLayout;
    fontDict: FontDict;
};
export declare const mergeSpans: (spans: Elem.Span[]) => Elem.Span[];
export declare const renderSectionLayout: (layout: Layout.RenderedLayout, tracker: Tracker) => void;
export {};
