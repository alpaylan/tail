"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontStyles = void 0;
exports.font = font;
exports.default_ = default_;
exports.full_name = full_name;
exports.get_width = get_width;
exports.get_height = get_height;
function font(name, size, weight, style) {
    return {
        name,
        size,
        weight,
        style,
    };
}
function default_() {
    return {
        name: "Exo",
        size: 12,
        weight: "Medium",
        style: "Normal",
    };
}
function full_name(f) {
    return f.name + "-" + f.weight + (f.style === "Italic" ? "Italic" : "");
}
function get_width(f, text, fonts) {
    const font = fonts.get_font(full_name(f));
    return ((font
        .layout(text)
        .glyphs.reduce((acc, glyph) => acc + glyph.advanceWidth, 0) /
        font.unitsPerEm) *
        f.size);
}
function get_height(f, fonts) {
    const font = fonts.get_font(full_name(f));
    return (font.bbox.height / font.unitsPerEm) * f.size;
}
exports.FontStyles = [
    "Normal",
    "Italic",
];
