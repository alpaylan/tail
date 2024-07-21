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
exports.from = from;
exports.row = row;
exports.default_ = default_;
exports.elementsWidth = elementsWidth;
exports.boundWidth = boundWidth;
exports.scaleWidth = scaleWidth;
const _1 = require(".");
const Utils_1 = require("./Utils");
const Layout = __importStar(require("./Layout"));
function from(w) {
    return { ...default_(), ...w };
}
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
function elementsWidth(r) {
    return r.elements
        .map((e) => _1.Width.get_fixed_unchecked(e.width))
        .reduce((a, b) => a + b, 0.0);
}
function boundWidth(r, width) {
    const bound = r.width.tag === "Absolute"
        ? Math.min(r.width.value, width)
        : r.width.tag === "Fill"
            ? width
            : null;
    if (bound === null) {
        throw new Error("Cannot bound width of non-unitized widths!");
    }
    return row(r.elements.map((e) => Layout.boundWidth(e, bound)), r.margin, r.alignment, _1.Width.absolute(bound), r.is_frozen, _1.Width.is_fill(r.width));
}
function scaleWidth(r, w) {
    return (0, Utils_1.with_)(r, {
        elements: r.elements.map((e) => Layout.scaleWidth(e, w)),
        width: _1.Width.scale(r.width, w),
    });
}
