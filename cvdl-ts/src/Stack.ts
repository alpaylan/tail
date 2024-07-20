import { Alignment, Layout, Margin, Width } from ".";
import { Optional, with_ } from "./Utils";

export type t = {
	tag: "Stack";
	elements: Layout.t[];
	margin: Margin.t;
	alignment: Alignment.t;
	width: Width.t;
	is_fill: boolean;
};
type Stack = t;

export function from(w: Optional<Stack>): Stack {
	return { ...default_(), ...w };
}

export function stack(
	elements: Layout.t[],
	margin: Margin.t,
	alignment: Alignment.t,
	width: Width.t,
	is_fill: boolean,
): Stack {
	return {
		tag: "Stack",
		elements,
		margin,
		alignment,
		width,
		is_fill,
	};
}

export function default_(): Stack {
	return {
		tag: "Stack",
		elements: [],
		margin: Margin.default_(),
		alignment: Alignment.default_(),
		width: Width.default_(),
		is_fill: false,
	};
}

export function boundWidth(s: Stack, width: number): Stack {
	const bound =
		s.width.tag === "Absolute"
			? Math.min(s.width.value, width)
			: s.width.tag === "Fill"
				? width
				: null;
	if (bound === null) {
		throw new Error("Cannot bound width of non-unitized widths!");
	}
	return with_(s, {
		elements: s.elements.map((e) => Layout.boundWidth(e, bound)),
		width: Width.absolute(bound),
	});
}

export function scaleWidth(s: Stack, scale: number): Stack {
	return with_(s, {
		elements: s.elements.map((e) => Layout.scaleWidth(e, scale)),
		width: Width.scale(s.width, scale),
	});
}
