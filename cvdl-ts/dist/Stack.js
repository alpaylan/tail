"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleWidth = exports.boundWidth = exports.default_ = exports.stack = exports.from = void 0;
const _1 = require(".");
const Utils_1 = require("./Utils");
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
function boundWidth(s, width) {
    const bound = s.width.tag === "Absolute" ? Math.min(s.width.value, width)
        : s.width.tag === "Fill" ? width
            : null;
    if (bound === null) {
        throw new Error("Cannot bound width of non-unitized widths!");
    }
    return (0, Utils_1.with_)(s, { elements: s.elements.map(e => _1.Layout.boundWidth(e, bound)), width: _1.Width.absolute(bound) });
}
exports.boundWidth = boundWidth;
function scaleWidth(s, scale) {
    return (0, Utils_1.with_)(s, { elements: s.elements.map(e => _1.Layout.scaleWidth(e, scale)), width: _1.Width.scale(s.width, scale) });
}
exports.scaleWidth = scaleWidth;
