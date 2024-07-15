"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleWidth = exports.boundWidth = exports.withIsFill = exports.withWidth = exports.withAlignment = exports.withMargin = exports.withElements = exports.instantiate = exports.default_ = exports.copy = exports.stack = exports.from = exports.with_ = void 0;
const _1 = require(".");
function with_(e, w) {
    return { ...e, ...w };
}
exports.with_ = with_;
function from(w) {
    return { ...default_(), ...w };
}
exports.from = from;
function stack(elements, margin, alignment, width, is_fill) {
    return {
        tag: "Stack",
        elements,
        margin,
        alignment,
        width,
        is_fill,
    };
}
exports.stack = stack;
function copy(s) {
    return {
        ...s,
    };
}
exports.copy = copy;
function default_() {
    return {
        tag: "Stack",
        elements: [],
        margin: _1.Margin.default_(),
        alignment: _1.Alignment.default_(),
        width: _1.Width.default_(),
        is_fill: false,
    };
}
exports.default_ = default_;
function instantiate(s, section) {
    return withElements(s, s.elements.map(e => _1.Layout.instantiate(e, section)));
}
exports.instantiate = instantiate;
function withElements(s, elements) {
    return {
        ...s,
        elements,
    };
}
exports.withElements = withElements;
function withMargin(s, margin) {
    return {
        ...s,
        margin,
    };
}
exports.withMargin = withMargin;
function withAlignment(s, alignment) {
    return {
        ...s,
        alignment,
    };
}
exports.withAlignment = withAlignment;
function withWidth(s, width) {
    return {
        ...s,
        width,
    };
}
exports.withWidth = withWidth;
function withIsFill(s, is_fill) {
    return {
        ...s,
        is_fill,
    };
}
exports.withIsFill = withIsFill;
function boundWidth(s, width) {
    const bound = s.width.tag === "Absolute" ? Math.min(s.width.value, width)
        : s.width.tag === "Fill" ? width
            : null;
    if (bound === null) {
        throw new Error("Cannot bound width of non-unitized widths!");
    }
    return withWidth(withElements(s, s.elements.map(e => _1.Layout.boundWidth(e, bound))), _1.Width.absolute(bound));
}
exports.boundWidth = boundWidth;
function scaleWidth(s, scale) {
    return withWidth(withElements(s, s.elements.map(e => _1.Layout.scaleWidth(e, scale))), _1.Width.scale(s.width, scale));
}
exports.scaleWidth = scaleWidth;
