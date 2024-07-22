import { FontDict } from "./AnyLayout";
export type t = {
    name: string;
    size: number;
    weight: FontWeight;
    style: FontStyle;
};
type Font = t;
export declare function font(name: string, size: number, weight: FontWeight, style: FontStyle): Font;
export declare function default_(): Font;
export declare function variants(f: Font): Font[];
export declare function full_name(f: Font): string;
export declare function get_width(f: Font, text: string, fonts: FontDict): number;
export declare function get_height(f: Font, fonts: FontDict): number;
export type FontWeight = "Medium" | "Bold";
export type FontStyle = "Normal" | "Italic";
export declare const FontStyles: readonly ["Normal", "Italic"];
export {};
