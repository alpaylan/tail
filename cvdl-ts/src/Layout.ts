
import * as Margin from "./Margin";
import * as Alignment from "./Alignment";
import * as Width from "./Width";
import * as Font from "./Font";
import { ItemContent } from "./Resume";
import { Box } from "./Box";
import { ElementPath, FontDict } from "./AnyLayout";
import { Point } from "./Point";
import * as Stack from "./Stack";
import * as Row from "./Row";
import * as Elem from "./Elem";
import * as Utils from "./Utils";
import { Field } from "./DataSchema";

export type Container = Stack.t | Row.t;
export type t = Stack.t | Row.t | Elem.t;
type Layout = t;

// A rendered layout is a layout with a bounding box and where all the elements are also rendered layouts
export type RenderedStack = Stack.t & { bounding_box: Box, elements: RenderedLayout[] };
export type RenderedRow = Row.t & { bounding_box: Box, elements: RenderedLayout[] };
export type RenderedElem = Elem.t & { bounding_box: Box };

export type RenderedLayout = (RenderedStack | RenderedRow | RenderedElem) & { path?: ElementPath };

export function default_(tag: string) {
    switch (tag) {
        case "Stack": return Stack.default_();
        case "FlexRow": return Row.default_();
        case "FrozenRow": return Row.withFrozen(Row.default_(), true);
        case "Text": return Elem.default_();
        case "Ref": return Elem.asRef(Elem.default_());
    }
}

export function empty(): Layout {
    return default_("Stack");
}

export function fromJson(json: unknown): Layout {
    const key = Object.keys(json)[0];
    switch (key) {
        case 'Stack':
        case 'FlexRow':
        case 'FrozenRow': {
            const container = default_(key) as Container;
            container.elements = json[key].elements.map((element: unknown) => fromJson(element));
            container.margin = json[key].margin;
            container.alignment = json[key].alignment;
            container.width = Width.fromJson(json[key].width);
            return container;
        }
        case 'Ref':
        case 'Text': {
            const inner = default_(key) as Elem.t;
            inner.item = json[key].item;
            inner.text = json[key].item;
            inner.margin = json[key].margin;
            inner.alignment = json[key].alignment;
            inner.width = Width.fromJson(json[key].width);
            inner.text_width = Width.fromJson(json[key].text_width);
            inner.font = Font.fromJson(json[key].font);
            inner.url = json[key].url;
            inner.background_color = json[key].background_color ?? "Transparent";
            return inner;
        }

    }
    throw new Error(`Invalid layout ${key}`);
}

export function type_(l: Layout): string {
    return l.tag;
}

export function tag_(l: Layout): string {
    switch (l.tag) {
        case "Stack": return "Stack";
        case "Row": {
            const row = l as Row.t;
            return row.is_frozen ? "FrozenRow" : "FlexRow";
        }
        case "Elem": {
            const elem = l as Elem.t;
            return elem.is_ref ? "Ref" : "Text";
        }
    }
}

export function toJson(l: Layout): unknown {
    switch (l.tag) {
        case "Stack":
        case "Row": {
            const container = l as Container;
            return {
                [tag_(container)]: {
                    elements: container.elements.map(e => toJson(e)),
                    margin: container.margin,
                    alignment: container.alignment,
                    width: Width.toJson(container.width),
                },
            };
        }
        case "Elem": {
            const elem = l as Elem.t;
            return {
                [tag_(elem)]: {
                    item: elem.item,
                    margin: elem.margin,
                    alignment: elem.alignment,
                    width: Width.toJson(elem.width),
                    text_width: Width.toJson(elem.text_width),
                    font: elem.font,
                    url: elem.url,
                    background_color: elem.background_color,
                },
            };
        }
    }
}

export function isContainer(l: Layout): boolean {
    return l.tag === "Stack" || l.tag === "Row";
}

export function isFill(l: Layout): boolean {
    switch (l.tag) {
        case "Stack":
            return l.is_fill && (l as Stack.t).elements.map(e => isFill(e)).reduce((a, b) => a && b, true);
        case "Row":
            return l.is_fill && (l as Row.t).elements.map(e => isFill(e)).reduce((a, b) => a && b, true);
        case "Elem":
            return l.is_fill
    }
}

export function isRef(l: Layout): boolean {
    return l.tag === "Elem" && l.is_ref;
}

export function fonts(l: Layout): Font.t[] {
    switch (l.tag) {
        case "Stack":
            return (l as Stack.t).elements.map(e => fonts(e)).reduce((a, b) => a.concat(b), []);
        case "Row":
            return (l as Row.t).elements.map(e => fonts(e)).reduce((a, b) => a.concat(b), []);
        case "Elem":
            return [(l as Elem.t).font];
    }
}

export function withMargin(l: Layout, margin: Margin.t): Layout {
    switch (l.tag) {
        case "Stack":
            return Stack.withMargin(l as Stack.t, margin);
        case "Row":
            return Row.withMargin(l as Row.t, margin);
        case "Elem":
            return Elem.withMargin(l as Elem.t, margin);
    }
}

export function withAlignment(l: Layout, alignment: Alignment.t): Layout {
    switch (l.tag) {
        case "Stack":
            return Stack.withAlignment(l as Stack.t, alignment);
        case "Row":
            return Row.withAlignment(l as Row.t, alignment);
        case "Elem":
            return Elem.withAlignment(l as Elem.t, alignment);
    }
}

export function withWidth(l: Layout, width: Width.t): Layout {
    switch (l.tag) {
        case "Stack":
            return Stack.withWidth(l as Stack.t, width);
        case "Row":
            return Row.withWidth(l as Row.t, width);
        case "Elem":
            return Elem.withWidth(l as Elem.t, width);
    }
}

export function totalElementsWidth(l: Layout): number {
    switch (l.tag) {
        case "Stack":
            return (l as Stack.t).elements.map(e => totalElementsWidth(e)).reduce((a, b) => a + b, 0.0);
        case "Row":
            return (l as Row.t).elements.map(e => totalElementsWidth(e)).reduce((a, b) => a + b, 0.0);
        case "Elem":
            return Width.get_fixed_unchecked((l as Elem.t).width);
    }
}

export function isInstantiated(l: Layout): boolean {
    if (isContainer(l)) {
        return (l as Container).elements.map(e => isInstantiated(e)).reduce((a, b) => a && b, true);
    } else {
        return !isRef(l);
    }
}

export function instantiate(l: Layout, section: Map<string, ItemContent>, fields: Field.t[]): Layout {
    switch (l.tag) {
        case "Stack":
            return Stack.withElements(l, l.elements.map(e => instantiate(e, section, fields)));
        case "Row":
            return Row.withElements(l, l.elements.map(e => instantiate(e, section, fields)));
        case "Elem":
            return Elem.instantiate(l, section, fields);
    }
}


export function boundWidth(l: Layout, width: number): Layout {
    const bound = l.width.tag === "Absolute" ? Math.min(l.width.value, width)
        : l.width.tag === "Fill" ? width
            : null;

    if (bound === null) {
        throw new Error("Cannot bound width of non-unitized widths!")
    }

    if (l.tag === "Elem" && l.is_ref) {
        throw new Error("Cannot propagate widths of uninstantiated layout")
    }

    switch (l.tag) {
        case "Stack":
            return Stack.boundWidth(l as Stack.t, bound - l.margin.left - l.margin.right);
        case "Row":
            return Row.boundWidth(l as Row.t, bound - l.margin.left - l.margin.right);
        case "Elem":
            return Elem.boundWidth(l as Elem.t, bound - l.margin.left - l.margin.right);
    }
}

export function scaleWidth(l: Layout, document_width: number): Layout {
    if (isRef(l)) {
        throw new Error("Cannot scale width of uninstantiated layout")
    }
    switch (l.tag) {
        case "Stack":
            return Stack.scaleWidth(l as Stack.t, document_width);
        case "Row":
            return Row.scaleWidth(l as Row.t, document_width);
        case "Elem":
            return Elem.scaleWidth(l as Elem.t, document_width);
    }
}

export function normalize(l: Layout, width: number, font_dict: FontDict): Layout {
    console.debug(
        `Normalizing document, checking if document is instantiated...`,
    );
    if (!isInstantiated(l)) {
        throw Error(`Cannot normalize uninstantiated layout ${JSON.stringify(l)}`);
    }

    console.debug("Document is instantiated. Scaling widths...");

    const scaled_layout = scaleWidth(l, width);

    console.debug("Widths are scaled. Bounding widths...");

    const bounded_layout = boundWidth(scaled_layout, width);

    console.debug("Widths are bounded. Filling fonts...");

    const font_filled_layout = fillFonts(bounded_layout, font_dict);

    console.debug("Fonts filled. Breaking lines...");

    // const broken_layout = breakLines(font_filled_layout, font_dict);

    console.debug("Lines broken.");

    // return broken_layout;

    return font_filled_layout;
}

export function fillFonts(l: Layout, font_dict: FontDict): Layout {
    if (isRef(l)) {
        throw new Error("Cannot fill fonts of uninstantiated layout")
    }

    switch (l.tag) {
        case "Stack":
        case "Row": {
            const filledFonts = (l as Container).elements.map(e => fillFonts(e, font_dict));
            l = { ...l, elements: filledFonts };
            if (isFill(l)) {
                const total_width = totalElementsWidth(l);
                if (total_width <= Width.get_fixed_unchecked(l.width)) {
                    // throw `Cannot fill fonts of row with width ${JSON.stringify(this.width())} and total width ${total_width}`
                    return withWidth(l, Width.absolute(total_width));
                }
            }
            return l;
        }
        case "Elem":
            return Elem.fillFonts(l as Elem.t, font_dict);
    }
}

export function breakLines(l: Layout, font_dict: FontDict): Layout {
    switch (l.tag) {
        case "Stack": {
            const stack = l as Stack.t;
            return Stack.withElements(stack, stack.elements.map(e => breakLines(e, font_dict)));
        }
        case "Row": {
            const row = l as Row.t;
            if (row.is_frozen) {
                const total_width = row
                    .elements
                    .map(e => Width.get_fixed_unchecked(e.width))
                    .reduce((a, b) => a + b, 0.0);

                if (total_width > Width.get_fixed_unchecked(row.width)) {
                    throw `Cannot break lines of frozen row with width ${row.width} and total width ${total_width}`
                } else {
                    row.elements = row.elements.map(e => breakLines(e, font_dict));
                }
            } else {
                const lines = Row.breakLines(row, font_dict);
                return Stack.stack(lines, row.margin, row.alignment, row.width, false);
            }
            return row;
        }
        case "Elem": {
            if (isRef(l)) {
                throw new Error("Cannot break lines of uninstantiated layout")
            }

            const elem = l as Elem.t;
            const lines = Elem.break_lines(elem, font_dict);
            // Make last line left if it's justified
            if (lines[lines.length - 1].alignment === "Justified") {
                lines[lines.length - 1] = withAlignment(lines[lines.length - 1], "Left");
            }

            return Stack.stack(
                lines,
                elem.margin,
                elem.alignment,
                elem.width,
                false
            );
        }

    }
}

export function computeBoxes(l: Layout, font_dict: FontDict): RenderedLayout {
    const top_left: Point = new Point(0.0, 0.0);
    return computeTextboxPositions(l, top_left, font_dict).renderedLayout;
}

export function computeTextboxPositions(
    l: Layout, top_left: Point, font_dict: FontDict,
): { depth: number, renderedLayout: RenderedLayout } {
    let depth = top_left.y;
    switch (l.tag) {
        case "Stack": {
            const stack = l as Stack.t;
            top_left = top_left.move_y_by(stack.margin.top).move_x_by(stack.margin.left);
            const originalTopLeft = top_left;
            const renderedElements = [];
            for (const element of stack.elements) {
                const result = computeTextboxPositions(element, top_left, font_dict);
                depth = result.depth;

                top_left = top_left.move_y_to(depth);
                renderedElements.push(result.renderedLayout);
            }

            return {
                depth, renderedLayout: {
                    ...l, bounding_box: new Box(
                        originalTopLeft,
                        top_left.move_x_by(Width.get_fixed_unchecked(stack.width)),
                    ), elements: renderedElements
                }
            };
        }
        case "Row": {
            const row = l as Row.t;
            top_left = top_left.move_y_by(row.margin.top).move_x_by(row.margin.left);
            const originalTopLeft = top_left;
            let per_elem_space: number = 0.0;
            switch (row.alignment) {
                case "Center":
                    top_left = top_left.move_x_by((Width.get_fixed_unchecked(row.width) - Row.elementsWidth(row)) / 2.0);
                    break;
                case "Right":
                    top_left = top_left.move_x_by(Width.get_fixed_unchecked(row.width) - Row.elementsWidth(row));
                    break;
                case "Justified":
                    per_elem_space = (Width.get_fixed_unchecked(row.width) - Row.elementsWidth(row)) / (row.elements.length - 1);
                    break;
            }

            const renderedElements = [];

            for (const element of row.elements) {
                const result = computeTextboxPositions(element, top_left, font_dict);
                depth = Math.max(depth, result.depth);
                top_left =
                    top_left.move_x_by(Width.get_fixed_unchecked(element.width) + per_elem_space);
                renderedElements.push(result.renderedLayout);
            }

            return {
                depth, renderedLayout: {
                    ...l, bounding_box: new Box(
                        originalTopLeft,
                        originalTopLeft.move_y_by(depth).move_x_by(Width.get_fixed_unchecked(row.width)),
                    ), elements: renderedElements
                }
            };
        }

        case "Elem": {
            const elem = l as Elem.t;

            if (elem.is_ref) {
                throw new Error("Cannot compute textbox positions of uninstantiated layout")
            }

            const height = Font.get_height(elem.font, font_dict);
            // const width = Width.get_fixed_unchecked(elem.text_width);
            top_left = top_left.move_y_by(elem.margin.top).move_x_by(elem.margin.left);
            let line = 1;
            let cursor = top_left.x;
            elem.spans.forEach(span => {
                if (cursor - top_left.x + span.width > Width.get_fixed_unchecked(elem.width) - elem.margin.right || span.text === "\n\n") {
                    cursor = top_left.x;
                    line += 1;
                }
                span.bbox = new Box(new Point(cursor - top_left.x, (line - 1) * height), new Point(cursor + span.width, line * height));
                span.line = line;
                cursor += span.width;
            });

            const lineWidths = elem.spans.reduce((acc, span) => {
                acc[span.line - 1].width += span.width;
                return acc;
            }, Array.from({ length: line }, (_, i) => ({ line: i + 1, width: 0 })));

            switch (elem.alignment) {
                case "Center":
                    elem.spans.forEach(span => {
                        span.bbox = span.bbox.move_x_by((Width.get_fixed_unchecked(elem.width) - lineWidths[span.line - 1].width) / 2.0);
                    });
                    break;
                case "Right":
                    elem.spans.forEach(span => {
                        span.bbox = span.bbox.move_x_by(Width.get_fixed_unchecked(elem.width) - lineWidths[span.line - 1].width);
                    });
                    break;
                case "Justified": {
                    for (let i = 1; i < line; i++) {
                        const lineSpans = elem.spans.filter(span => span.line === i && span.text !== "\n\n" && span.text !== "\n" && span.text !== " ");
                        const totalWidth = lineSpans.reduce((acc, span) => acc + span.width, 0);
                        const perSpace = (Width.get_fixed_unchecked(elem.width) - totalWidth) / (lineSpans.length - 1);
                        let cursor = 0;
                        lineSpans.forEach(span => {
                            span.bbox = span.bbox.move_x_by(cursor - span.bbox.top_left.x);
                            cursor += span.width + perSpace;
                        });
                    }
                }
            }

            const textbox = new Box(top_left, top_left.move_x_by(Width.get_fixed_unchecked(elem.width)).move_y_by(height * line));
            return { depth: top_left.y + height * line, renderedLayout: { ...l, bounding_box: textbox } };

        }
    }
}

export type Color =
    "Transparent" // transparent
    | "Light Yellow" // "#FFC96F" 
    | "Light Brown" // "#ECB176" 
    | "Light Green" // "#F6FAB9" 
    | "Light Beige" // "#F6EEC9" 
    | "Light Blue" // "#EEF7FF" 
    | "Blue" // "#4793AF" 

export const ColorMap = {
    "Transparent": "transparent",
    "Light Yellow": "#FFC96F",
    "Light Brown": "#ECB176",
    "Light Green": "#F6FAB9",
    "Light Beige": "#F6EEC9",
    "Light Blue": "#EEF7FF",
    "Blue": "#4793AF",
}