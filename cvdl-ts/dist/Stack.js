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
exports.stack = stack;
exports.default_ = default_;
exports.boundWidth = boundWidth;
exports.scaleWidth = scaleWidth;
const Margin = __importStar(require("./Margin"));
const Width = __importStar(require("./Width"));
const Alignment = __importStar(require("./Alignment"));
const Layout = __importStar(require("./Layout"));
const Utils_1 = require("./Utils");
function from(w) {
    return { ...default_(), ...w };
}
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
function default_() {
    return {
        tag: "Stack",
        elements: [],
        margin: Margin.default_(),
        alignment: Alignment.default_(),
        width: Width.default_(),
        is_fill: false,
    };
}
function boundWidth(s, width) {
    const bound = s.width.tag === "Absolute"
        ? Math.min(s.width.value, width)
        : s.width.tag === "Fill"
            ? width
            : null;
    if (bound === null) {
        throw new Error("Cannot bound width of non-unitized widths!");
    }
    return (0, Utils_1.with_)(s, {
        elements: s.elements.map((e) => Layout.boundWidth(e, bound)),
        width: Width.absolute(bound),
    });
}
function scaleWidth(s, scale) {
    return (0, Utils_1.with_)(s, {
        elements: s.elements.map((e) => Layout.scaleWidth(e, scale)),
        width: Width.scale(s.width, scale),
    });
}
