"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.instantiate = exports.boundWidth = exports.break_lines = exports.justifiedLines = exports.fillFonts = exports.scaleWidth = exports.withBackgroundColor = exports.withWidth = exports.withAlignment = exports.withMargin = exports.withFont = exports.withTextWidth = exports.withIsFill = exports.asRef = exports.withIsRef = exports.withUrl = exports.withItem = exports.from = exports.with_ = exports.default_ = exports.copy = exports.elem = void 0;
const Font = __importStar(require("./Font"));
const _1 = require(".");
const Row_1 = require("./Row");
const Resume_1 = require("./Resume");
function elem(item, url, is_ref, is_fill, text_width, font, margin, alignment, width, background_color) {
    return {
        tag: "Elem",
        item,
        url,
        is_ref,
        is_fill,
        text_width,
        font,
        margin,
        alignment,
        width,
        background_color,
    };
}
exports.elem = elem;
function copy(e) {
    return { ...e };
}
exports.copy = copy;
function default_() {
    return {
        tag: "Elem",
        item: "",
        url: null,
        is_ref: false,
        is_fill: false,
        text_width: _1.Width.default_(),
        font: Font.default_(),
        margin: _1.Margin.default_(),
        alignment: _1.Alignment.default_(),
        width: _1.Width.default_(),
        background_color: "Transparent",
    };
}
exports.default_ = default_;
function with_(e, w) {
    return { ...e, ...w };
}
exports.with_ = with_;
function from(w) {
    return { ...default_(), ...w };
}
exports.from = from;
function withItem(e, item) {
    return { ...e, item };
}
exports.withItem = withItem;
function withUrl(e, url) {
    return { ...e, url };
}
exports.withUrl = withUrl;
function withIsRef(e, is_ref) {
    return { ...e, is_ref };
}
exports.withIsRef = withIsRef;
function asRef(e) {
    return withIsRef(e, true);
}
exports.asRef = asRef;
function withIsFill(e, is_fill) {
    return { ...e, is_fill };
}
exports.withIsFill = withIsFill;
function withTextWidth(e, text_width) {
    return { ...e, text_width };
}
exports.withTextWidth = withTextWidth;
function withFont(e, font) {
    return { ...e, font };
}
exports.withFont = withFont;
function withMargin(e, margin) {
    return { ...e, margin };
}
exports.withMargin = withMargin;
function withAlignment(e, alignment) {
    return { ...e, alignment };
}
exports.withAlignment = withAlignment;
function withWidth(e, width) {
    return { ...e, width };
}
exports.withWidth = withWidth;
function withBackgroundColor(e, background_color) {
    return { ...e, background_color };
}
exports.withBackgroundColor = withBackgroundColor;
function scaleWidth(e, scale) {
    return withWidth(e, _1.Width.scale(e.width, scale));
}
exports.scaleWidth = scaleWidth;
function fillFonts(e, fonts) {
    const text_width_with_font = Font.get_width(e.font, e.item, fonts);
    if (e.is_fill) {
        return withTextWidth(withWidth(e, _1.Width.absolute(Math.min(_1.Width.get_fixed_unchecked(e.width), text_width_with_font))), _1.Width.absolute(text_width_with_font));
    }
    else {
        return withTextWidth(e, _1.Width.absolute(text_width_with_font));
    }
}
exports.fillFonts = fillFonts;
function justifiedLines(e, lines, font_dict) {
    const rowLines = [];
    for (const line of lines.slice(0, -1)) {
        const words = line.item.split(/\s+/);
        const r = (0, Row_1.row)([], line.margin, line.alignment, line.width, false, false);
        words.forEach(word => {
            const word_width = Font.get_width(e.font, word, font_dict);
            r.elements.push(elem(word, null, false, false, _1.Width.absolute(word_width), this.font, _1.Margin.default_(), _1.Alignment.default_(), _1.Width.absolute(word_width), this.background_color));
        });
        rowLines.push(Row_1.row);
    }
    rowLines.push((0, Row_1.row)([withAlignment(lines[lines.length - 1], "Left")], lines[0].margin, "Left", lines[0].width, false, false));
    return rowLines;
}
exports.justifiedLines = justifiedLines;
function break_lines(e, font_dict) {
    if (_1.Width.get_fixed_unchecked(e.text_width) <= _1.Width.get_fixed_unchecked(e.width)) {
        return [e];
    }
    const lines = [];
    // todo: I'm sure this implementation is pretty buggy. Note to future me, fix
    // this.
    const words = e.item.split(/\s+/);
    const widths = words.map((word) => Font.get_width(e.font, word, font_dict));
    const space_width = Font.get_width(e.font, " ", font_dict);
    let start = 0;
    let width = widths[0];
    const max_width = _1.Width.get_fixed_unchecked(e.width);
    for (let i = 1; i < words.length; i++) {
        const candidate_width = width + space_width + widths[i];
        if (candidate_width > max_width) {
            const line = words.slice(start, i).join(" ");
            const line_width = Font.get_width(e.font, line, font_dict);
            lines.push(withTextWidth(withItem(e, line), _1.Width.absolute(line_width)));
            start = i;
            width = widths[i];
        }
        else {
            width += space_width + widths[i];
        }
    }
    const line = words.slice(start).join(" ");
    const line_width = Font.get_width(e.font, line, font_dict);
    lines.push(withTextWidth(withItem(e, line), _1.Width.absolute(line_width)));
    if (e.alignment === "Justified") {
        return justifiedLines(e, lines, font_dict);
    }
    return lines;
}
exports.break_lines = break_lines;
function boundWidth(e, width) {
    if (!_1.Width.is_fill(e.width)) {
        return withIsFill(withWidth(e, _1.Width.absolute(Math.min(_1.Width.get_fixed_unchecked(e.width), width))), false);
    }
    else {
        return withIsFill(withWidth(e, _1.Width.absolute(width)), true);
    }
}
exports.boundWidth = boundWidth;
function instantiate(e, section) {
    if (!e.is_ref) {
        return e;
    }
    const text = section.get(e.item);
    if (text === undefined) {
        return withIsRef(withItem(e, ""), false);
    }
    else {
        if (text.tag === "Url") {
            return withIsRef(withUrl(withItem(e, text.value.text), text.value.url), false);
        }
        else {
            return withIsRef(withItem(e, Resume_1.ItemContent.toString(text)), false);
        }
    }
}
exports.instantiate = instantiate;
