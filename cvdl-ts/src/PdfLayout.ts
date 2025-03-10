import blobStream from "blob-stream";
import { FontDict, render as anyRender } from "./AnyLayout";
import PdfDocument from "pdfkit";
import * as Resume from "./Resume";
import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import { ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";

import * as Elem from "./Elem";
import { Font, Layout } from ".";

export type RenderResult = {
	blob: Blob;
	fontDict: FontDict;
};

export type RenderProps = {
	resume_name?: string;
	resume?: Resume.t;
	data_schemas?: DataSchema.t[];
	layout_schemas?: LayoutSchema[];
	resume_layout?: ResumeLayout;
	bindings: Map<string, unknown>;
	storage: Storage;
	fontDict?: FontDict;
	debug: boolean;
};

export const render = async ({
	resume_name,
	resume,
	data_schemas,
	layout_schemas,
	resume_layout,
	bindings,
	storage,
	fontDict,
}: RenderProps) => {
	let start_time = Date.now();

	if (!resume && !resume_name) {
		throw "Rendering requires either resume_name or resume";
	}

	if (!resume) {
		if (!resume_name) {
			throw "Rendering requires resume_name";
		}
		resume = await storage.load_resume(resume_name);
	}

	if (!data_schemas) {
		data_schemas = await Promise.all(
			Resume.dataSchemas(resume).map((schema) =>
				storage.load_data_schema(schema),
			),
		);
	}

	if (!layout_schemas) {
		layout_schemas = await Promise.all(
			Resume.layoutSchemas(resume).map((schema) =>
				storage.load_layout_schema(schema),
			),
		);
	}

	if (!resume_layout) {
		resume_layout = await storage.load_resume_layout(resume.layout);
	}

	if (!fontDict) {
		fontDict = new FontDict();
	}

	let end_time = Date.now();

	console.info(`Loading time: ${end_time - start_time}ms`);

	const doc = new PdfDocument();
	const stream = doc.pipe(blobStream());

	start_time = Date.now();
	const layouts = await anyRender({
		layout_schemas,
		resume,
		data_schemas,
		resume_layout,
		bindings,
		storage,
		fontDict,
	});
	end_time = Date.now();
	console.info(`Rendering time: ${end_time - start_time}ms`);
	console.log("Constructing printpdf font dictionary...");

	console.log("Rendering the document...");
	// doc.registerFont("Exo-Medium",
	//     "/Users/akeles/Programming/projects/cvdl/cvdl/assets/Exo/static/Exo-Medium.ttf");

	try {
		console.log("Registering fonts...");
		for (const [font_name, font] of fontDict.fonts.entries()) {
			console.log(`Registering font ${font_name}`);
			// @ts-ignore
			doc.registerFont(font_name, font.stream.buffer);
		}
	} catch (e) {
		console.error(e);
	}
	console.log("Rendering the document...");

	const tracker: Tracker = {
		page: 0,
		pageContainer: doc,
		height: 0,
		layout: resume_layout,
		fontDict: fontDict,
	};

	for (const layout of layouts) {
		renderSectionLayout(layout, tracker);
		tracker.height +=
			layout.bounding_box!.height() + layout.margin.top + layout.margin.bottom;
	}

	console.log("Rendering is completed. Saving the document...");

	console.log("Document is saved to output.pdf");
	doc.end();

	return new Promise<RenderResult>((resolve) => {
		stream.on("finish", () => {
			resolve({
				blob: stream.toBlob("application/pdf"),
				fontDict: fontDict,
			});
		});
	});
};

type Tracker = {
	page: number;
	pageContainer: PDFKit.PDFDocument;
	height: number;
	layout: ResumeLayout;
	fontDict: FontDict;
};

const getPageContainer = (page: number, tracker: Tracker) => {
	if (page > tracker.page) {
		tracker.page = page;
		tracker.pageContainer.addPage({
			size: [tracker.layout.width, tracker.layout.height],
		});
	}
	return tracker.pageContainer;
};

export const mergeSpans = (spans: Elem.Span[]): Elem.Span[] => {
	const merged_spans: Elem.Span[] = [];
	let currentSpan = spans[0];
	for (let i = 1; i < spans.length; i++) {
		if (
			currentSpan.bbox.top_left.y === spans[i].bbox.top_left.y &&
			currentSpan.font === spans[i].font &&
			currentSpan.is_code === spans[i].is_code &&
			currentSpan.is_bold === spans[i].is_bold &&
			currentSpan.is_italic === spans[i].is_italic
		) {
			currentSpan.text += spans[i].text;
			currentSpan.bbox.bottom_right = spans[i].bbox.bottom_right;
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
				renderSectionLayout(elem, tracker);
			}
			break;
		}
		case "Row": {
			const row = layout as Layout.RenderedRow;
			for (const elem of row.elements) {
				renderSectionLayout(elem, tracker);
			}
			break;
		}
		case "Elem": {
			const elem = layout as Elem.t;
			console.log(`Rendering elem ${elem.text}`);
			if (!layout.bounding_box) {
				return;
			}
			if (elem.text === "") {
				return;
			}

			const spans =
				elem.alignment === "Justified" ? elem.spans! : mergeSpans(elem.spans!);
			spans.forEach((span) => {
				if (
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
				const page = Math.floor(
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

				tracker.pageContainer
					.font(Font.full_name(span.font))
					.fontSize(span.font.size)
					.text(span.text, x, y, { lineBreak: false });

				if (span.is_code) {
					// Add a rounded rectangle around the code
					tracker.pageContainer
						.roundedRect(
							layout.bounding_box.top_left.x +
								tracker.layout.margin.left +
								span.bbox.top_left.x -
								span.font.size / 5,
							layout.bounding_box.top_left.y +
								tracker.layout.margin.top +
								tracker.height +
								span.bbox.top_left.y,
							span.bbox.width() + (span.font.size / 5) * 2,
							span.bbox.height(),
							5,
						)
						.stroke();
					// Add a background color to the code
					tracker.pageContainer.fillColor("black");
					tracker.pageContainer.fillOpacity(0.05);
					tracker.pageContainer
						.rect(
							layout.bounding_box.top_left.x +
								tracker.layout.margin.left +
								span.bbox.top_left.x -
								span.font.size / 5,
							layout.bounding_box.top_left.y +
								tracker.layout.margin.top +
								tracker.height +
								span.bbox.top_left.y,
							span.bbox.width() + (span.font.size / 5) * 2,
							span.bbox.height(),
						)
						.fill();
					tracker.pageContainer.fillOpacity(1);
				}
			});
			break;
		}
	}
};
