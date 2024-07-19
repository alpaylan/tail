"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copy = exports.with_ = void 0;
function with_(e, w) {
    return { ...e, ...w };
}
exports.with_ = with_;
function copy(s) {
    return {
        ...s,
    };
}
exports.copy = copy;
