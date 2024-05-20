import { Glyph } from "fontkit";
import { FontDict } from "./AnyLayout";

export class Font {
    name: string;
    size: number;
    weight: FontWeight;
    style: FontStyle;
    source: FontSource;

    constructor(name: string, size: number, weight: FontWeight, style: FontStyle, source: FontSource) {
        this.name = name;
        this.size = size;
        this.weight = weight;
        this.style = style;
        this.source = source;
    }

    static fromJson(json: unknown): Font {
        if (typeof json !== "object" || json === null) {
            return Font.default_();
        }

        const name = ("name" in json) ? json.name as string : "Exo";
        const size = ("size" in json) ? json.size as number : 12;
        const weight = ("weight" in json) ? json.weight as FontWeight : "Medium";
        const style = ("style" in json) ? json.style as FontStyle : "Normal";
        const source = ("source" in json) ? json.source as FontSource: "System";

        return new Font(
            name,
            size,
            weight,
            style,
            source
        )
    }

    toJson() : unknown {
        return {
            name: this.name,
            size: this.size,
            weight: this.weight,
            style: this.style,
            source: this.source
        }
    }

    static default_() : Font {
        return new Font("Exo", 12, "Medium", "Normal", "System");
    }
    
    full_name() : string {
        return this.name + "-" + this.weight + (this.style === "Italic" ? "Italic" : "");
    }

    get_width(text: string, fonts: FontDict) : number {
        const font = fonts.get_font(this.full_name());
        return (font.layout(text).glyphs.reduce((acc: number, glyph: Glyph) => acc + glyph.advanceWidth, 0) / font.unitsPerEm) * this.size;
    }

    get_height(fonts: FontDict) : number {
        const font = fonts.get_font(this.full_name());
        return (font.bbox.height / font.unitsPerEm) * this.size;
    }
    
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


