"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    move_x_by(x) {
        return new Point(this.x + x, this.y);
    }
    move_y_by(y) {
        return new Point(this.x, this.y + y);
    }
    move_x_to(x) {
        return new Point(x, this.y);
    }
    move_y_to(y) {
        return new Point(this.x, y);
    }
}
exports.Point = Point;
