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

export type RenderResult = {
	blob: Blob;
	fontDict: FontDict;
};

export type RenderProps = {
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

export const render = ({
	resume,
	data_schemas,
	layout_schemas,
	resume_layout,
	storage,
	bindings,
	fontDict,
	state,
	dispatch,
}: RenderProps) => {
	let container = document.getElementById("pdf-container")!;
	container.innerHTML = "";

	let start_time = Date.now();

	const layouts = anyRender({
		layout_schemas,
		resume,
		bindings,
		data_schemas,
		resume_layout,
		storage,
		fontDict,
	});
	let end_time = Date.now();
	console.info(`Rendering time: ${end_time - start_time}ms`);

	// Add the fonts to the document(@TODO: DO NOT HARDCODE THE FONTS)
	try {
		console.log("Registering fonts...");
		for (const [font_name, font] of fontDict.fonts.entries()) {
			console.log(`Registering font ${font_name}`);
			// @ts-ignore
			document.fonts.add(new FontFace(font_name, font.stream.buffer));
		}
	} catch (e) {
		console.error(e);
	}

	console.log("Rendering the document...");

	let tracker = {
		page: 0,
		path: null,
		pageContainer: container,
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

	console.log("Rendering is completed. Saving the document...");

	console.log("Document is saved to output.pdf");
};

type Tracker = {
	page: number;
	pageContainer: HTMLElement;
	height: number;
	layout: ResumeLayout;
	fontDict: FontDict;
	state: EditorState;
	dispatch: Dispatch<EditorAction>;
	path: ElementPath | null;
};

const getPageContainer = (page: number, tracker: Tracker) => {
	if (document.getElementById(`page-${page}`)) {
		return document.getElementById(`page-${page}`)!;
	} else {
		let pageContainer = document.createElement("div");
		pageContainer.id = `page-${page}`;
		pageContainer.style.cssText = `
            position: relative;
            width: ${tracker.layout.width}px;
            height: ${tracker.layout.height}px;
            border: 1px solid black;
        `;
		document.getElementById("pdf-container")!.appendChild(pageContainer);
		return pageContainer;
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
				const spanElem = document.createElement("span");
				spanElem.innerText = span.text;
				spanElem.style.cssText = `
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    font-family: "${Font.full_name(span.font!)}", sans-serif;
                    font-size: ${span.font!.size}px;
                    font-style: ${span.font!.style};
                    font-weight: ${span.font!.weight};
                    background-color: ${ColorMap[element.background_color]};
                `;

				spanElem.addEventListener("mouseover", () => {
					spanElem.style.backgroundColor = "lightgray";
					spanElem.style.cursor = "pointer";
				});

				spanElem.addEventListener("mouseout", () => {
					spanElem.style.backgroundColor = ColorMap[element.background_color];
					spanElem.style.animation = "none";
				});

				spanElem.addEventListener("click", (e) => {
					e.stopPropagation();
					const path = layout.path ?? tracker.path ?? { tag: "none" };

					if (path.tag === "section") {
						tracker.dispatch({
							type: "set-editor-path",
							path: { ...path },
						});
						return;
					} else if (path.tag === "item") {
						tracker.dispatch({
							type: "set-editor-path",
							path: { ...path, tag: "field", field: element.item },
						});
					} else {
						console.error("Cannot path to item", tracker.path, element.item);
					}
				});

				spanElem.addEventListener("contextmenu", (e) => {
					e.stopPropagation();
					e.preventDefault();
					console.error("settings")
					
				})

				if (span.is_code) {
					const roundedRectangleElem = document.createElement("div");
					roundedRectangleElem.style.cssText = `
                        position: absolute;
                        left: ${x - span.font!.size / 5}px;
                        top: ${y}px;
                        width: ${span.bbox!.width() + (span.font!.size / 5) * 2}px;
                        height: ${span.bbox!.height()}px;
                        border-radius: 5px;
                        border: 1px solid black;
                        background-color: rgba(0, 0, 0, 0.05);
                    `;
					tracker.pageContainer.appendChild(roundedRectangleElem);
				}

				if (element.url) {
					const urlElem = document.createElement("a");
					urlElem.style.cssText = `
                        position: absolute;
                        left: ${x - span.font!.size / 5}px;
                        top: ${y}px;
                        width: ${span.bbox!.width() + (span.font!.size / 5) * 2}px;
                        height: ${span.bbox!.height()}px;
                        border: 1px solid lightblue;
						z-index: 3;
                    `;
					urlElem.href = element.url;
					tracker.pageContainer.appendChild(urlElem);
				}


				tracker.pageContainer.appendChild(spanElem);
			});
			break;
		}
	}
};