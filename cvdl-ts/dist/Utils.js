"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.with_ = with_;
exports.copy = copy;
function with_(e, w) {
    return { ...e, ...w };
}
function copy(s) {
    return {
        ...s,
    };
}
