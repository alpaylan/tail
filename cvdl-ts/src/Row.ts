import * as Margin from "./Margin";
import * as Width from "./Width";
import * as Alignment from "./Alignment";
import { Optional, with_ } from "./Utils";
import * as Layout from "./Layout";

export type t = {
	tag: "Row";
	elements: Layout.t[];
	margin: Margin.t;
	alignment: Alignment.t;
	width: Width.t;
	is_frozen: boolean;
	is_fill: boolean;
};

type Row = t;

export function from(w: Optional<Row>): Row {
	return { ...default_(), ...w };
}

export function row(
	elements: Layout.t[],
	margin: Margin.t,
	alignment: Alignment.t,
	width: Width.t,
	is_frozen: boolean,
	is_fill: boolean,
): Row {
	return {
		tag: "Row",
		elements,
		margin,
		alignment,
		width,
		is_frozen,
		is_fill,
	};
}

export function default_(): Row {
	return {
		tag: "Row",
		elements: [],
		margin: Margin.default_(),
		alignment: Alignment.default_(),
		width: Width.default_(),
		is_frozen: false,
		is_fill: false,
	};
}

export function elementsWidth(r: Row): number {
	return r.elements
		.map((e) => Width.get_fixed_unchecked(e.width))
		.reduce((a, b) => a + b, 0.0);
}

export function boundWidth(r: Row, width: number): Row {
	const bound =
		r.width.tag === "Absolute"
			? Math.min(r.width.value, width)
			: r.width.tag === "Fill"
				? width
				: null;

	if (bound === null) {
		throw new Error("Cannot bound width of non-unitized widths!");
	}

	return row(
		r.elements.map((e) => Layout.boundWidth(e, bound)),
		r.margin,
		r.alignment,
		Width.absolute(bound),
		r.is_frozen,
		Width.is_fill(r.width),
	);
}

export function scaleWidth(r: Row, w: number): Row {
	return with_(r, {
		elements: r.elements.map((e) => Layout.scaleWidth(e, w)),
		width: Width.scale(r.width, w),
	});
}
