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
	return r.elements.map(elementOuterWidth).reduce((a, b) => a + b, 0.0);
}

export function elementOuterWidth(e: Layout.t): number {
	return e.margin.left + Width.get_fixed_unchecked(e.width) + e.margin.right;
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

	const fixedWidths = r.elements.map((e) => {
		switch (e.width.tag) {
			case "Fill":
				return null;
			case "Absolute":
				return Math.min(e.width.value, bound);
			case "Percent":
				// Row children are usually scaled before bounding, but this keeps
				// direct boundWidth() calls stable if Percent widths appear.
				return Math.min((e.width.value * bound) / 100.0, bound);
		}
	});

	const totalFixedOuterWidth = fixedWidths.reduce(
		(acc, next, index) =>
			next === null
				? acc
				: acc +
					r.elements[index].margin.left +
					next +
					r.elements[index].margin.right,
		0,
	);
	const fillElementCount = fixedWidths.filter((next) => next === null).length;
	const totalFillMargins = fixedWidths.reduce(
		(acc, next, index) =>
			next === null
				? acc + r.elements[index].margin.left + r.elements[index].margin.right
				: acc,
		0,
	);
	const fillWidth =
		fillElementCount > 0
			? Math.max(0, bound - totalFixedOuterWidth - totalFillMargins) /
				fillElementCount
			: 0;

	return row(
		r.elements.map((e, index) =>
			Layout.boundWidth(e, fixedWidths[index] ?? fillWidth),
		),
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
