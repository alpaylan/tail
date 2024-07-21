"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailableFonts = exports.FontStyles = exports.FontWeights = void 0;
exports.font = font;
exports.fromJson = fromJson;
exports.default_ = default_;
exports.variants = variants;
exports.full_name = full_name;
exports.get_width = get_width;
exports.get_height = get_height;
function font(name, size, weight, style, source) {
    return {
        name,
        size,
        weight,
        style,
        source,
    };
}
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
function default_() {
    return {
        name: "Exo",
        size: 12,
        weight: "Medium",
        style: "Normal",
        source: "System",
    };
}
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
exports.AvailableFonts = [
    "EBGaramond",
    "Exo",
    "Inter",
    "JetBrainsMono",
    "Montserrat",
    "Merriweather",
    "NotoSerif",
    "OpenSans",
    "Roboto",
    "RobotoMono",
];
