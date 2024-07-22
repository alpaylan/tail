"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.with_ = with_;
exports.copy = copy;
exports.randomString = randomString;
function with_(e, w) {
    return { ...e, ...w };
}
function copy(s) {
    return {
        ...s,
    };
}
function randomString() {
    return Math.random().toString(36).substring(7);
}
