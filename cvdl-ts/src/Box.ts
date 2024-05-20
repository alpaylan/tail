import { Point } from "./Point";

export class Box {
    top_left: Point;
    bottom_right: Point;

    constructor(top_left: Point, bottom_right: Point) {
        this.top_left = top_left;
        this.bottom_right = bottom_right;
    }

    move_x_by(x: number): Box {
        return new Box(
            this.top_left.move_x_by(x),
            this.bottom_right.move_x_by(x)
        );
    }

    move_y_by(y: number): Box {
        return new Box(
            this.top_left.move_y_by(y),
            this.bottom_right.move_y_by(y)
        );
    }

    width(): number {
        return this.bottom_right.x - this.top_left.x;
    }

    height(): number {
        return this.bottom_right.y - this.top_left.y;
    }


}
