"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = exports.renderLayout = void 0;
const docx_1 = require("docx");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const AnyLayout_1 = require("./AnyLayout");
const Width = __importStar(require("./Width"));
const ptToHalfPt = (pt) => Math.round(pt * 2);
const ptToTwip = (pt) => Math.round(pt * 20);
const DOCX_CONTAINER_INDENT_MAX_PT = 18;
const SPACER_LINE_TWIP = 1;
const noBorder = { style: docx_1.BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = {
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
    marginUnitType: docx_1.WidthType.DXA,
};
const defaultRenderContext = {
    containerIndentPt: 0,
    beforePt: 0,
    afterPt: 0,
};
const emojiAssetCache = new Map();
const semanticContainerIndentPt = (leftPt) => Math.min(Math.max(leftPt, 0), DOCX_CONTAINER_INDENT_MAX_PT);
const isNodeFsAvailable = () => typeof fs.existsSync === "function" && typeof fs.readFileSync === "function";
const getEmojiAssetType = (emojiUrl) => {
    const lowered = emojiUrl.toLowerCase();
    if (lowered.endsWith(".jpg") || lowered.endsWith(".jpeg"))
        return "jpg";
    if (lowered.endsWith(".png"))
        return "png";
    if (lowered.endsWith(".gif"))
        return "gif";
    if (lowered.endsWith(".bmp"))
        return "bmp";
    return null;
};
const getEmojiAssetDirs = () => [
    path.resolve(__dirname, "..", "..", "cvdl-editor", "fe", "public"),
    path.resolve(__dirname, "..", "assets"),
    path.resolve(__dirname, "..", "..", "node_modules", "fe2", "public"),
];
const loadEmojiAssetFromNodeFs = (emojiUrl) => {
    if (!isNodeFsAvailable())
        return null;
    const normalized = emojiUrl.replace(/^[/\\]+/, "");
    const candidates = path.isAbsolute(normalized)
        ? [normalized]
        : getEmojiAssetDirs().map((dir) => path.join(dir, normalized));
    for (const candidate of candidates) {
        if (!fs.existsSync(candidate))
            continue;
        const type = getEmojiAssetType(candidate);
        if (!type)
            continue;
        return { data: new Uint8Array(fs.readFileSync(candidate)), type };
    }
    return null;
};
const loadEmojiAssetFromBrowser = async (emojiUrl) => {
    if (typeof fetch !== "function")
        return null;
    const type = getEmojiAssetType(emojiUrl);
    if (!type)
        return null;
    const resolvedUrl = typeof window !== "undefined"
        ? new URL(emojiUrl, window.location.href).toString()
        : emojiUrl;
    const response = await fetch(resolvedUrl);
    if (!response.ok)
        return null;
    return {
        data: new Uint8Array(await response.arrayBuffer()),
        type,
    };
};
const resolveEmojiAsset = async (emojiUrl) => {
    var _a;
    if (!emojiUrl)
        return null;
    if (emojiAssetCache.has(emojiUrl)) {
        return (_a = emojiAssetCache.get(emojiUrl)) !== null && _a !== void 0 ? _a : null;
    }
    const assetPromise = (async () => {
        const nodeAsset = loadEmojiAssetFromNodeFs(emojiUrl);
        if (nodeAsset)
            return nodeAsset;
        return loadEmojiAssetFromBrowser(emojiUrl);
    })();
    emojiAssetCache.set(emojiUrl, assetPromise);
    return assetPromise;
};
const emojiFallbackText = (emojiUrl) => {
    if (!emojiUrl)
        return "";
    const normalized = emojiUrl.replace(/^.*[\\/]/, "");
    const basename = normalized.replace(/\.[^.]+$/, "");
    return `:${basename}:`;
};
const spanToRunOptions = (span, text = span.text) => {
    const font = span.font;
    return {
        text,
        bold: span.is_bold || (font === null || font === void 0 ? void 0 : font.weight) === "Bold",
        italics: span.is_italic || (font === null || font === void 0 ? void 0 : font.style) === "Italic",
        font: font === null || font === void 0 ? void 0 : font.name,
        size: font ? ptToHalfPt(font.size) : undefined,
        shading: span.is_code
            ? { type: docx_1.ShadingType.CLEAR, fill: "E0E0E0", color: "auto" }
            : undefined,
    };
};
const spanToRun = async (span) => {
    var _a, _b;
    if (span.is_emoji && span.emoji_url) {
        const asset = await resolveEmojiAsset(span.emoji_url);
        if (asset) {
            const size = Math.max(1, Math.round(((_b = (_a = span.font) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 12) * 1.2));
            return new docx_1.ImageRun({
                type: asset.type,
                data: asset.data,
                transformation: { width: size, height: size },
            });
        }
        return new docx_1.TextRun(spanToRunOptions(span, emojiFallbackText(span.emoji_url)));
    }
    return span.link
        ? new docx_1.ExternalHyperlink({
            link: span.link,
            children: [
                new docx_1.TextRun({ ...spanToRunOptions(span), style: "Hyperlink" }),
            ],
        })
        : new docx_1.TextRun(spanToRunOptions(span));
};
const spacerCell = (widthPt) => new docx_1.TableCell({
    children: [new docx_1.Paragraph({})],
    width: { size: ptToTwip(widthPt), type: docx_1.WidthType.DXA },
    borders: noBorders,
    margins: zeroCellMargins,
});
const alignmentMap = {
    Left: docx_1.AlignmentType.LEFT,
    Center: docx_1.AlignmentType.CENTER,
    Right: docx_1.AlignmentType.RIGHT,
    Justified: docx_1.AlignmentType.JUSTIFIED,
};
// Render an Elem as one paragraph per line.
// Use Word's native alignment (Center/Right/Justified) instead of indent so that
// text gets the full cell width. Only use indent for Left-aligned text when the
// layout engine placed it at a non-zero x offset.
const renderElem = async (elem, context = defaultRenderContext) => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!((_a = elem.spans) === null || _a === void 0 ? void 0 : _a.length) || elem.text === "")
        return [];
    const spans = elem.spans.filter((s) => s.text !== "" && s.text !== "\n" && s.text !== "\n\n");
    if (spans.length === 0)
        return [];
    const wordAlign = (_b = alignmentMap[elem.alignment]) !== null && _b !== void 0 ? _b : docx_1.AlignmentType.LEFT;
    const useNativeAlign = elem.alignment !== "Left";
    // Group spans by line
    const lineMap = new Map();
    for (const span of spans) {
        const line = (_c = span.line) !== null && _c !== void 0 ? _c : 1;
        if (!lineMap.has(line))
            lineMap.set(line, []);
        lineMap.get(line).push(span);
    }
    const paragraphs = [];
    const sortedLines = Array.from(lineMap.keys()).sort((a, b) => a - b);
    for (let i = 0; i < sortedLines.length; i++) {
        const lineSpans = lineMap.get(sortedLines[i]);
        const runs = await Promise.all(lineSpans.map(spanToRun));
        if (runs.length === 0)
            continue;
        // For non-Left alignment, let Word handle positioning (full cell width available).
        // For Left alignment, use span bbox offset as indent.
        const leftIndent = useNativeAlign
            ? 0
            : ((_f = (_e = (_d = lineSpans[0]) === null || _d === void 0 ? void 0 : _d.bbox) === null || _e === void 0 ? void 0 : _e.top_left.x) !== null && _f !== void 0 ? _f : 0) + context.containerIndentPt;
        // Compute line height from span bbox (matches layout engine's Font.get_height)
        const lineHeight = ((_g = lineSpans[0]) === null || _g === void 0 ? void 0 : _g.bbox)
            ? lineSpans[0].bbox.bottom_right.y - lineSpans[0].bbox.top_left.y
            : undefined;
        paragraphs.push(new docx_1.Paragraph({
            children: runs,
            alignment: wordAlign,
            spacing: {
                before: i === 0 ? ptToTwip(elem.margin.top + context.beforePt) : 0,
                after: i === sortedLines.length - 1
                    ? ptToTwip(elem.margin.bottom + context.afterPt)
                    : 0,
                line: lineHeight ? ptToTwip(lineHeight) : undefined,
                lineRule: lineHeight ? docx_1.LineRuleType.EXACTLY : undefined,
            },
            indent: leftIndent > 0 ? { left: ptToTwip(leftIndent) } : undefined,
        }));
    }
    return paragraphs;
};
const spacerParagraph = (heightPt) => new docx_1.Paragraph({
    children: [],
    spacing: {
        line: SPACER_LINE_TWIP,
        lineRule: docx_1.LineRuleType.EXACTLY,
        after: ptToTwip(heightPt),
    },
});
const withVerticalSpacing = (blocks, beforePt, afterPt) => {
    const spaced = [];
    if (beforePt > 0)
        spaced.push(spacerParagraph(beforePt));
    spaced.push(...blocks);
    if (afterPt > 0)
        spaced.push(spacerParagraph(afterPt));
    return spaced;
};
// Render a Row as a single-row table.
// Cell widths are derived from bounding box positions to capture exact spacing.
// The layout engine computes element positions including margins and alignment gaps,
// so we derive cell boundaries from the actual bbox positions within the row.
// Word's text metrics differ from fontkit's, so content cells need extra width.
// We take padding from spacer cells (alignment gaps) to keep total row width exact.
const CELL_PADDING_PT = 8;
const renderRow = async (row, context = defaultRenderContext) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const rowLeft = (_b = (_a = row.bounding_box) === null || _a === void 0 ? void 0 : _a.top_left.x) !== null && _b !== void 0 ? _b : 0;
    const rowRight = (_d = (_c = row.bounding_box) === null || _c === void 0 ? void 0 : _c.bottom_right.x) !== null && _d !== void 0 ? _d : rowLeft + Width.get_fixed_unchecked(row.width);
    const rowWidth = rowRight - rowLeft;
    const elements = row.elements;
    // Phase 1: compute cell entries with raw widths
    const entries = [];
    let cursor = rowLeft;
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const elLeft = (_f = (_e = el.bounding_box) === null || _e === void 0 ? void 0 : _e.top_left.x) !== null && _f !== void 0 ? _f : cursor;
        const elRight = (_h = (_g = el.bounding_box) === null || _g === void 0 ? void 0 : _g.bottom_right.x) !== null && _h !== void 0 ? _h : elLeft + Width.get_fixed_unchecked(el.width);
        const gap = elLeft - el.margin.left - cursor;
        if (gap > 1) {
            entries.push({ tag: "spacer", widthPt: gap });
        }
        const cellWidth = el.margin.left + (elRight - elLeft) + el.margin.right;
        entries.push({
            tag: "content",
            widthPt: cellWidth,
            children: await (0, exports.renderLayout)(el, defaultRenderContext),
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
    const paddingPerCell = Math.min(CELL_PADDING_PT, spacerTotal / Math.max(contentCount, 1));
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
    const cells = [];
    const columnWidths = [];
    for (const entry of entries) {
        const twip = ptToTwip(entry.widthPt);
        columnWidths.push(twip);
        if (entry.tag === "spacer") {
            cells.push(spacerCell(entry.widthPt));
        }
        else {
            const ch = entry.children;
            cells.push(new docx_1.TableCell({
                children: ch.length > 0 ? ch : [new docx_1.Paragraph({})],
                width: { size: twip, type: docx_1.WidthType.DXA },
                borders: noBorders,
                margins: zeroCellMargins,
            }));
        }
    }
    const rowBlocks = [
        new docx_1.Table({
            rows: [new docx_1.TableRow({ children: cells })],
            width: { size: ptToTwip(rowWidth), type: docx_1.WidthType.DXA },
            columnWidths,
            layout: docx_1.TableLayoutType.FIXED,
            borders: tableBorders,
            margins: zeroCellMargins,
            indent: context.containerIndentPt > 0
                ? { size: ptToTwip(context.containerIndentPt), type: docx_1.WidthType.DXA }
                : undefined,
        }),
    ];
    return withVerticalSpacing(rowBlocks, row.margin.top + context.beforePt, row.margin.bottom + context.afterPt);
};
const renderStack = async (stack, context = defaultRenderContext) => {
    const inheritedIndentPt = context.containerIndentPt + semanticContainerIndentPt(stack.margin.left);
    const rendered = await Promise.all(stack.elements.map((el, index, elements) => (0, exports.renderLayout)(el, {
        containerIndentPt: inheritedIndentPt,
        beforePt: index === 0 ? context.beforePt + stack.margin.top : 0,
        afterPt: index === elements.length - 1
            ? context.afterPt + stack.margin.bottom
            : 0,
    })));
    return rendered.flat();
};
const renderLayout = async (layout, context = defaultRenderContext) => {
    switch (layout.tag) {
        case "Elem":
            return renderElem(layout, context);
        case "Row":
            return renderRow(layout, {
                containerIndentPt: context.containerIndentPt +
                    semanticContainerIndentPt(layout.margin.left),
                beforePt: context.beforePt,
                afterPt: context.afterPt,
            });
        case "Stack":
            return renderStack(layout, context);
        default: {
            const _exhaustive = layout;
            return _exhaustive;
        }
    }
};
exports.renderLayout = renderLayout;
const render = async (props) => {
    const { resume, data_schemas, layout_schemas, resume_layout, bindings, storage, fontDict, } = await (0, AnyLayout_1.resolveRenderInputs)(props);
    const layouts = (0, AnyLayout_1.render)({
        layout_schemas,
        resume,
        data_schemas,
        resume_layout,
        bindings,
        storage,
        fontDict,
    });
    const children = (await Promise.all(layouts.map((layout) => (0, exports.renderLayout)(layout)))).flat();
    const doc = new docx_1.Document({
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
    return { blob: await docx_1.Packer.toBlob(doc), fontDict };
};
exports.render = render;
