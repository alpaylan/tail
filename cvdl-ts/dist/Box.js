"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Box = void 0;
class Box {
    constructor(top_left, bottom_right) {
        this.top_left = top_left;
        this.bottom_right = bottom_right;
    }
    move_x_by(x) {
        return new Box(this.top_left.move_x_by(x), this.bottom_right.move_x_by(x));
    }
    move_y_by(y) {
        return new Box(this.top_left.move_y_by(y), this.bottom_right.move_y_by(y));
    }
    width() {
        return this.bottom_right.x - this.top_left.x;
    }
    height() {
        return this.bottom_right.y - this.top_left.y;
    }
}
exports.Box = Box;
