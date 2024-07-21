"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontStyles = exports.FontWeights = exports.get_height = exports.get_width = exports.full_name = exports.variants = exports.default_ = exports.fromJson = exports.font = void 0;
function font(name, size, weight, style, source) {
    return {
        name,
        size,
        weight,
        style,
        source,
    };
}
exports.font = font;
function fromJson(json) {
    return {
        ...default_(),
        name: json["name"],
        size: json["size"],
        weight: json["weight"],
        style: json["style"],
        source: json["source"],
    };
}
exports.fromJson = fromJson;
function default_() {
    return {
        name: "Exo",
        size: 12,
        weight: "Medium",
        style: "Normal",
        source: "System",
    };
}
exports.default_ = default_;
function variants(f) {
    const fonts = [];
    for (const weight of exports.FontWeights) {
        for (const style of exports.FontStyles) {
            fonts.push({
                ...f,
                weight,
                style,
            });
        }
    }
    return fonts;
}
exports.variants = variants;
function full_name(f) {
    return f.name + "-" + f.weight + (f.style === "Italic" ? "Italic" : "");
}
exports.full_name = full_name;
function get_width(f, text, fonts) {
    const font = fonts.get_font(full_name(f));
    return (font.layout(text).glyphs.reduce((acc, glyph) => acc + glyph.advanceWidth, 0) / font.unitsPerEm) * f.size;
}
exports.get_width = get_width;
function get_height(f, fonts) {
    const font = fonts.get_font(full_name(f));
    return (font.bbox.height / font.unitsPerEm) * f.size;
}
exports.get_height = get_height;
exports.FontWeights = [
    "ExtraLight",
    "Light",
    "Thin",
    "Medium",
    "Regular",
    "SemiBold",
    "Bold",
    "Black",
    "ExtraBold",
];
exports.FontStyles = [
    "Normal",
    "Italic",
];
