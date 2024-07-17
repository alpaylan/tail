
import { Alignment, Layout, Margin, Width } from ".";
import { Optional } from "./Utils";

export type t = {
    tag: "Stack";
    elements: Layout.t[];
    margin: Margin.t;
    alignment: Alignment.t;
    width: Width.t;
    is_fill: boolean;
};
type Stack = t;

export function from(w: Optional<Stack>): Stack {
    return { ...default_(), ...w };
}

export function stack(elements: Layout.t[], margin: Margin.t, alignment: Alignment.t, width: Width.t, is_fill: boolean): Stack {
    return {
        tag: "Stack",
        elements,
        margin,
        alignment,
        width,
        is_fill,
    };
}

export function copy(s: Stack): Stack {
    return {
        ...s,
    };
}

export function default_(): Stack {
    return {
        tag: "Stack",
        elements: [],
        margin: Margin.default_(),
        alignment: Alignment.default_(),
        width: Width.default_(),
        is_fill: false,
    };
}

export function withElements(s: Stack, elements: Layout.t[]): Stack {
    return {
        ...s,
        elements,
    };
}

export function withMargin(s: Stack, margin: Margin.t): Stack {
    return {
        ...s,
        margin,
    };
}

export function withAlignment(s: Stack, alignment: Alignment.t): Stack {
    return {
        ...s,
        alignment,
    };
}

export function withWidth(s: Stack, width: Width.t): Stack {
    return {
        ...s,
        width,
    };
}

export function withIsFill(s: Stack, is_fill: boolean): Stack {
    return {
        ...s,
        is_fill,
    };
}

export function boundWidth(s: Stack, width: number): Stack {
    const bound = s.width.tag === "Absolute" ? Math.min(s.width.value, width)
        : s.width.tag === "Fill" ? width
            : null;
    if (bound === null) {
        throw new Error("Cannot bound width of non-unitized widths!")
    }
    return withWidth(withElements(s, s.elements.map(e => Layout.boundWidth(e, bound))), Width.absolute(bound));
}

export function scaleWidth(s: Stack, scale: number): Stack {
    return withWidth(withElements(s, s.elements.map(e => Layout.scaleWidth(e, scale))), Width.scale(s.width, scale));
}


