"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson = exports.fromJson = exports.default_ = exports.copy = exports.margin = void 0;
function margin(top, bottom, left, right) {
    return {
        top,
        bottom,
        left,
        right,
    };
}
exports.margin = margin;
function copy(m) {
    return margin(m.top, m.bottom, m.left, m.right);
}
exports.copy = copy;
function default_() {
    return margin(0, 0, 0, 0);
}
exports.default_ = default_;
function fromJson(json) {
    if (typeof json !== "object" || json === null) {
        throw new Error("Could not parse Margin");
    }
    if (!("top" in json && typeof json.top === "number")
        || !("bottom" in json && typeof json.bottom === "number")
        || !("left" in json && typeof json.left === "number")
        || !("right" in json && typeof json.right === "number")) {
        throw new Error("Could not parse Margin");
    }
    return margin(json.top, json.bottom, json.left, json.right);
}
exports.fromJson = fromJson;
function toJson(m) {
    return m;
}
exports.toJson = toJson;
