import {
	Document,
	Packer,
	Paragraph,
	TextRun,
	Table,
	TableRow,
	TableCell,
	WidthType,
	AlignmentType,
	BorderStyle,
	ExternalHyperlink,
	ShadingType,
	TableLayoutType,
	ITableCellBorders,
	IRunOptions,
} from "docx";
import {
	render as anyRender,
	resolveRenderInputs,
	BackendRenderProps,
	RenderResult,
} from "./AnyLayout";
import * as Layout from "./Layout";
import * as Alignment from "./Alignment";
import * as Elem from "./Elem";
import * as Width from "./Width";

export type { RenderResult, BackendRenderProps as RenderProps };

const ptToHalfPt = (pt: number) => Math.round(pt * 2);
const ptToTwip = (pt: number) => Math.round(pt * 20);

const ALIGNMENT_MAP: Record<
	Alignment.t,
	(typeof AlignmentType)[keyof typeof AlignmentType]
> = {
	Left: AlignmentType.LEFT,
	Center: AlignmentType.CENTER,
	Right: AlignmentType.RIGHT,
	Justified: AlignmentType.JUSTIFIED,
};

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders: ITableCellBorders = {
	top: noBorder,
	bottom: noBorder,
	left: noBorder,
	right: noBorder,
};
const tableBorders = {
	top: noBorder,
	bottom: noBorder,
	left: noBorder,
	right: noBorder,
	insideHorizontal: noBorder,
	insideVertical: noBorder,
};

const spanToRunOptions = (span: Elem.Span): IRunOptions => {
	const font = span.font;
	return {
		text: span.text,
		bold: span.is_bold || font?.weight === "Bold",
		italics: span.is_italic || font?.style === "Italic",
		font: font?.name,
		size: font ? ptToHalfPt(font.size) : undefined,
		shading: span.is_code
			? { type: ShadingType.CLEAR, fill: "E0E0E0", color: "auto" }
			: undefined,
	};
};

const spanToRun = (span: Elem.Span): TextRun | ExternalHyperlink =>
	span.link
		? new ExternalHyperlink({
				link: span.link,
				children: [
					new TextRun({ ...spanToRunOptions(span), style: "Hyperlink" }),
				],
			})
		: new TextRun(spanToRunOptions(span));

type BlockElement = Paragraph | Table;

const renderElem = (elem: Elem.t): BlockElement[] => {
	if (!elem.spans?.length || elem.text === "") return [];

	const spans = elem.spans.filter((s) => s.text !== "\n" && s.text !== "\n\n");
	if (spans.length === 0) return [];

	// Group spans by line number
	const lineMap = new Map<number, Elem.Span[]>();
	for (const span of spans) {
		const line = span.line ?? 1;
		if (!lineMap.has(line)) lineMap.set(line, []);
		lineMap.get(line)!.push(span);
	}

	const children: (TextRun | ExternalHyperlink)[] = [];
	const sortedLines = Array.from(lineMap.keys()).sort((a, b) => a - b);
	for (let i = 0; i < sortedLines.length; i++) {
		if (i > 0) children.push(new TextRun({ break: 1 }));
		for (const span of lineMap.get(sortedLines[i])!) {
			if (span.text !== "") children.push(spanToRun(span));
		}
	}

	if (children.length === 0) return [];

	return [
		new Paragraph({
			children,
			alignment: ALIGNMENT_MAP[elem.alignment],
			spacing: {
				before: ptToTwip(elem.margin.top),
				after: ptToTwip(elem.margin.bottom),
			},
			indent: {
				left: ptToTwip(elem.margin.left),
				right: ptToTwip(elem.margin.right),
			},
		}),
	];
};

const renderRow = (row: Layout.RenderedRow): BlockElement[] => {
	const cells = row.elements.map((el) => {
		const element = el as Layout.RenderedLayout;
		const cellChildren = renderLayout(element);
		const cellWidth = element.bounding_box
			? Math.round(
					element.bounding_box.bottom_right.x - element.bounding_box.top_left.x,
				)
			: Width.get_fixed_unchecked(element.width);

		return new TableCell({
			children: cellChildren.length > 0 ? cellChildren : [new Paragraph({})],
			width: { size: ptToTwip(cellWidth), type: WidthType.DXA },
			borders: noBorders,
			margins: {
				top: ptToTwip(element.margin.top),
				bottom: ptToTwip(element.margin.bottom),
				left: ptToTwip(element.margin.left),
				right: ptToTwip(element.margin.right),
			},
		});
	});

	const tableWidth = row.bounding_box
		? Math.round(row.bounding_box.bottom_right.x - row.bounding_box.top_left.x)
		: Width.get_fixed_unchecked(row.width);

	return [
		new Table({
			rows: [new TableRow({ children: cells })],
			width: { size: ptToTwip(tableWidth), type: WidthType.DXA },
			layout: TableLayoutType.FIXED,
			borders: tableBorders,
		}),
	];
};

const renderStack = (stack: Layout.RenderedStack): BlockElement[] =>
	stack.elements.flatMap((el) => renderLayout(el as Layout.RenderedLayout));

export const renderLayout = (layout: Layout.RenderedLayout): BlockElement[] => {
	switch (layout.tag) {
		case "Elem":
			return renderElem(layout as Elem.t);
		case "Row":
			return renderRow(layout as Layout.RenderedRow);
		case "Stack":
			return renderStack(layout as Layout.RenderedStack);
		default: {
			const _exhaustive: never = layout;
			return _exhaustive;
		}
	}
};

export const render = async (
	props: BackendRenderProps,
): Promise<RenderResult> => {
	const {
		resume,
		data_schemas,
		layout_schemas,
		resume_layout,
		bindings,
		storage,
		fontDict,
	} = await resolveRenderInputs(props);

	const layouts = anyRender({
		layout_schemas,
		resume,
		data_schemas,
		resume_layout,
		bindings,
		storage,
		fontDict,
	});

	const children: BlockElement[] = layouts.flatMap((layout) =>
		renderLayout(layout),
	);

	const doc = new Document({
		sections: [
			{
				properties: {
					page: {
						size: {
							width: ptToTwip(resume_layout.width),
							height: ptToTwip(resume_layout.height),
						},
						margin: {
							top: ptToTwip(resume_layout.margin.top),
							bottom: ptToTwip(resume_layout.margin.bottom),
							left: ptToTwip(resume_layout.margin.left),
							right: ptToTwip(resume_layout.margin.right),
						},
					},
				},
				children,
			},
		],
	});

	return { blob: await Packer.toBlob(doc), fontDict };
};
