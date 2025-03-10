// Use DOM as a backend for the CVDL layout engine.

import {
	ElementPath,
	FontDict,
	render as anyRender,
} from "cvdl-ts/dist/AnyLayout";
import * as Resume from "cvdl-ts/dist/Resume";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { ResumeLayout } from "cvdl-ts/dist/ResumeLayout";
import { Storage } from "cvdl-ts/dist/Storage";
import { Dispatch } from "react";
import { EditorAction, EditorState } from "@/components/State";
import { ColorMap } from "cvdl-ts/dist/Layout";
import { Font, Layout } from "cvdl-ts";
import * as Elem from "cvdl-ts/dist/Elem";
import { Box } from "cvdl-ts/dist/Box";

export type RenderResult = {
	blob: Blob;
	fontDict: FontDict;
};

export type RenderProps = {
	resume_name: string;
	resume: Resume.t;
	data_schemas: DataSchema.t[];
	layout_schemas: LayoutSchema[];
	resume_layout: ResumeLayout;
	storage: Storage;
	bindings: Map<string, unknown>;
	fontDict: FontDict;
	debug: boolean;
	state: EditorState;
	dispatch: Dispatch<EditorAction>;
};

export const ReactLayout = ({
	resume,
	data_schemas,
	layout_schemas,
	resume_layout,
	storage,
	bindings,
	fontDict,
	state,
	dispatch,
	debug = false,
}: RenderProps) => {
	const layouts = anyRender({
		layout_schemas,
		resume,
		bindings,
		data_schemas,
		resume_layout,
		storage,
		fontDict,
	});

	let firstPage: RenderedSpan[] = [];
	let tracker = {
		pages: [firstPage],
		page: 0,
		path: null,
		pageContainer: firstPage,
		height: 0,
		state,
		dispatch,
		layout: resume_layout,
		fontDict,
	};

	tracker.pageContainer = getPageContainer(tracker.page, tracker);

	for (const layout of layouts) {
		renderSectionLayout(layout, tracker);
		tracker.height +=
			layout.bounding_box!.height() + layout.margin.top + layout.margin.bottom;
	}

	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			{tracker.pages.map((page, index) => (
				<div
					id={`page-${index}`}
					style={{
						position: "relative",
						width: `${tracker.layout.width}px`,
						height: `${tracker.layout.height}px`,
						border: "1px solid black",
					}}
				>
					{page.map((span) => (
						<>
							<span
								onClick={(e) => {
									if (span.path.tag === "section") {
										tracker.dispatch({
											type: "set-editor-path",
											path: { ...span.path },
										});
										return;
									} else if (span.path.tag === "item") {
										tracker.dispatch({
											type: "set-editor-path",
											path: { ...span.path, tag: "field", field: span.item },
										});
									} else {
										console.error(
											"Cannot path to item",
											tracker.path,
											span.item,
										);
									}
								}}
								style={{
									position: "absolute",
									left: span.left + "px",
									top: span.top + "px",
									fontFamily: `"${Font.full_name(span.font!)}", sans-serif`,
									fontSize: span.font.size + "px",
									fontStyle: span.font.style,
									fontWeight: span.font.weight,
									backgroundColor: span.backgroundColor,
								}}
							>
								{span.text}
							</span>
							{span.is_code && (
								<div
									style={{
										position: "absolute",
										left: span.left - span.font.size / 5 + "px",
										top: span.top + "px",
										width: span.bbox.width() + (span.font.size / 5) * 2 + "px",
										height: span.bbox.height() + "px",
										borderRadius: "5px",
										border: "1px solid black",
										backgroundColor: "rgba(0, 0, 0, 0.05)",
									}}
								></div>
							)}
						</>
					))}
				</div>
			))}
		</div>
	);
};

type Tracker = {
	page: number;
	pages: RenderedSpan[][];
	pageContainer: RenderedSpan[];
	height: number;
	layout: ResumeLayout;
	fontDict: FontDict;
	state: EditorState;
	dispatch: Dispatch<EditorAction>;
	path: ElementPath | null;
};

type RenderedSpan = {
	text: string;
	item: string;
	path: ElementPath;
	bbox: Box;
	is_code: boolean;
	url: string | null;
	left: number;
	top: number;
	font: Font.t;
	backgroundColor: string;
};

const getPageContainer = (page: number, tracker: Tracker) => {
	if (tracker.pages.length - 1 >= page) {
		return tracker.pages[page];
	} else {
		tracker.pages.push([]);
		return tracker.pages[tracker.pages.length - 1];
	}
};

export const mergeSpans = (spans: Elem.Span[]): Elem.Span[] => {
	const merged_spans: Elem.Span[] = [];
	let currentSpan = spans[0];
	for (let i = 1; i < spans.length; i++) {
		if (
			currentSpan.bbox!.top_left.y === spans[i].bbox!.top_left.y &&
			currentSpan.font === spans[i].font &&
			currentSpan.is_code === spans[i].is_code &&
			currentSpan.is_bold === spans[i].is_bold &&
			currentSpan.is_italic === spans[i].is_italic
		) {
			currentSpan.text += spans[i].text;
			currentSpan.bbox!.bottom_right = spans[i].bbox!.bottom_right;
		} else {
			merged_spans.push(currentSpan);
			currentSpan = spans[i];
		}
	}
	merged_spans.push(currentSpan);
	return merged_spans;
};

export const renderSectionLayout = (
	layout: Layout.RenderedLayout,
	tracker: Tracker,
) => {
	switch (layout.tag) {
		case "Stack": {
			const stack = layout as Layout.RenderedStack;
			for (const elem of stack.elements) {
				renderSectionLayout(elem, {
					...tracker,
					path: layout.path ?? tracker.path,
				});
			}
			break;
		}
		case "Row": {
			const row = layout as Layout.RenderedRow;
			for (const elem of row.elements) {
				renderSectionLayout(elem, {
					...tracker,
					path: layout.path ?? tracker.path,
				});
			}
			break;
		}
		case "Elem": {
			const element = layout as Elem.t;

			if (!layout.bounding_box) {
				return;
			}

			const spans =
				element.alignment === "Justified"
					? element.spans!
					: mergeSpans(element.spans!);
			spans.forEach((span) => {
				if (
					!span ||
					span.text === "" ||
					span.text === " " ||
					span.text === "\n" ||
					span.text === "\n\n"
				) {
					return;
				}

				const absoluteY =
					layout.bounding_box.top_left.y +
					tracker.height +
					span.bbox!.top_left.y;
				let page = Math.floor(
					absoluteY /
						(tracker.layout.height -
							tracker.layout.margin.top -
							tracker.layout.margin.bottom),
				);
				const currentPageY =
					absoluteY %
					(tracker.layout.height -
						tracker.layout.margin.top -
						tracker.layout.margin.bottom);
				const y = currentPageY + tracker.layout.margin.top;
				const x =
					layout.bounding_box.top_left.x +
					tracker.layout.margin.left +
					span.bbox!.top_left.x;
				tracker.pageContainer = getPageContainer(page, tracker);
				tracker.pageContainer.push({
					text: span.text,
					item: element.item,
					path: layout.path ?? tracker.path ?? { tag: "none" },
					is_code: span.is_code,
					url: element.url,
					left: x,
					top: y,
					font: span.font!,
					bbox: span.bbox!,
					backgroundColor: `${ColorMap[element.background_color]}`,
				});
			});
			break;
		}
	}
};
