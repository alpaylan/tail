import { Point } from "./Point";
export declare class Box {
    top_left: Point;
    bottom_right: Point;
    constructor(top_left: Point, bottom_right: Point);
    move_x_by(x: number): Box;
    move_y_by(y: number): Box;
    width(): number;
    height(): number;
}
