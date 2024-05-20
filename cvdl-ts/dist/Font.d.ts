import { FontDict } from "./AnyLayout";
export declare class Font {
    name: string;
    size: number;
    weight: FontWeight;
    style: FontStyle;
    source: FontSource;
    constructor(name: string, size: number, weight: FontWeight, style: FontStyle, source: FontSource);
    static fromJson(json: unknown): Font;
    toJson(): unknown;
    static default_(): Font;
    full_name(): string;
    get_width(text: string, fonts: FontDict): number;
    get_height(fonts: FontDict): number;
}
export type FontSource = "Local" | "System" | "Remote";
export type FontWeight = "Light" | "Medium" | "Bold";
export type FontStyle = "Normal" | "Italic";
