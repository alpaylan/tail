export class Point {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	move_x_by(x: number): Point {
		return new Point(this.x + x, this.y);
	}

	move_y_by(y: number): Point {
		return new Point(this.x, this.y + y);
	}

	move_x_to(x: number): Point {
		return new Point(x, this.y);
	}

	move_y_to(y: number): Point {
		return new Point(this.x, y);
	}
}
