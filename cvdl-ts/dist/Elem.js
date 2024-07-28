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
exports.elem = elem;
exports.copy = copy;
exports.default_ = default_;
exports.from = from;
exports.withItem = withItem;
exports.withUrl = withUrl;
exports.withIsRef = withIsRef;
exports.asRef = asRef;
exports.withIsFill = withIsFill;
exports.withTextWidth = withTextWidth;
exports.withFont = withFont;
exports.withMargin = withMargin;
exports.withAlignment = withAlignment;
exports.withWidth = withWidth;
exports.withBackgroundColor = withBackgroundColor;
exports.scaleWidth = scaleWidth;
exports.parseMarkdownItem = parseMarkdownItem;
exports.fillFonts = fillFonts;
exports.boundWidth = boundWidth;
exports.bind = bind;
exports.instantiate = instantiate;
const Font = __importStar(require("./Font"));
const Alignment = __importStar(require("./Alignment"));
const Margin = __importStar(require("./Margin"));
const Width = __importStar(require("./Width"));
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
        text: item,
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
function copy(e) {
    return { ...e };
}
function default_() {
    return {
        tag: "Elem",
        item: "",
        text: "",
        url: null,
        is_ref: false,
        is_fill: false,
        is_markdown: false,
        text_width: Width.default_(),
        font: Font.default_(),
        margin: Margin.default_(),
        alignment: Alignment.default_(),
        width: Width.default_(),
        background_color: "Transparent",
    };
}
function from(w) {
    return { ...default_(), ...w, text: w.item };
}
function withItem(e, item) {
    return { ...e, item };
}
function withUrl(e, url) {
    return { ...e, url };
}
function withIsRef(e, is_ref) {
    return { ...e, is_ref };
}
function asRef(e) {
    return withIsRef(e, true);
}
function withIsFill(e, is_fill) {
    return { ...e, is_fill };
}
function withTextWidth(e, text_width) {
    return { ...e, text_width };
}
function withFont(e, font) {
    return { ...e, font };
}
function withMargin(e, margin) {
    return { ...e, margin };
}
function withAlignment(e, alignment) {
    return { ...e, alignment };
}
function withWidth(e, width) {
    return { ...e, width };
}
function withBackgroundColor(e, background_color) {
    return { ...e, background_color };
}
function scaleWidth(e, scale) {
    return withWidth(e, Width.scale(e.width, scale));
}
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
function fillFonts(e, fonts) {
    const simpleSpans = e.is_markdown
        ? parseMarkdownItem(e.text)
        : [{ ...defaultSpanProps(), text: e.text, font: e.font, link: null }];
    const spans = [];
    for (const span of simpleSpans) {
        const font = e.is_markdown
            ? (0, Utils_1.with_)(e.font, {
                style: span.is_italic ? "Italic" : e.font.style,
                weight: span.is_bold ? "Bold" : e.font.weight,
                name: span.is_code ? "SourceCodePro" : e.font.name,
            })
            : e.font;
        if (span.text === " ") {
            const width = Font.get_width(font, " ", fonts);
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
                spans.push({
                    ...span,
                    text: " ",
                    font,
                    width: Font.get_width(font, " ", fonts),
                });
            }
        });
    }
    const text_width = spans.reduce((acc, span) => acc + span.width, 0);
    if (e.is_fill) {
        return (0, Utils_1.with_)(e, {
            width: Width.absolute(Math.min(Width.get_fixed_unchecked(e.width), text_width)),
            text_width: Width.absolute(text_width),
            spans,
        });
    }
    else {
        return (0, Utils_1.with_)(e, { text_width: Width.absolute(text_width), spans });
    }
}
function boundWidth(e, width) {
    if (!Width.is_fill(e.width)) {
        return withIsFill(withWidth(e, Width.absolute(Math.min(Width.get_fixed_unchecked(e.width), width))), false);
    }
    else {
        return withIsFill(withWidth(e, Width.absolute(width)), true);
    }
}
function bind(t, bindings) {
    const result = {};
    for (const [key, value] of Object.entries(t)) {
        if (value instanceof Object && "binding" in value && typeof value.binding === "string") {
            const bound = bindings.get(value.binding);
            if (bound === undefined) {
                throw new Error(`Binding ${value.binding} not found`);
            }
            result[key] = bound;
        }
        else if (value instanceof Object) {
            result[key] = bind(value, bindings);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
function instantiate(e, section, fields, bindings) {
    e = bind(e, bindings);
    if (!e.is_ref) {
        return e;
    }
    const itemType = fields.find((f) => f.name === e.item);
    if (itemType.type.tag === "MarkdownString") {
        e.is_markdown = true;
    }
    const text = section.fields[e.item];
    if (text === undefined) {
        return (0, Utils_1.with_)(e, { is_ref: false, text: "" });
    }
    else {
        if (text.tag === "Url") {
            return (0, Utils_1.with_)(e, {
                is_ref: false,
                text: text.value.text,
                url: text.value.url,
            });
        }
        else {
            return (0, Utils_1.with_)(e, { is_ref: false, text: Resume_1.ItemContent.toString(text) });
        }
    }
}
