import * as Width from "./Width";
import * as Font from "./Font";
import { Box } from "./Box";
import { ElementPath, FontDict } from "./AnyLayout";
import { Point } from "./Point";
import * as Stack from "./Stack";
import * as Row from "./Row";
import * as Elem from "./Elem";
import { Field } from "./DataSchema";
import { with_ } from "./Utils";
import * as Alignment from "./Alignment";
import * as Margin from "./Margin";
import * as Resume from "./Resume";

export type Container = Stack.t | Row.t;
export type t = Stack.t | Row.t | Elem.t;
type Layout = t;

// A rendered layout is a layout with a bounding box and where all the elements are also rendered layouts
export type RenderedStack = Stack.t & {
	bounding_box: Box;
	elements: RenderedLayout[];
};
export type RenderedRow = Row.t & {
	bounding_box: Box;
	elements: RenderedLayout[];
};

export type Binding = {
	binding: string;
};

export type PreBindingElem = Elem.t & {
	width: Width.t | Binding;
	font: Font.t | Binding;
	margin: Margin.t | Binding;
	alignment: Alignment.t | Binding;
	background_color: Color | Binding;
};

export type PreBindingContainer = Container & {
	width: Width.t | Binding;
	margin: Margin.t | Binding;
	alignment: Alignment.t | Binding;
};

export type PreBindingLayout = PreBindingElem | PreBindingContainer;
export type BindedLayout = Layout;

export type RenderedElem = Elem.t & { bounding_box: Box };

export type RenderedLayout = (RenderedStack | RenderedRow | RenderedElem) & {
	path?: ElementPath;
};

export function default_(tag: string) {
	switch (tag) {
		case "Stack":
			return Stack.default_();
		case "FlexRow":
			return Row.default_();
		case "FrozenRow":
			return with_(Row.default_(), { is_frozen: true });
		case "Text":
			return Elem.default_();
		case "Ref":
			return Elem.asRef(Elem.default_());
	}
}

export function empty(): Layout {
	return default_("Stack");
}

export function type_(l: Layout): string {
	return l.tag;
}

export function tag_(l: Layout): string {
	switch (l.tag) {
		case "Stack":
			return "Stack";
		case "Row": {
			const row = l as Row.t;
			return row.is_frozen ? "FrozenRow" : "FlexRow";
		}
		case "Elem": {
			const elem = l as Elem.t;
			return elem.is_ref ? "Ref" : "Text";
		}
	}
}

export function isContainer(l: Layout): boolean {
	return l.tag === "Stack" || l.tag === "Row";
}

export function isFill(l: Layout): boolean {
	switch (l.tag) {
		case "Stack":
			return (
				l.is_fill &&
				(l as Stack.t).elements
					.map((e) => isFill(e))
					.reduce((a, b) => a && b, true)
			);
		case "Row":
			return (
				l.is_fill &&
				(l as Row.t).elements
					.map((e) => isFill(e))
					.reduce((a, b) => a && b, true)
			);
		case "Elem":
			return l.is_fill;
	}
}

export function isRef(l: Layout): boolean {
	return l.tag === "Elem" && l.is_ref;
}

export function fonts(l: Layout): Font.t[] {
	switch (l.tag) {
		case "Stack":
			return (l as Stack.t).elements
				.map((e) => fonts(e))
				.reduce((a, b) => a.concat(b), []);
		case "Row":
			return (l as Row.t).elements
				.map((e) => fonts(e))
				.reduce((a, b) => a.concat(b), []);
		case "Elem":
			return [(l as Elem.t).font];
	}
}

export function totalElementsWidth(l: Layout): number {
	switch (l.tag) {
		case "Stack":
			return (l as Stack.t).elements
				.map((e) => totalElementsWidth(e))
				.reduce((a, b) => a + b, 0.0);
		case "Row":
			return (l as Row.t).elements
				.map((e) => totalElementsWidth(e))
				.reduce((a, b) => a + b, 0.0);
		case "Elem":
			return Width.get_fixed_unchecked((l as Elem.t).width);
	}
}

export function isInstantiated(l: Layout): boolean {
	if (isContainer(l)) {
		return (l as Container).elements
			.map((e) => isInstantiated(e))
			.reduce((a, b) => a && b, true);
	} else {
		return !isRef(l);
	}
}

export function instantiate(
	l: PreBindingLayout,
	section: Resume.Item,
	fields: Field[],
	bindings: Map<string, unknown>,
): Layout {
	switch (l.tag) {
		case "Stack":
		case "Row":
			return with_(l, {
				elements: (l as Container).elements.map((e) =>
					instantiate(e, section, fields, bindings),
				),
			});
		case "Elem":
			return Elem.instantiate(l, section, fields, bindings);
	}
}

export function boundWidth(l: Layout, width: number): Layout {
	const bound =
		l.width.tag === "Absolute"
			? Math.min(l.width.value, width)
			: l.width.tag === "Fill"
				? width
				: null;

	if (bound === null) {
		throw new Error("Cannot bound width of non-unitized widths!");
	}

	if (l.tag === "Elem" && l.is_ref) {
		throw new Error("Cannot propagate widths of uninstantiated layout");
	}

	switch (l.tag) {
		case "Stack":
			return Stack.boundWidth(
				l as Stack.t,
				bound - l.margin.left - l.margin.right,
			);
		case "Row":
			return Row.boundWidth(l as Row.t, bound - l.margin.left - l.margin.right);
		case "Elem":
			return Elem.boundWidth(
				l as Elem.t,
				bound - l.margin.left - l.margin.right,
			);
	}
}

export function scaleWidth(l: Layout, document_width: number): Layout {
	if (isRef(l)) {
		throw new Error("Cannot scale width of uninstantiated layout");
	}
	switch (l.tag) {
		case "Stack":
			return Stack.scaleWidth(l as Stack.t, document_width);
		case "Row":
			return Row.scaleWidth(l as Row.t, document_width);
		case "Elem":
			return Elem.scaleWidth(l as Elem.t, document_width);
	}
}

export function normalize(
	l: Layout,
	width: number,
	font_dict: FontDict,
): Layout {
	console.debug(
		`Normalizing document, checking if document is instantiated...`,
	);
	if (!isInstantiated(l)) {
		throw Error(`Cannot normalize uninstantiated layout ${JSON.stringify(l)}`);
	}

	console.debug("Document is instantiated. Scaling widths...");

	const scaled_layout = scaleWidth(l, width);

	console.debug("Widths are scaled. Bounding widths...");

	const bounded_layout = boundWidth(scaled_layout, width);

	console.debug("Widths are bounded. Filling fonts...");

	const font_filled_layout = fillFonts(bounded_layout, font_dict);

	console.debug("Fonts filled.");

	return font_filled_layout;
}

export function fillFonts(l: Layout, font_dict: FontDict): Layout {
	if (isRef(l)) {
		throw new Error("Cannot fill fonts of uninstantiated layout");
	}

	switch (l.tag) {
		case "Stack":
		case "Row": {
			const filledFonts = (l as Container).elements.map((e) =>
				fillFonts(e, font_dict),
			);
			l = { ...l, elements: filledFonts };
			if (isFill(l)) {
				const total_width = totalElementsWidth(l);
				if (total_width <= Width.get_fixed_unchecked(l.width)) {
					// throw `Cannot fill fonts of row with width ${JSON.stringify(this.width())} and total width ${total_width}`
					return with_(l, { width: Width.absolute(total_width) });
				}
			}
			return l;
		}
		case "Elem":
			return Elem.fillFonts(l as Elem.t, font_dict);
	}
}

export function computeBoxes(l: Layout, font_dict: FontDict): RenderedLayout {
	const top_left: Point = new Point(0.0, 0.0);
	return computeTextboxPositions(l, top_left, font_dict).renderedLayout;
}

export function computeTextboxPositions(
	l: Layout,
	top_left: Point,
	font_dict: FontDict,
): { depth: number; renderedLayout: RenderedLayout } {
	let depth = top_left.y;
	switch (l.tag) {
		case "Stack": {
			const stack = l as Stack.t;
			top_left = top_left
				.move_y_by(stack.margin.top)
				.move_x_by(stack.margin.left);
			const originalTopLeft = top_left;
			const renderedElements = [];
			for (const element of stack.elements) {
				const result = computeTextboxPositions(element, top_left, font_dict);
				depth = result.depth;

				top_left = top_left.move_y_to(depth);
				renderedElements.push(result.renderedLayout);
			}
			depth += stack.margin.bottom;
			return {
				depth,
				renderedLayout: {
					...l,
					bounding_box: new Box(
						originalTopLeft,
						top_left
							.move_x_by(Width.get_fixed_unchecked(stack.width))
							.move_y_by(stack.margin.bottom),
					),
					elements: renderedElements,
				},
			};
		}
		case "Row": {
			const row = l as Row.t;
			top_left = top_left.move_y_by(row.margin.top).move_x_by(row.margin.left);
			const originalTopLeft = top_left;
			let per_elem_space: number = 0.0;
			switch (row.alignment) {
				case "Center":
					top_left = top_left.move_x_by(
						(Width.get_fixed_unchecked(row.width) - Row.elementsWidth(row)) /
							2.0,
					);
					break;
				case "Right":
					top_left = top_left.move_x_by(
						Width.get_fixed_unchecked(row.width) - Row.elementsWidth(row),
					);
					break;
				case "Justified":
					per_elem_space =
						(Width.get_fixed_unchecked(row.width) - Row.elementsWidth(row)) /
						(row.elements.length - 1);
					break;
			}

			const renderedElements = [];

			for (const element of row.elements) {
				const result = computeTextboxPositions(element, top_left, font_dict);
				depth = Math.max(depth, result.depth);
				top_left = top_left.move_x_by(
					Width.get_fixed_unchecked(element.width) + per_elem_space,
				);
				renderedElements.push(result.renderedLayout);
			}

			depth += row.margin.bottom;
			return {
				depth,
				renderedLayout: {
					...l,
					bounding_box: new Box(
						originalTopLeft,
						originalTopLeft
							.move_y_by(depth)
							.move_x_by(Width.get_fixed_unchecked(row.width)),
					),
					elements: renderedElements,
				},
			};
		}

		case "Elem": {
			const elem = l as Elem.t;

			if (elem.is_ref) {
				throw new Error(
					"Cannot compute textbox positions of uninstantiated layout",
				);
			}

			const height = Font.get_height(elem.font, font_dict);
			top_left = top_left
				.move_y_by(elem.margin.top)
				.move_x_by(elem.margin.left);
			let line = 1;
			let cursor = top_left.x;
			elem.spans.forEach((span) => {
				if (
					cursor - top_left.x + span.width >
						Width.get_fixed_unchecked(elem.width) - elem.margin.right ||
					span.text === "\n\n"
				) {
					cursor = top_left.x;
					line += 1;
				}
				span.bbox = new Box(
					new Point(cursor - top_left.x, (line - 1) * height),
					new Point(cursor + span.width, line * height),
				);
				span.line = line;
				cursor += span.width;
			});

			const lineWidths = elem.spans.reduce(
				(acc, span) => {
					acc[span.line - 1].width += span.width;
					return acc;
				},
				Array.from({ length: line }, (_, i) => ({ line: i + 1, width: 0 })),
			);

			switch (elem.alignment) {
				case "Center":
					elem.spans.forEach((span) => {
						span.bbox = span.bbox.move_x_by(
							(Width.get_fixed_unchecked(elem.width) -
								lineWidths[span.line - 1].width) /
								2.0,
						);
					});
					break;
				case "Right":
					elem.spans.forEach((span) => {
						span.bbox = span.bbox.move_x_by(
							Width.get_fixed_unchecked(elem.width) -
								lineWidths[span.line - 1].width,
						);
					});
					break;
				case "Justified": {
					for (let i = 1; i < line; i++) {
						const lineSpans = elem.spans.filter(
							(span) =>
								span.line === i &&
								span.text !== "\n\n" &&
								span.text !== "\n" &&
								span.text !== " ",
						);
						const totalWidth = lineSpans.reduce(
							(acc, span) => acc + span.width,
							0,
						);
						const perSpace =
							(Width.get_fixed_unchecked(elem.width) - totalWidth) /
							(lineSpans.length - 1);
						let cursor = 0;
						lineSpans.forEach((span) => {
							span.bbox = span.bbox.move_x_by(cursor - span.bbox.top_left.x);
							cursor += span.width + perSpace;
						});
					}
				}
			}

			const textbox = new Box(
				top_left,
				top_left
					.move_x_by(Width.get_fixed_unchecked(elem.width))
					.move_y_by(height * line + elem.margin.bottom),
			);
			return {
				depth: top_left.y + height * line + elem.margin.bottom,
				renderedLayout: { ...l, bounding_box: textbox },
			};
		}
	}
}

export type Color =
	| "Transparent" // transparent
	| "Light Yellow" // "#FFC96F"
	| "Light Brown" // "#ECB176"
	| "Light Green" // "#F6FAB9"
	| "Light Beige" // "#F6EEC9"
	| "Light Blue" // "#EEF7FF"
	| "Blue"; // "#4793AF"

export const ColorMap = {
	Transparent: "transparent",
	"Light Yellow": "#FFC96F",
	"Light Brown": "#ECB176",
	"Light Green": "#F6FAB9",
	"Light Beige": "#F6EEC9",
	"Light Blue": "#EEF7FF",
	Blue: "#4793AF",
};
