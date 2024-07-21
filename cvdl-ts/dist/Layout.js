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
exports.ColorMap = void 0;
exports.default_ = default_;
exports.empty = empty;
exports.fromJson = fromJson;
exports.type_ = type_;
exports.tag_ = tag_;
exports.toJson = toJson;
exports.isContainer = isContainer;
exports.isFill = isFill;
exports.isRef = isRef;
exports.fonts = fonts;
exports.totalElementsWidth = totalElementsWidth;
exports.isInstantiated = isInstantiated;
exports.instantiate = instantiate;
exports.boundWidth = boundWidth;
exports.scaleWidth = scaleWidth;
exports.normalize = normalize;
exports.fillFonts = fillFonts;
exports.computeBoxes = computeBoxes;
exports.computeTextboxPositions = computeTextboxPositions;
const Width = __importStar(require("./Width"));
const Font = __importStar(require("./Font"));
const Box_1 = require("./Box");
const Point_1 = require("./Point");
const Stack = __importStar(require("./Stack"));
const Row = __importStar(require("./Row"));
const Elem = __importStar(require("./Elem"));
const Utils_1 = require("./Utils");
function default_(tag) {
    switch (tag) {
        case "Stack":
            return Stack.default_();
        case "FlexRow":
            return Row.default_();
        case "FrozenRow":
            return (0, Utils_1.with_)(Row.default_(), { is_frozen: true });
        case "Text":
            return Elem.default_();
        case "Ref":
            return Elem.asRef(Elem.default_());
    }
}
function empty() {
    return default_("Stack");
}
function fromJson(json) {
    var _a;
    const key = Object.keys(json)[0];
    switch (key) {
        case "Stack":
        case "FlexRow":
        case "FrozenRow": {
            const container = default_(key);
            container.elements = json[key].elements.map((element) => fromJson(element));
            container.margin = json[key].margin;
            container.alignment = json[key].alignment;
            container.width = Width.fromJson(json[key].width);
            return container;
        }
        case "Ref":
        case "Text": {
            const inner = default_(key);
            inner.item = json[key].item;
            inner.text = json[key].item;
            inner.margin = json[key].margin;
            inner.alignment = json[key].alignment;
            inner.width = Width.fromJson(json[key].width);
            inner.text_width = Width.fromJson(json[key].text_width);
            inner.font = Font.fromJson(json[key].font);
            inner.url = json[key].url;
            inner.background_color = (_a = json[key].background_color) !== null && _a !== void 0 ? _a : "Transparent";
            return inner;
        }
    }
    throw new Error(`Invalid layout ${key}`);
}
function type_(l) {
    return l.tag;
}
function tag_(l) {
    switch (l.tag) {
        case "Stack":
            return "Stack";
        case "Row": {
            const row = l;
            return row.is_frozen ? "FrozenRow" : "FlexRow";
        }
        case "Elem": {
            const elem = l;
            return elem.is_ref ? "Ref" : "Text";
        }
    }
}
function toJson(l) {
    switch (l.tag) {
        case "Stack":
        case "Row": {
            const container = l;
            return {
                [tag_(container)]: {
                    elements: container.elements.map((e) => toJson(e)),
                    margin: container.margin,
                    alignment: container.alignment,
                    width: Width.toJson(container.width),
                },
            };
        }
        case "Elem": {
            const elem = l;
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
function isContainer(l) {
    return l.tag === "Stack" || l.tag === "Row";
}
function isFill(l) {
    switch (l.tag) {
        case "Stack":
            return (l.is_fill &&
                l.elements
                    .map((e) => isFill(e))
                    .reduce((a, b) => a && b, true));
        case "Row":
            return (l.is_fill &&
                l.elements
                    .map((e) => isFill(e))
                    .reduce((a, b) => a && b, true));
        case "Elem":
            return l.is_fill;
    }
}
function isRef(l) {
    return l.tag === "Elem" && l.is_ref;
}
function fonts(l) {
    switch (l.tag) {
        case "Stack":
            return l.elements
                .map((e) => fonts(e))
                .reduce((a, b) => a.concat(b), []);
        case "Row":
            return l.elements
                .map((e) => fonts(e))
                .reduce((a, b) => a.concat(b), []);
        case "Elem":
            return [l.font];
    }
}
function totalElementsWidth(l) {
    switch (l.tag) {
        case "Stack":
            return l.elements
                .map((e) => totalElementsWidth(e))
                .reduce((a, b) => a + b, 0.0);
        case "Row":
            return l.elements
                .map((e) => totalElementsWidth(e))
                .reduce((a, b) => a + b, 0.0);
        case "Elem":
            return Width.get_fixed_unchecked(l.width);
    }
}
function isInstantiated(l) {
    if (isContainer(l)) {
        return l.elements
            .map((e) => isInstantiated(e))
            .reduce((a, b) => a && b, true);
    }
    else {
        return !isRef(l);
    }
}
function instantiate(l, section, fields) {
    switch (l.tag) {
        case "Stack":
        case "Row":
            return (0, Utils_1.with_)(l, {
                elements: l.elements.map((e) => instantiate(e, section, fields)),
            });
        case "Elem":
            return Elem.instantiate(l, section, fields);
    }
}
function boundWidth(l, width) {
    const bound = l.width.tag === "Absolute"
        ? Math.min(l.width.value, width)
        : l.width.tag === "Fill"
            ? width
            : null;
    if (bound === null) {
        throw new Error("Cannot bound width of non-unitized widths!");
    }
    if (l.tag === "Elem" && l.is_ref) {
        throw new Error("Cannot propagate widths of uninstantiated layout");
    }
    switch (l.tag) {
        case "Stack":
            return Stack.boundWidth(l, bound - l.margin.left - l.margin.right);
        case "Row":
            return Row.boundWidth(l, bound - l.margin.left - l.margin.right);
        case "Elem":
            return Elem.boundWidth(l, bound - l.margin.left - l.margin.right);
    }
}
function scaleWidth(l, document_width) {
    if (isRef(l)) {
        throw new Error("Cannot scale width of uninstantiated layout");
    }
    switch (l.tag) {
        case "Stack":
            return Stack.scaleWidth(l, document_width);
        case "Row":
            return Row.scaleWidth(l, document_width);
        case "Elem":
            return Elem.scaleWidth(l, document_width);
    }
}
function normalize(l, width, font_dict) {
    console.debug(`Normalizing document, checking if document is instantiated...`);
    if (!isInstantiated(l)) {
        throw Error(`Cannot normalize uninstantiated layout ${JSON.stringify(l)}`);
    }
    console.debug("Document is instantiated. Scaling widths...");
    const scaled_layout = scaleWidth(l, width);
    console.debug("Widths are scaled. Bounding widths...");
    const bounded_layout = boundWidth(scaled_layout, width);
    console.debug("Widths are bounded. Filling fonts...");
    const font_filled_layout = fillFonts(bounded_layout, font_dict);
    console.debug("Fonts filled.");
    return font_filled_layout;
}
function fillFonts(l, font_dict) {
    if (isRef(l)) {
        throw new Error("Cannot fill fonts of uninstantiated layout");
    }
    switch (l.tag) {
        case "Stack":
        case "Row": {
            const filledFonts = l.elements.map((e) => fillFonts(e, font_dict));
            l = { ...l, elements: filledFonts };
            if (isFill(l)) {
                const total_width = totalElementsWidth(l);
                if (total_width <= Width.get_fixed_unchecked(l.width)) {
                    // throw `Cannot fill fonts of row with width ${JSON.stringify(this.width())} and total width ${total_width}`
                    return (0, Utils_1.with_)(l, { width: Width.absolute(total_width) });
                }
            }
            return l;
        }
        case "Elem":
            return Elem.fillFonts(l, font_dict);
    }
}
function computeBoxes(l, font_dict) {
    const top_left = new Point_1.Point(0.0, 0.0);
    return computeTextboxPositions(l, top_left, font_dict).renderedLayout;
}
function computeTextboxPositions(l, top_left, font_dict) {
    let depth = top_left.y;
    switch (l.tag) {
        case "Stack": {
            const stack = l;
            top_left = top_left
                .move_y_by(stack.margin.top)
                .move_x_by(stack.margin.left);
            const originalTopLeft = top_left;
            const renderedElements = [];
            for (const element of stack.elements) {
                const result = computeTextboxPositions(element, top_left, font_dict);
                depth = result.depth;
                top_left = top_left.move_y_to(depth);
                renderedElements.push(result.renderedLayout);
            }
            depth += stack.margin.bottom;
            return {
                depth,
                renderedLayout: {
                    ...l,
                    bounding_box: new Box_1.Box(originalTopLeft, top_left
                        .move_x_by(Width.get_fixed_unchecked(stack.width))
                        .move_y_by(stack.margin.bottom)),
                    elements: renderedElements,
                },
            };
        }
        case "Row": {
            const row = l;
            top_left = top_left.move_y_by(row.margin.top).move_x_by(row.margin.left);
            const originalTopLeft = top_left;
            let per_elem_space = 0.0;
            switch (row.alignment) {
                case "Center":
                    top_left = top_left.move_x_by((Width.get_fixed_unchecked(row.width) - Row.elementsWidth(row)) /
                        2.0);
                    break;
                case "Right":
                    top_left = top_left.move_x_by(Width.get_fixed_unchecked(row.width) - Row.elementsWidth(row));
                    break;
                case "Justified":
                    per_elem_space =
                        (Width.get_fixed_unchecked(row.width) - Row.elementsWidth(row)) /
                            (row.elements.length - 1);
                    break;
            }
            const renderedElements = [];
            for (const element of row.elements) {
                const result = computeTextboxPositions(element, top_left, font_dict);
                depth = Math.max(depth, result.depth);
                top_left = top_left.move_x_by(Width.get_fixed_unchecked(element.width) + per_elem_space);
                renderedElements.push(result.renderedLayout);
            }
            depth += row.margin.bottom;
            return {
                depth,
                renderedLayout: {
                    ...l,
                    bounding_box: new Box_1.Box(originalTopLeft, originalTopLeft
                        .move_y_by(depth)
                        .move_x_by(Width.get_fixed_unchecked(row.width))),
                    elements: renderedElements,
                },
            };
        }
        case "Elem": {
            const elem = l;
            if (elem.is_ref) {
                throw new Error("Cannot compute textbox positions of uninstantiated layout");
            }
            const height = Font.get_height(elem.font, font_dict);
            top_left = top_left
                .move_y_by(elem.margin.top)
                .move_x_by(elem.margin.left);
            let line = 1;
            let cursor = top_left.x;
            elem.spans.forEach((span) => {
                if (cursor - top_left.x + span.width >
                    Width.get_fixed_unchecked(elem.width) - elem.margin.right ||
                    span.text === "\n\n") {
                    cursor = top_left.x;
                    line += 1;
                }
                span.bbox = new Box_1.Box(new Point_1.Point(cursor - top_left.x, (line - 1) * height), new Point_1.Point(cursor + span.width, line * height));
                span.line = line;
                cursor += span.width;
            });
            const lineWidths = elem.spans.reduce((acc, span) => {
                acc[span.line - 1].width += span.width;
                return acc;
            }, Array.from({ length: line }, (_, i) => ({ line: i + 1, width: 0 })));
            switch (elem.alignment) {
                case "Center":
                    elem.spans.forEach((span) => {
                        span.bbox = span.bbox.move_x_by((Width.get_fixed_unchecked(elem.width) -
                            lineWidths[span.line - 1].width) /
                            2.0);
                    });
                    break;
                case "Right":
                    elem.spans.forEach((span) => {
                        span.bbox = span.bbox.move_x_by(Width.get_fixed_unchecked(elem.width) -
                            lineWidths[span.line - 1].width);
                    });
                    break;
                case "Justified": {
                    for (let i = 1; i < line; i++) {
                        const lineSpans = elem.spans.filter((span) => span.line === i &&
                            span.text !== "\n\n" &&
                            span.text !== "\n" &&
                            span.text !== " ");
                        const totalWidth = lineSpans.reduce((acc, span) => acc + span.width, 0);
                        const perSpace = (Width.get_fixed_unchecked(elem.width) - totalWidth) /
                            (lineSpans.length - 1);
                        let cursor = 0;
                        lineSpans.forEach((span) => {
                            span.bbox = span.bbox.move_x_by(cursor - span.bbox.top_left.x);
                            cursor += span.width + perSpace;
                        });
                    }
                }
            }
            const textbox = new Box_1.Box(top_left, top_left
                .move_x_by(Width.get_fixed_unchecked(elem.width))
                .move_y_by(height * line + elem.margin.bottom));
            return {
                depth: top_left.y + height * line + elem.margin.bottom,
                renderedLayout: { ...l, bounding_box: textbox },
            };
        }
    }
}
exports.ColorMap = {
    Transparent: "transparent",
    "Light Yellow": "#FFC96F",
    "Light Brown": "#ECB176",
    "Light Green": "#F6FAB9",
    "Light Beige": "#F6EEC9",
    "Light Blue": "#EEF7FF",
    Blue: "#4793AF",
};
