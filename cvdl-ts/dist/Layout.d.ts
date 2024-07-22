import * as Width from "./Width";
import * as Font from "./Font";
import { Box } from "./Box";
import { ElementPath, FontDict } from "./AnyLayout";
import { Point } from "./Point";
import * as Stack from "./Stack";
import * as Row from "./Row";
import * as Elem from "./Elem";
import { Field } from "./DataSchema";
import * as Alignment from "./Alignment";
import * as Margin from "./Margin";
import * as Resume from "./Resume";
export type Container = Stack.t | Row.t;
export type t = Stack.t | Row.t | Elem.t;
type Layout = t;
export type RenderedStack = Stack.t & {
    bounding_box: Box;
    elements: RenderedLayout[];
};
export type RenderedRow = Row.t & {
    bounding_box: Box;
    elements: RenderedLayout[];
};
export type Binding = {
    binding: string;
};
export type PreBindingElem = Elem.t & {
    width: Width.t | Binding;
    font: Font.t | Binding;
    margin: Margin.t | Binding;
    alignment: Alignment.t | Binding;
    background_color: Color | Binding;
};
export type PreBindingContainer = Container & {
    width: Width.t | Binding;
    margin: Margin.t | Binding;
    alignment: Alignment.t | Binding;
};
export type PreBindingLayout = PreBindingElem | PreBindingContainer;
export type BindedLayout = Layout;
export type RenderedElem = Elem.t & {
    bounding_box: Box;
};
export type RenderedLayout = (RenderedStack | RenderedRow | RenderedElem) & {
    path?: ElementPath;
};
export declare function default_(tag: string): Stack.t | Row.t | Elem.t;
export declare function empty(): Layout;
export declare function type_(l: Layout): string;
export declare function tag_(l: Layout): string;
export declare function isContainer(l: Layout): boolean;
export declare function isFill(l: Layout): boolean;
export declare function isRef(l: Layout): boolean;
export declare function fonts(l: Layout): Font.t[];
export declare function totalElementsWidth(l: Layout): number;
export declare function isInstantiated(l: Layout): boolean;
export declare function instantiate(l: PreBindingLayout, section: Resume.Item, fields: Field[], bindings: Map<string, unknown>): Layout;
export declare function boundWidth(l: Layout, width: number): Layout;
export declare function scaleWidth(l: Layout, document_width: number): Layout;
export declare function normalize(l: Layout, width: number, font_dict: FontDict): Layout;
export declare function fillFonts(l: Layout, font_dict: FontDict): Layout;
export declare function computeBoxes(l: Layout, font_dict: FontDict): RenderedLayout;
export declare function computeTextboxPositions(l: Layout, top_left: Point, font_dict: FontDict): {
    depth: number;
    renderedLayout: RenderedLayout;
};
export type Color = "Transparent" | "Light Yellow" | "Light Brown" | "Light Green" | "Light Beige" | "Light Blue" | "Blue";
export declare const ColorMap: {
    Transparent: string;
    "Light Yellow": string;
    "Light Brown": string;
    "Light Green": string;
    "Light Beige": string;
    "Light Blue": string;
    Blue: string;
};
export {};
