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
exports.breakLines = exports.scaleWidth = exports.boundWidth = exports.elementsWidth = exports.withFill = exports.withFrozen = exports.withWidth = exports.withAlignment = exports.withMargin = exports.withElements = exports.default_ = exports.copy = exports.row = exports.from = void 0;
const _1 = require(".");
const Layout = __importStar(require("./Layout"));
function from(w) {
    return { ...default_(), ...w };
}
exports.from = from;
function row(elements, margin, alignment, width, is_frozen, is_fill) {
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
exports.row = row;
function copy(r) {
    return {
        ...r,
    };
}
exports.copy = copy;
function default_() {
    return {
        tag: "Row",
        elements: [],
        margin: _1.Margin.default_(),
        alignment: _1.Alignment.default_(),
        width: _1.Width.default_(),
        is_frozen: false,
        is_fill: false,
    };
}
exports.default_ = default_;
function withElements(r, elements) {
    return {
        ...r,
        elements,
    };
}
exports.withElements = withElements;
function withMargin(r, margin) {
    return {
        ...r,
        margin,
    };
}
exports.withMargin = withMargin;
function withAlignment(r, alignment) {
    return {
        ...r,
        alignment,
    };
}
exports.withAlignment = withAlignment;
function withWidth(r, width) {
    return {
        ...r,
        width,
    };
}
exports.withWidth = withWidth;
function withFrozen(r, is_frozen) {
    return {
        ...r,
        is_frozen,
    };
}
exports.withFrozen = withFrozen;
function withFill(r, is_fill) {
    return {
        ...r,
        is_fill,
    };
}
exports.withFill = withFill;
function elementsWidth(r) {
    return r.elements.map(e => _1.Width.get_fixed_unchecked(e.width)).reduce((a, b) => a + b, 0.0);
}
exports.elementsWidth = elementsWidth;
function boundWidth(r, width) {
    const bound = r.width.tag === "Absolute" ? Math.min(r.width.value, width)
        : r.width.tag === "Fill" ? width
            : null;
    if (bound === null) {
        throw new Error("Cannot bound width of non-unitized widths!");
    }
    return row(r.elements.map(e => Layout.boundWidth(e, bound)), r.margin, r.alignment, _1.Width.absolute(bound), r.is_frozen, _1.Width.is_fill(r.width));
}
exports.boundWidth = boundWidth;
function scaleWidth(r, w) {
    return withWidth(withElements(r, r.elements.map(e => Layout.scaleWidth(e, w))), _1.Width.scale(r.width, w));
}
exports.scaleWidth = scaleWidth;
function breakLines(r, font_dict) {
    const lines = [];
    let current_line = [];
    let current_width = 0.0;
    const elements = r
        .elements
        .map(e => Layout.breakLines(e, font_dict));
    for (const element of elements) {
        const element_width = _1.Width.get_fixed_unchecked(element.width);
        if (current_width + element_width > _1.Width.get_fixed_unchecked(r.width)) {
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
exports.breakLines = breakLines;
