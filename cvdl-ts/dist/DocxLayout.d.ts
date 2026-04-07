import { Paragraph, Table } from "docx";
import { BackendRenderProps, RenderResult } from "./AnyLayout";
import * as Layout from "./Layout";
export type { RenderResult, BackendRenderProps as RenderProps };
type BlockElement = Paragraph | Table;
export declare const renderLayout: (layout: Layout.RenderedLayout) => BlockElement[];
export declare const render: (props: BackendRenderProps) => Promise<RenderResult>;
