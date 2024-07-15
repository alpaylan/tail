
import * as Font from "./Font";
import { Alignment, Layout, Margin, Width } from ".";
import { Color } from "./Layout";
import { FontDict } from "./AnyLayout";
import { row } from "./Row";
import * as Row from "./Row";
import { ItemContent } from "./Resume";

export type t = {
    tag: "Elem";
    item: string;
    url: string | null;
    is_ref: boolean;
    is_fill: boolean;
    text_width: Width.t;
    font: Font.t;
    margin: Margin.t;
    alignment: Alignment.t;
    width: Width.t;
    background_color: Color;
};
type Elem = t;

export function elem(item: string, url: string | null, is_ref: boolean, is_fill: boolean, text_width: Width.t, font: Font.t, margin: Margin.t, alignment: Alignment.t, width: Width.t, background_color: Color): Elem {
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
        text_width: Width.default_(),
        font: Font.default_(),
        margin: Margin.default_(),
        alignment: Alignment.default_(),
        width: Width.default_(),
        background_color: "Transparent",
    };
}

export type Optional<T> = {
    [P in keyof T]?: T[P];
};

export function with_(e: Elem, w: Optional<Elem>): Elem {
    return { ...e, ...w };
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

export function fillFonts(e: Elem, fonts: FontDict): Elem {
    const text_width_with_font = Font.get_width(e.font, e.item, fonts);

    if (e.is_fill) {
        return withTextWidth(withWidth(e, Width.absolute(Math.min(Width.get_fixed_unchecked(e.width), text_width_with_font))), Width.absolute(text_width_with_font));
    } else {
        return withTextWidth(e, Width.absolute(text_width_with_font));
    }
}

export function justifiedLines(e: Elem, lines: Elem[], font_dict: FontDict): Row.t[] {
    const rowLines = [];
    for (const line of lines.slice(0, -1)) {
        const words = line.item.split(/\s+/);
        const r = row([], line.margin, line.alignment, line.width, false, false);
        words.forEach(word => {
            const word_width = Font.get_width(e.font, word, font_dict);
            r.elements.push(elem(word, null, false, false, Width.absolute(word_width), this.font, Margin.default_(), Alignment.default_(), Width.absolute(word_width), this.background_color));
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
    const words = e.item.split(/\s+/);
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

export function instantiate(e: Elem, section: Map<string, ItemContent>): Elem {

    if (!e.is_ref) {
        return e;
    }

    const text = section.get(e.item);

    if (text === undefined) {
        return withIsRef(withItem(e, ""), false);
    } else {
        if (text.tag === "Url") {
            return withIsRef(withUrl(withItem(e, text.value.text), text.value.url), false);
        } else {
            return withIsRef(withItem(e, ItemContent.toString(text)), false);
        }
    }
}