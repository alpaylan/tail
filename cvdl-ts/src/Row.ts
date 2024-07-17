import { Alignment, Margin, Width } from ".";
import { FontDict } from "./AnyLayout";
import { Optional } from "./Utils";
import * as Layout from "./Layout";

export type t = {
    tag: "Row";
    elements: Layout.t[];
    margin: Margin.t;
    alignment: Alignment.t;
    width: Width.t;
    is_frozen: boolean;
    is_fill: boolean;
}

type Row = t;

export function from(w: Optional<Row>): Row {
    return { ...default_(), ...w };
}


export function row(elements: Layout.t[], margin: Margin.t, alignment: Alignment.t, width: Width.t, is_frozen: boolean, is_fill: boolean): Row {
    return {
        tag: "Row",
        elements,
        margin,
        alignment,
        width,
        is_frozen,
        is_fill,
    };
}

export function copy(r: Row): Row {
    return {
        ...r,
    };
}

export function default_(): Row {
    return {
        tag: "Row",
        elements: [],
        margin: Margin.default_(),
        alignment: Alignment.default_(),
        width: Width.default_(),
        is_frozen: false,
        is_fill: false,
    };
}

export function withElements(r: Row, elements: Layout.t[]): Row {
    return {
        ...r,
        elements,
    };
}

export function withMargin(r: Row, margin: Margin.t): Row {
    return {
        ...r,
        margin,
    };
}

export function withAlignment(r: Row, alignment: Alignment.t): Row {
    return {
        ...r,
        alignment,
    };
}

export function withWidth(r: Row, width: Width.t): Row {
    return {
        ...r,
        width,
    };
}

export function withFrozen(r: Row, is_frozen: boolean): Row {
    return {
        ...r,
        is_frozen,
    };
}

export function withFill(r: Row, is_fill: boolean): Row {
    return {
        ...r,
        is_fill,
    };
}

export function elementsWidth(r: Row): number {
    return r.elements.map(e => Width.get_fixed_unchecked(e.width)).reduce((a, b) => a + b, 0.0);
}

export function boundWidth(r: Row, width: number): Row {
    const bound = r.width.tag === "Absolute" ? Math.min(r.width.value, width)
        : r.width.tag === "Fill" ? width
            : null;

    if (bound === null) {
        throw new Error("Cannot bound width of non-unitized widths!")
    }

    return row(r.elements.map(e => Layout.boundWidth(e, bound)), r.margin, r.alignment, Width.absolute(bound), r.is_frozen, Width.is_fill(r.width));
}

export function scaleWidth(r: Row, w: number): Row {
    return withWidth(withElements(r, r.elements.map(e => Layout.scaleWidth(e, w))), Width.scale(r.width, w));
}

export function breakLines(r: Row, font_dict: FontDict): Row[] {
    const lines: Row[] = [];
    let current_line: Layout.t[] = [];
    let current_width = 0.0;
    const elements: Layout.t[] = r
        .elements
        .map(e => Layout.breakLines(e, font_dict));

    for (const element of elements) {
        const element_width = Width.get_fixed_unchecked(element.width);
        if (current_width + element_width > Width.get_fixed_unchecked(r.width)) {
            lines.push(withElements(r, current_line));
            current_line = [];
            current_width = 0.0;
        }
        current_line.push(element);
        current_width += element_width;
    }

    if (current_line.length > 0) {
        lines.push(withElements(r, current_line));
    }

    return lines;
}
