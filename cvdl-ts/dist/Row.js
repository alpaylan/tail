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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.from = from;
exports.row = row;
exports.default_ = default_;
exports.elementsWidth = elementsWidth;
exports.elementOuterWidth = elementOuterWidth;
exports.boundWidth = boundWidth;
exports.scaleWidth = scaleWidth;
const Margin = __importStar(require("./Margin"));
const Width = __importStar(require("./Width"));
const Alignment = __importStar(require("./Alignment"));
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
        margin: Margin.default_(),
        alignment: Alignment.default_(),
        width: Width.default_(),
        is_frozen: false,
        is_fill: false,
    };
}
function elementsWidth(r) {
    return r.elements.map(elementOuterWidth).reduce((a, b) => a + b, 0.0);
}
function elementOuterWidth(e) {
    return e.margin.left + Width.get_fixed_unchecked(e.width) + e.margin.right;
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
    const fixedWidths = r.elements.map((e) => {
        switch (e.width.tag) {
            case "Fill":
                return null;
            case "Absolute":
                return Math.min(e.width.value, bound);
            case "Percent":
                // Row children are usually scaled before bounding, but this keeps
                // direct boundWidth() calls stable if Percent widths appear.
                return Math.min((e.width.value * bound) / 100.0, bound);
        }
    });
    const totalFixedOuterWidth = fixedWidths.reduce((acc, next, index) => next === null
        ? acc
        : acc +
            r.elements[index].margin.left +
            next +
            r.elements[index].margin.right, 0);
    const fillElementCount = fixedWidths.filter((next) => next === null).length;
    const totalFillMargins = fixedWidths.reduce((acc, next, index) => next === null
        ? acc + r.elements[index].margin.left + r.elements[index].margin.right
        : acc, 0);
    const fillWidth = fillElementCount > 0
        ? Math.max(0, bound - totalFixedOuterWidth - totalFillMargins) /
            fillElementCount
        : 0;
    return row(r.elements.map((e, index) => { var _a; return Layout.boundWidth(e, (_a = fixedWidths[index]) !== null && _a !== void 0 ? _a : fillWidth); }), r.margin, r.alignment, Width.absolute(bound), r.is_frozen, Width.is_fill(r.width));
}
function scaleWidth(r, w) {
    return (0, Utils_1.with_)(r, {
        elements: r.elements.map((e) => Layout.scaleWidth(e, w)),
        width: Width.scale(r.width, w),
    });
}
