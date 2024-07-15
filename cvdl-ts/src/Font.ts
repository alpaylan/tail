import { Glyph } from "fontkit";
import { FontDict } from "./AnyLayout";

export type t = {
    name: string;
    size: number;
    weight: FontWeight;
    style: FontStyle;
    source: FontSource;
};
type Font = t;

export function font(name: string, size: number, weight: FontWeight, style: FontStyle, source: FontSource): Font {
    return {
        name,
        size,
        weight,
        style,
        source,
    };
}

export function fromJson(json: unknown): Font {
    return {
        ...default_(),
        name: json["name"],
        size: json["size"],
        weight: json["weight"],
        style: json["style"],
        source: json["source"],
    }
}
export function default_(): Font {
    return {
        name: "Exo",
        size: 12,
        weight: "Medium",
        style: "Normal",
        source: "System",
    };
}

export function full_name(f: Font): string {
    return f.name + "-" + f.weight + (f.style === "Italic" ? "Italic" : "");
}

export function get_width(f: Font, text: string, fonts: FontDict): number {
    const font = fonts.get_font(full_name(f));
    return (font.layout(text).glyphs.reduce((acc: number, glyph: Glyph) => acc + glyph.advanceWidth, 0) / font.unitsPerEm) * f.size;
}

export function get_height(f: Font, fonts: FontDict) : number {
    const font = fonts.get_font(full_name(f));
    return (font.bbox.height / font.unitsPerEm) * f.size;
}

export type FontSource =
    | "Local"
    | "System"
    | "Remote"


export type FontWeight =
    | "Light"
    | "Medium"
    | "Bold"


export type FontStyle =
    | "Normal"
    | "Italic"