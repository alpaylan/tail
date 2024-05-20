"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Margin = void 0;
class Margin {
    constructor(top, bottom, left, right) {
        this.top = 0;
        this.bottom = 0;
        this.left = 0;
        this.right = 0;
        this.top = top;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
    }
    copy() {
        return new Margin(this.top, this.bottom, this.left, this.right);
    }
    static default_() {
        return new Margin(0, 0, 0, 0);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json) {
        return new Margin(json.top, json.bottom, json.left, json.right);
    }
    toJson() {
        return {
            top: this.top,
            bottom: this.bottom,
            left: this.left,
            right: this.right,
        };
    }
}
exports.Margin = Margin;
