export type t = {
	top: number;
	bottom: number;
	left: number;
	right: number;
};

type Margin = t;

export function margin(
	top: number,
	bottom: number,
	left: number,
	right: number,
): Margin {
	return {
		top,
		bottom,
		left,
		right,
	};
}

export function copy(m: Margin) {
	return margin(m.top, m.bottom, m.left, m.right);
}

export function default_() {
	return margin(0, 0, 0, 0);
}