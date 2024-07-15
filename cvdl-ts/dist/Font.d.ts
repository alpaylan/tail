import { FontDict } from "./AnyLayout";
export type t = {
    name: string;
    size: number;
    weight: FontWeight;
    style: FontStyle;
    source: FontSource;
};
type Font = t;
export declare function font(name: string, size: number, weight: FontWeight, style: FontStyle, source: FontSource): Font;
export declare function fromJson(json: unknown): Font;
export declare function default_(): Font;
export declare function full_name(f: Font): string;
export declare function get_width(f: Font, text: string, fonts: FontDict): number;
export declare function get_height(f: Font, fonts: FontDict): number;
export type FontSource = "Local" | "System" | "Remote";
export type FontWeight = "Light" | "Medium" | "Bold";
export type FontStyle = "Normal" | "Italic";
export {};
