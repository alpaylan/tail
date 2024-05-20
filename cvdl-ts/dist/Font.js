"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Font = void 0;
class Font {
    constructor(name, size, weight, style, source) {
        this.name = name;
        this.size = size;
        this.weight = weight;
        this.style = style;
        this.source = source;
    }
    static fromJson(json) {
        if (typeof json !== "object" || json === null) {
            return Font.default_();
        }
        const name = ("name" in json) ? json.name : "Exo";
        const size = ("size" in json) ? json.size : 12;
        const weight = ("weight" in json) ? json.weight : "Medium";
        const style = ("style" in json) ? json.style : "Normal";
        const source = ("source" in json) ? json.source : "System";
        return new Font(name, size, weight, style, source);
    }
    toJson() {
        return {
            name: this.name,
            size: this.size,
            weight: this.weight,
            style: this.style,
            source: this.source
        };
    }
    static default_() {
        return new Font("Exo", 12, "Medium", "Normal", "System");
    }
    full_name() {
        return this.name + "-" + this.weight + (this.style === "Italic" ? "Italic" : "");
    }
    get_width(text, fonts) {
        const font = fonts.get_font(this.full_name());
        return (font.layout(text).glyphs.reduce((acc, glyph) => acc + glyph.advanceWidth, 0) / font.unitsPerEm) * this.size;
    }
    get_height(fonts) {
        const font = fonts.get_font(this.full_name());
        return (font.bbox.height / font.unitsPerEm) * this.size;
    }
}
exports.Font = Font;
