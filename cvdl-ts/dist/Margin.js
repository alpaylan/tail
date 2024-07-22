"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.margin = margin;
exports.copy = copy;
exports.default_ = default_;
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
