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
exports.instantiate = exports.boundWidth = exports.break_lines = exports.justifiedLines = exports.fillFonts = exports.parseMarkdownItem = exports.scaleWidth = exports.withBackgroundColor = exports.withWidth = exports.withAlignment = exports.withMargin = exports.withFont = exports.withTextWidth = exports.withIsFill = exports.asRef = exports.withIsRef = exports.withUrl = exports.withItem = exports.from = exports.default_ = exports.copy = exports.elem = void 0;
const Font = __importStar(require("./Font"));
const _1 = require(".");
const Row_1 = require("./Row");
const Resume_1 = require("./Resume");
const marked = __importStar(require("marked"));
const ts_pattern_1 = require("ts-pattern");
const Utils_1 = require("./Utils");
function defaultSpanProps() {
    return {
        is_italic: false,
        is_bold: false,
        is_code: false,
        is_link: false,
    };
}
function elem(item, url, is_ref, is_fill, is_markdown, text_width, font, margin, alignment, width, background_color) {
    return {
        tag: "Elem",
        item,
        url,
        is_ref,
        is_fill,
        is_markdown,
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
        is_markdown: false,
        text_width: _1.Width.default_(),
        font: Font.default_(),
        margin: _1.Margin.default_(),
        alignment: _1.Alignment.default_(),
        width: _1.Width.default_(),
        background_color: "Transparent",
    };
}
exports.default_ = default_;
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
function flatten(ts, sp) {
    const spans = [];
    for (const t of ts) {
        spans.push(...flattenToken(t, sp));
    }
    return spans;
}
function flattenToken(t, sp) {
    return (0, ts_pattern_1.match)(t)
        .returnType()
        .with({ type: "paragraph", tokens: ts_pattern_1.P.select("tokens") }, ({ tokens }) => {
        return flatten(tokens, sp);
    })
        .with({ type: "strong", tokens: ts_pattern_1.P.select("tokens") }, ({ tokens }) => {
        return flatten(tokens, { ...sp, is_bold: true });
    })
        .with({ type: "em", tokens: ts_pattern_1.P.select("tokens") }, ({ tokens }) => {
        return flatten(tokens, { ...sp, is_italic: true });
    })
        .with({ type: "codespan", text: ts_pattern_1.P.select("text") }, ({ text }) => {
        return [{ ...sp, is_code: true, text, link: null }];
    })
        .with({ type: "text", tokens: ts_pattern_1.P.select("tokens") }, ({ tokens }) => {
        return flatten(tokens, sp);
    })
        .with({ type: "text", text: ts_pattern_1.P.select("text") }, ({ text }) => {
        const result = [];
        if (text.startsWith(" ")) {
            result.push({ ...sp, text: " ", link: null });
        }
        result.push({ ...sp, text: text.trim(), link: null });
        if (text.endsWith(" ")) {
            result.push({ ...sp, text: " ", link: null });
        }
        else if (text.endsWith("\n")) {
            result.push({ ...sp, text: "\n", link: null });
        }
        return result;
    })
        .otherwise((e) => {
        // console.log(`Unknown token type: ${JSON.stringify(e)}`);
        return [{ ...defaultSpanProps(), text: e.raw, link: null }];
    });
}
function parseMarkdownItem(item) {
    const spans = [];
    for (const token of marked.lexer(item)) {
        spans.push(...flatten([token], defaultSpanProps()));
    }
    return spans;
}
exports.parseMarkdownItem = parseMarkdownItem;
function fillFonts(e, fonts) {
    const simpleSpans = e.is_markdown ? parseMarkdownItem(e.text) : [{ ...defaultSpanProps(), text: e.text, font: e.font, link: null }];
    const spans = [];
    for (const span of simpleSpans) {
        const font = e.is_markdown ? (0, Utils_1.with_)(e.font, ({
            // style: span.is_italic ? "Italic" : "Normal",
            weight: span.is_bold ? "Bold" : "Medium",
        })) : e.font;
        if (span.text === " ") {
            const width = Font.get_width(font, "-", fonts);
            spans.push({ ...span, font, width });
            continue;
        }
        if (span.text === "\n\n") {
            spans.push({ ...span, font, width: 0 });
            continue;
        }
        const words = span.text.split(/\s+/);
        words.forEach((word, index) => {
            const width = Font.get_width(font, word, fonts);
            spans.push({ ...span, text: word, font, width });
            if (index < words.length - 1) {
                spans.push({ ...span, text: " ", font, width: Font.get_width(font, " ", fonts) });
            }
        });
    }
    const text_width = spans.reduce((acc, span) => acc + span.width, 0);
    if (e.is_fill) {
        return (0, Utils_1.with_)(e, {
            width: _1.Width.absolute(Math.min(_1.Width.get_fixed_unchecked(e.width), text_width)),
            text_width: _1.Width.absolute(text_width),
            spans
        });
    }
    else {
        return (0, Utils_1.with_)(e, { text_width: _1.Width.absolute(text_width), spans });
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
            r.elements.push(elem(word, null, false, false, false, _1.Width.absolute(word_width), this.font, _1.Margin.default_(), _1.Alignment.default_(), _1.Width.absolute(word_width), this.background_color));
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
    const words = e.text.split(/\s+/);
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
function instantiate(e, section, fields) {
    if (!e.is_ref) {
        return e;
    }
    const itemType = fields.find(f => f.name === e.item);
    if (itemType.type.tag === "MarkdownString") {
        e.is_markdown = true;
    }
    const text = section.get(e.item);
    console.log(`Instantiating ${e.item} with ${JSON.stringify(text)}`);
    if (text === undefined) {
        return (0, Utils_1.with_)(e, { is_ref: false, text: "" });
    }
    else {
        if (text.tag === "Url") {
            return (0, Utils_1.with_)(e, { is_ref: false, text: text.value.text, url: text.value.url });
        }
        else {
            return (0, Utils_1.with_)(e, { is_ref: false, text: Resume_1.ItemContent.toString(text) });
        }
    }
}
exports.instantiate = instantiate;
