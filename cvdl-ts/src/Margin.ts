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

export function fromJson(json: unknown): Margin {
	if (typeof json !== "object" || json === null) {
		throw new Error("Could not parse Margin");
	}

	if (
		!("top" in json && typeof json.top === "number") ||
		!("bottom" in json && typeof json.bottom === "number") ||
		!("left" in json && typeof json.left === "number") ||
		!("right" in json && typeof json.right === "number")
	) {
		throw new Error("Could not parse Margin");
	}

	return margin(json.top, json.bottom, json.left, json.right);
}

export function toJson(m: Margin): unknown {
	return m;
}
