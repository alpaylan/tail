
import * as Font from "./Font";
import { Alignment, Layout, Margin, Width } from ".";
import { Color } from "./Layout";
import { FontDict } from "./AnyLayout";
import { row } from "./Row";
import * as Row from "./Row";
import { ItemContent } from "./Resume";
import * as marked from "marked";
import { match, P } from "ts-pattern";
import { Field } from "./DataSchema";
import { Optional, with_ } from "./Utils";
import { Box } from "./Box";

type SpanProps = {
    is_italic: boolean;
    is_bold: boolean;
    is_code: boolean;
    is_link: boolean;
};

function defaultSpanProps(): SpanProps {
    return {
        is_italic: false,
        is_bold: false,
        is_code: false,
        is_link: false,
    };
}

export type Span = {
    is_italic: boolean;
    is_bold: boolean;
    is_code: boolean;
    text: string;
    link: string | null;
    font?: Font.t;
    width?: number;
    line?: number;
    bbox?: Box;
}


export type t = {
    tag: "Elem";
    item: string;
    text?: string;
    spans?: Span[];
    url: string | null;
    is_ref: boolean;
    is_fill: boolean;
    is_markdown: boolean;
    text_width: Width.t;
    font: Font.t;
    margin: Margin.t;
    alignment: Alignment.t;
    width: Width.t;
    background_color: Color;
};

type Elem = t;

export function elem(item: string, url: string | null, is_ref: boolean, is_fill: boolean, is_markdown: boolean, text_width: Width.t, font: Font.t, margin: Margin.t, alignment: Alignment.t, width: Width.t, background_color: Color): Elem {
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

export function copy(e: Elem) {
    return { ...e };
}

export function default_(): Elem {
    return {
        tag: "Elem",
        item: "",
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

export function from(w: Optional<Elem>): Elem {
    return { ...default_(), ...w };
}

export function withItem(e: Elem, item: string): Elem {
    return { ...e, item };
}

export function withUrl(e: Elem, url: string | null): Elem {
    return { ...e, url };
}

export function withIsRef(e: Elem, is_ref: boolean): Elem {
    return { ...e, is_ref };
}

export function asRef(e: Elem): Elem {
    return withIsRef(e, true);
}

export function withIsFill(e: Elem, is_fill: boolean): Elem {
    return { ...e, is_fill };
}

export function withTextWidth(e: Elem, text_width: Width.t): Elem {
    return { ...e, text_width };
}

export function withFont(e: Elem, font: Font.t): Elem {
    return { ...e, font };
}

export function withMargin(e: Elem, margin: Margin.t): Elem {
    return { ...e, margin };
}

export function withAlignment(e: Elem, alignment: Alignment.t): Elem {
    return { ...e, alignment };
}

export function withWidth(e: Elem, width: Width.t): Elem {
    return { ...e, width };
}

export function withBackgroundColor(e: Elem, background_color: Color): Elem {
    return { ...e, background_color };
}

export function scaleWidth(e: Elem, scale: number): Elem {
    return withWidth(e, Width.scale(e.width, scale));
}

function flatten(ts: marked.Token[], sp: SpanProps): Span[] {
    const spans: Span[] = [];
    for (const t of ts) {
        spans.push(...flattenToken(t, sp));
    }
    return spans;
}

function flattenToken(t: marked.Token, sp: SpanProps): Span[] {
    return match(t)
        .returnType<Span[]>()
        .with({ type: "paragraph", tokens: P.select("tokens") },
            ({ tokens }) => {
                return flatten(tokens, sp);
            })
        .with({ type: "strong", tokens: P.select("tokens") },
            ({ tokens }) => {
                return flatten(tokens, { ...sp, is_bold: true });
            })
        .with({ type: "em", tokens: P.select("tokens") },
            ({ tokens }) => {
                return flatten(tokens, { ...sp, is_italic: true });
            })
        .with({ type: "codespan", text: P.select("text") },
            ({ text }) => {
                return [{ ...sp, is_code: true, text, link: null }];
            })
        .with({ type: "text", tokens: P.select("tokens") },
            ({ tokens }: { tokens: marked.Token[] }) => {
                return flatten(tokens, sp);
            })
        .with({ type: "text", text: P.select("text") },
            ({ text }) => {
                const result: Span[] = [];

                if (text.startsWith(" ")) {
                    result.push({ ...sp, text: " ", link: null });
                }

                result.push({ ...sp, text: text.trim(), link: null });

                if (text.endsWith(" ")) {
                    result.push({ ...sp, text: " ", link: null });
                } else if (text.endsWith("\n")) {
                    result.push({ ...sp, text: "\n", link: null });
                }

                return result;
            })
        .otherwise((e: marked.Token) => {
            // console.log(`Unknown token type: ${JSON.stringify(e)}`);
            return [{ ...defaultSpanProps(), text: e.raw, link: null }];
        });
}
export function parseMarkdownItem(item: string): Span[] {
    const spans: Span[] = [];

    for (const token of marked.lexer(item)) {
        spans.push(...flatten([token], defaultSpanProps()));
    }

    return spans;
}

export function fillFonts(e: Elem, fonts: FontDict): Elem {
    const simpleSpans = e.is_markdown ? parseMarkdownItem(e.text) : [{ ...defaultSpanProps(), text: e.text, font: e.font, link: null }];
    const spans: Span[] = [];
    for (const span of simpleSpans) {
        const font = e.is_markdown ? with_(e.font, ({
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
        return with_(e, {
            width: Width.absolute(Math.min(Width.get_fixed_unchecked(e.width), text_width)),
            text_width: Width.absolute(text_width),
            spans
        })
    } else {
        return with_(e, { text_width: Width.absolute(text_width), spans });
    }
}

export function justifiedLines(e: Elem, lines: Elem[], font_dict: FontDict): Row.t[] {
    const rowLines = [];
    for (const line of lines.slice(0, -1)) {
        const words = line.item.split(/\s+/);
        const r = row([], line.margin, line.alignment, line.width, false, false);
        words.forEach(word => {
            const word_width = Font.get_width(e.font, word, font_dict);
            r.elements.push(elem(word, null, false, false, false, Width.absolute(word_width), this.font, Margin.default_(), Alignment.default_(), Width.absolute(word_width), this.background_color));
        });
        rowLines.push(row);
    }
    rowLines.push(row([withAlignment(lines[lines.length - 1], "Left")], lines[0].margin, "Left", lines[0].width, false, false));
    return rowLines;
}

export function break_lines(e: Elem, font_dict: FontDict): Layout.t[] {
    if (Width.get_fixed_unchecked(e.text_width) <= Width.get_fixed_unchecked(e.width)) {
        return [e]
    }

    const lines: Elem[] = [];

    // todo: I'm sure this implementation is pretty buggy. Note to future me, fix
    // this.
    const words = e.text.split(/\s+/);
    const widths = words.map((word: string) => Font.get_width(e.font, word, font_dict));
    const space_width = Font.get_width(e.font, " ", font_dict);

    let start = 0;
    let width = widths[0];
    const max_width = Width.get_fixed_unchecked(e.width);
    for (let i = 1; i < words.length; i++) {
        const candidate_width = width + space_width + widths[i];
        if (candidate_width > max_width) {
            const line = words.slice(start, i).join(" ");
            const line_width = Font.get_width(e.font, line, font_dict);
            lines.push(withTextWidth(withItem(e, line), Width.absolute(line_width)));
            start = i;
            width = widths[i];
        } else {
            width += space_width + widths[i];
        }
    }

    const line = words.slice(start).join(" ");
    const line_width = Font.get_width(e.font, line, font_dict);
    lines.push(
        withTextWidth(withItem(e, line), Width.absolute(line_width)),
    );

    if (e.alignment === "Justified") {
        return justifiedLines(e, lines, font_dict);
    }

    return lines;
}

export function boundWidth(e: Elem, width: number): Elem {
    if (!Width.is_fill(e.width)) {
        return withIsFill(withWidth(e, Width.absolute(Math.min(Width.get_fixed_unchecked(e.width), width))), false);
    } else {
        return withIsFill(withWidth(e, Width.absolute(width)), true);
    }
}

export function instantiate(e: Elem, section: Map<string, ItemContent>, fields: Field.t[]): Elem {

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
        return with_(e, { is_ref: false, text: ""});
    } else {
        if (text.tag === "Url") {
            return with_(e, { is_ref: false, text: text.value.text, url: text.value.url });
        } else {
            return with_(e, { is_ref: false, text: ItemContent.toString(text) });
        }
    }
}