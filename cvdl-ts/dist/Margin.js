"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.margin = margin;
exports.copy = copy;
exports.default_ = default_;
exports.fromJson = fromJson;
exports.toJson = toJson;
function margin(top, bottom, left, right) {
    return {
        top,
        bottom,
        left,
        right,
    };
}
function copy(m) {
    return margin(m.top, m.bottom, m.left, m.right);
}
function default_() {
    return margin(0, 0, 0, 0);
}
function fromJson(json) {
    if (typeof json !== "object" || json === null) {
        throw new Error("Could not parse Margin");
    }
    if (!("top" in json && typeof json.top === "number") ||
        !("bottom" in json && typeof json.bottom === "number") ||
        !("left" in json && typeof json.left === "number") ||
        !("right" in json && typeof json.right === "number")) {
        throw new Error("Could not parse Margin");
    }
    return margin(json.top, json.bottom, json.left, json.right);
}
function toJson(m) {
    return m;
}
