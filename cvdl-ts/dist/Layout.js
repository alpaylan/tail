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
exports.ColorMap = exports.computeTextboxPositions = exports.computeBoxes = exports.breakLines = exports.fillFonts = exports.normalize = exports.scaleWidth = exports.boundWidth = exports.instantiate = exports.isInstantiated = exports.totalElementsWidth = exports.withWidth = exports.withAlignment = exports.withMargin = exports.fonts = exports.isRef = exports.isFill = exports.isContainer = exports.toJson = exports.tag_ = exports.type_ = exports.fromJson = exports.empty = exports.default_ = void 0;
const Width = __importStar(require("./Width"));
const Font = __importStar(require("./Font"));
const Box_1 = require("./Box");
const Point_1 = require("./Point");
const Stack = __importStar(require("./Stack"));
const Row = __importStar(require("./Row"));
const Elem = __importStar(require("./Elem"));
function default_(tag) {
    switch (tag) {
        case "Stack": return Stack.default_();
        case "FlexRow": return Row.default_();
        case "FrozenRow": return Row.withFrozen(Row.default_(), true);
        case "Text": return Elem.default_();
        case "Ref": return Elem.asRef(Elem.default_());
    }
}
exports.default_ = default_;
function empty() {
    return default_("Stack");
}
exports.empty = empty;
function fromJson(json) {
    var _a;
    const key = Object.keys(json)[0];
    switch (key) {
        case 'Stack':
        case 'FlexRow':
        case 'FrozenRow': {
            const container = default_(key);
            container.elements = json[key].elements.map((element) => fromJson(element));
            container.margin = json[key].margin;
            container.alignment = json[key].alignment;
            container.width = Width.fromJson(json[key].width);
            return container;
        }
        case 'Ref':
        case 'Text': {
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
exports.fromJson = fromJson;
function type_(l) {
    return l.tag;
}
exports.type_ = type_;
function tag_(l) {
    switch (l.tag) {
        case "Stack": return "Stack";
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
exports.tag_ = tag_;
function toJson(l) {
    switch (l.tag) {
        case "Stack":
        case "Row": {
            const container = l;
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
exports.toJson = toJson;
function isContainer(l) {
    return l.tag === "Stack" || l.tag === "Row";
}
exports.isContainer = isContainer;
function isFill(l) {
    switch (l.tag) {
        case "Stack":
            return l.is_fill && l.elements.map(e => isFill(e)).reduce((a, b) => a && b, true);
        case "Row":
            return l.is_fill && l.elements.map(e => isFill(e)).reduce((a, b) => a && b, true);
        case "Elem":
            return l.is_fill;
    }
}
exports.isFill = isFill;
function isRef(l) {
    return l.tag === "Elem" && l.is_ref;
}
exports.isRef = isRef;
function fonts(l) {
    switch (l.tag) {
        case "Stack":
            return l.elements.map(e => fonts(e)).reduce((a, b) => a.concat(b), []);
        case "Row":
            return l.elements.map(e => fonts(e)).reduce((a, b) => a.concat(b), []);
        case "Elem":
            return [l.font];
    }
}
exports.fonts = fonts;
function withMargin(l, margin) {
    switch (l.tag) {
        case "Stack":
            return Stack.withMargin(l, margin);
        case "Row":
            return Row.withMargin(l, margin);
        case "Elem":
            return Elem.withMargin(l, margin);
    }
}
exports.withMargin = withMargin;
function withAlignment(l, alignment) {
    switch (l.tag) {
        case "Stack":
            return Stack.withAlignment(l, alignment);
        case "Row":
            return Row.withAlignment(l, alignment);
        case "Elem":
            return Elem.withAlignment(l, alignment);
    }
}
exports.withAlignment = withAlignment;
function withWidth(l, width) {
    switch (l.tag) {
        case "Stack":
            return Stack.withWidth(l, width);
        case "Row":
            return Row.withWidth(l, width);
        case "Elem":
            return Elem.withWidth(l, width);
    }
}
exports.withWidth = withWidth;
function totalElementsWidth(l) {
    switch (l.tag) {
        case "Stack":
            return l.elements.map(e => totalElementsWidth(e)).reduce((a, b) => a + b, 0.0);
        case "Row":
            return l.elements.map(e => totalElementsWidth(e)).reduce((a, b) => a + b, 0.0);
        case "Elem":
            return Width.get_fixed_unchecked(l.width);
    }
}
exports.totalElementsWidth = totalElementsWidth;
function isInstantiated(l) {
    if (isContainer(l)) {
        return l.elements.map(e => isInstantiated(e)).reduce((a, b) => a && b, true);
    }
    else {
        return !isRef(l);
    }
}
exports.isInstantiated = isInstantiated;
function instantiate(l, section, fields) {
    switch (l.tag) {
        case "Stack":
            return Stack.withElements(l, l.elements.map(e => instantiate(e, section, fields)));
        case "Row":
            return Row.withElements(l, l.elements.map(e => instantiate(e, section, fields)));
        case "Elem":
            return Elem.instantiate(l, section, fields);
    }
}
exports.instantiate = instantiate;
function boundWidth(l, width) {
    const bound = l.width.tag === "Absolute" ? Math.min(l.width.value, width)
        : l.width.tag === "Fill" ? width
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
exports.boundWidth = boundWidth;
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
exports.scaleWidth = scaleWidth;
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
    console.debug("Fonts filled. Breaking lines...");
    // const broken_layout = breakLines(font_filled_layout, font_dict);
    console.debug("Lines broken.");
    // return broken_layout;
    return font_filled_layout;
}
exports.normalize = normalize;
function fillFonts(l, font_dict) {
    if (isRef(l)) {
        throw new Error("Cannot fill fonts of uninstantiated layout");
    }
    switch (l.tag) {
        case "Stack":
        case "Row": {
            const filledFonts = l.elements.map(e => fillFonts(e, font_dict));
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
            return Elem.fillFonts(l, font_dict);
    }
}
exports.fillFonts = fillFonts;
function breakLines(l, font_dict) {
    switch (l.tag) {
        case "Stack": {
            const stack = l;
            return Stack.withElements(stack, stack.elements.map(e => breakLines(e, font_dict)));
        }
        case "Row": {
            const row = l;
            if (row.is_frozen) {
                const total_width = row
                    .elements
                    .map(e => Width.get_fixed_unchecked(e.width))
                    .reduce((a, b) => a + b, 0.0);
                if (total_width > Width.get_fixed_unchecked(row.width)) {
                    throw `Cannot break lines of frozen row with width ${row.width} and total width ${total_width}`;
                }
                else {
                    row.elements = row.elements.map(e => breakLines(e, font_dict));
                }
            }
            else {
                const lines = Row.breakLines(row, font_dict);
                return Stack.stack(lines, row.margin, row.alignment, row.width, false);
            }
            return row;
        }
        case "Elem": {
            if (isRef(l)) {
                throw new Error("Cannot break lines of uninstantiated layout");
            }
            const elem = l;
            const lines = Elem.break_lines(elem, font_dict);
            // Make last line left if it's justified
            if (lines[lines.length - 1].alignment === "Justified") {
                lines[lines.length - 1] = withAlignment(lines[lines.length - 1], "Left");
            }
            return Stack.stack(lines, elem.margin, elem.alignment, elem.width, false);
        }
    }
}
exports.breakLines = breakLines;
function computeBoxes(l, font_dict) {
    const top_left = new Point_1.Point(0.0, 0.0);
    return computeTextboxPositions(l, top_left, font_dict).renderedLayout;
}
exports.computeBoxes = computeBoxes;
function computeTextboxPositions(l, top_left, font_dict) {
    let depth = top_left.y;
    switch (l.tag) {
        case "Stack": {
            const stack = l;
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
                    ...l, bounding_box: new Box_1.Box(originalTopLeft, top_left.move_x_by(Width.get_fixed_unchecked(stack.width))), elements: renderedElements
                }
            };
        }
        case "Row": {
            const row = l;
            top_left = top_left.move_y_by(row.margin.top).move_x_by(row.margin.left);
            const originalTopLeft = top_left;
            let per_elem_space = 0.0;
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
                    ...l, bounding_box: new Box_1.Box(originalTopLeft, originalTopLeft.move_y_by(depth).move_x_by(Width.get_fixed_unchecked(row.width))), elements: renderedElements
                }
            };
        }
        case "Elem": {
            const elem = l;
            if (elem.is_ref) {
                throw new Error("Cannot compute textbox positions of uninstantiated layout");
            }
            const height = Font.get_height(elem.font, font_dict);
            const width = Width.get_fixed_unchecked(elem.text_width);
            top_left = top_left.move_y_by(elem.margin.top).move_x_by(elem.margin.left);
            let line = 1;
            let cursor = top_left.x;
            elem.spans.forEach(span => {
                if (cursor - top_left.x + span.width > Width.get_fixed_unchecked(elem.width) - elem.margin.right || span.text === "\n\n") {
                    cursor = top_left.x;
                    line += 1;
                }
                span.bbox = new Box_1.Box(new Point_1.Point(cursor - top_left.x, (line - 1) * height), new Point_1.Point(cursor + span.width, line * height));
                span.line = line;
                cursor += span.width;
            });
            // switch (elem.alignment) {
            //     case "Center":
            //         top_left = top_left.move_x_by((Width.get_fixed_unchecked(elem.width) - width) / 2.0);
            //         break;
            //     case "Right":
            //         top_left = top_left.move_x_by(Width.get_fixed_unchecked(elem.width) - width);
            //         break;
            // }
            const textbox = new Box_1.Box(top_left, top_left.move_x_by(width).move_y_by(height * line));
            return { depth: top_left.y + height * line, renderedLayout: { ...l, bounding_box: textbox } };
        }
    }
}
exports.computeTextboxPositions = computeTextboxPositions;
exports.ColorMap = {
    "Transparent": "transparent",
    "Light Yellow": "#FFC96F",
    "Light Brown": "#ECB176",
    "Light Green": "#F6FAB9",
    "Light Beige": "#F6EEC9",
    "Light Blue": "#EEF7FF",
    "Blue": "#4793AF",
};
