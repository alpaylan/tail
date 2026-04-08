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
	LineRuleType,
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
import * as Elem from "./Elem";
import * as Width from "./Width";

export type { RenderResult, BackendRenderProps as RenderProps };

const ptToHalfPt = (pt: number) => Math.round(pt * 2);
const ptToTwip = (pt: number) => Math.round(pt * 20);

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

const zeroCellMargins = {
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	marginUnitType: WidthType.DXA,
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

const spacerCell = (widthPt: number): TableCell =>
	new TableCell({
		children: [new Paragraph({})],
		width: { size: ptToTwip(widthPt), type: WidthType.DXA },
		borders: noBorders,
		margins: zeroCellMargins,
	});

const alignmentMap: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
	Left: AlignmentType.LEFT,
	Center: AlignmentType.CENTER,
	Right: AlignmentType.RIGHT,
	Justified: AlignmentType.JUSTIFIED,
};

// Render an Elem as one paragraph per line.
// Use Word's native alignment (Center/Right/Justified) instead of indent so that
// text gets the full cell width. Only use indent for Left-aligned text when the
// layout engine placed it at a non-zero x offset.
const renderElem = (elem: Elem.t): BlockElement[] => {
	if (!elem.spans?.length || elem.text === "") return [];

	const spans = elem.spans.filter(
		(s) => s.text !== "" && s.text !== "\n" && s.text !== "\n\n",
	);
	if (spans.length === 0) return [];

	const wordAlign = alignmentMap[elem.alignment] ?? AlignmentType.LEFT;
	const useNativeAlign = elem.alignment !== "Left";

	// Group spans by line
	const lineMap = new Map<number, Elem.Span[]>();
	for (const span of spans) {
		const line = span.line ?? 1;
		if (!lineMap.has(line)) lineMap.set(line, []);
		lineMap.get(line)!.push(span);
	}

	const paragraphs: Paragraph[] = [];
	const sortedLines = Array.from(lineMap.keys()).sort((a, b) => a - b);

	for (let i = 0; i < sortedLines.length; i++) {
		const lineSpans = lineMap.get(sortedLines[i])!;
		const runs = lineSpans.map(spanToRun);
		if (runs.length === 0) continue;

		// For non-Left alignment, let Word handle positioning (full cell width available).
		// For Left alignment, use span bbox offset as indent.
		const leftIndent = useNativeAlign
			? 0
			: (lineSpans[0]?.bbox?.top_left.x ?? 0);

		// Compute line height from span bbox (matches layout engine's Font.get_height)
		const lineHeight = lineSpans[0]?.bbox
			? lineSpans[0].bbox.bottom_right.y - lineSpans[0].bbox.top_left.y
			: undefined;

		paragraphs.push(
			new Paragraph({
				children: runs,
				alignment: wordAlign,
				spacing: {
					before: i === 0 ? ptToTwip(elem.margin.top) : 0,
					after:
						i === sortedLines.length - 1 ? ptToTwip(elem.margin.bottom) : 0,
					line: lineHeight ? ptToTwip(lineHeight) : undefined,
					lineRule: lineHeight ? LineRuleType.EXACTLY : undefined,
				},
				indent: leftIndent > 0 ? { left: ptToTwip(leftIndent) } : undefined,
			}),
		);
	}

	return paragraphs;
};

// Render a Row as a single-row table.
// Cell widths are derived from bounding box positions to capture exact spacing.
// The layout engine computes element positions including margins and alignment gaps,
// so we derive cell boundaries from the actual bbox positions within the row.
// Word's text metrics differ from fontkit's, so content cells need extra width.
// We take padding from spacer cells (alignment gaps) to keep total row width exact.
const CELL_PADDING_PT = 8;

type CellEntry = {
	tag: "spacer" | "content";
	widthPt: number;
	children?: BlockElement[];
};

const renderRow = (row: Layout.RenderedRow): BlockElement[] => {
	const rowLeft = row.bounding_box?.top_left.x ?? 0;
	const rowRight =
		row.bounding_box?.bottom_right.x ??
		rowLeft + Width.get_fixed_unchecked(row.width);
	const rowWidth = rowRight - rowLeft;
	const elements = row.elements as Layout.RenderedLayout[];

	// Phase 1: compute cell entries with raw widths
	const entries: CellEntry[] = [];
	let cursor = rowLeft;

	for (let i = 0; i < elements.length; i++) {
		const el = elements[i];
		const elLeft = el.bounding_box?.top_left.x ?? cursor;
		const elRight =
			el.bounding_box?.bottom_right.x ??
			elLeft + Width.get_fixed_unchecked(el.width);

		const gap = elLeft - el.margin.left - cursor;
		if (gap > 1) {
			entries.push({ tag: "spacer", widthPt: gap });
		}

		const cellWidth = el.margin.left + (elRight - elLeft) + el.margin.right;
		entries.push({
			tag: "content",
			widthPt: cellWidth,
			children: renderLayout(el),
		});

		cursor = elLeft - el.margin.left + cellWidth;
	}

	const trailing = rowRight - cursor;
	if (trailing > 1) {
		entries.push({ tag: "spacer", widthPt: trailing });
	}

	// Phase 2: redistribute padding from spacers to content cells
	const contentCount = entries.filter((e) => e.tag === "content").length;
	const spacerTotal = entries
		.filter((e) => e.tag === "spacer")
		.reduce((s, e) => s + e.widthPt, 0);
	const paddingPerCell = Math.min(
		CELL_PADDING_PT,
		spacerTotal / Math.max(contentCount, 1),
	);

	let spacerBudget = paddingPerCell * contentCount;
	for (const entry of entries) {
		if (entry.tag === "content") {
			entry.widthPt += paddingPerCell;
		}
	}
	for (const entry of entries) {
		if (entry.tag === "spacer" && spacerBudget > 0) {
			const take = Math.min(entry.widthPt - 1, spacerBudget);
			entry.widthPt -= take;
			spacerBudget -= take;
		}
	}

	// Phase 3: build cells
	const cells: TableCell[] = [];
	const columnWidths: number[] = [];

	for (const entry of entries) {
		const twip = ptToTwip(entry.widthPt);
		columnWidths.push(twip);
		if (entry.tag === "spacer") {
			cells.push(spacerCell(entry.widthPt));
		} else {
			const ch = entry.children!;
			cells.push(
				new TableCell({
					children: ch.length > 0 ? ch : [new Paragraph({})],
					width: { size: twip, type: WidthType.DXA },
					borders: noBorders,
					margins: zeroCellMargins,
				}),
			);
		}
	}

	return [
		new Table({
			rows: [new TableRow({ children: cells })],
			width: { size: ptToTwip(rowWidth), type: WidthType.DXA },
			columnWidths,
			layout: TableLayoutType.FIXED,
			borders: tableBorders,
			margins: zeroCellMargins,
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
