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
const AnyLayout_1 = require("./AnyLayout");
const Width = __importStar(require("./Width"));
const ptToHalfPt = (pt) => Math.round(pt * 2);
const ptToTwip = (pt) => Math.round(pt * 20);
const ALIGNMENT_MAP = {
    Left: docx_1.AlignmentType.LEFT,
    Center: docx_1.AlignmentType.CENTER,
    Right: docx_1.AlignmentType.RIGHT,
    Justified: docx_1.AlignmentType.JUSTIFIED,
};
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
const spanToRunOptions = (span) => {
    const font = span.font;
    return {
        text: span.text,
        bold: span.is_bold || (font === null || font === void 0 ? void 0 : font.weight) === "Bold",
        italics: span.is_italic || (font === null || font === void 0 ? void 0 : font.style) === "Italic",
        font: font === null || font === void 0 ? void 0 : font.name,
        size: font ? ptToHalfPt(font.size) : undefined,
        shading: span.is_code
            ? { type: docx_1.ShadingType.CLEAR, fill: "E0E0E0", color: "auto" }
            : undefined,
    };
};
const spanToRun = (span) => span.link
    ? new docx_1.ExternalHyperlink({
        link: span.link,
        children: [
            new docx_1.TextRun({ ...spanToRunOptions(span), style: "Hyperlink" }),
        ],
    })
    : new docx_1.TextRun(spanToRunOptions(span));
const renderElem = (elem) => {
    var _a, _b;
    if (!((_a = elem.spans) === null || _a === void 0 ? void 0 : _a.length) || elem.text === "")
        return [];
    const spans = elem.spans.filter((s) => s.text !== "\n" && s.text !== "\n\n");
    if (spans.length === 0)
        return [];
    // Group spans by line number
    const lineMap = new Map();
    for (const span of spans) {
        const line = (_b = span.line) !== null && _b !== void 0 ? _b : 1;
        if (!lineMap.has(line))
            lineMap.set(line, []);
        lineMap.get(line).push(span);
    }
    const children = [];
    const sortedLines = Array.from(lineMap.keys()).sort((a, b) => a - b);
    for (let i = 0; i < sortedLines.length; i++) {
        if (i > 0)
            children.push(new docx_1.TextRun({ break: 1 }));
        for (const span of lineMap.get(sortedLines[i])) {
            if (span.text !== "")
                children.push(spanToRun(span));
        }
    }
    if (children.length === 0)
        return [];
    return [
        new docx_1.Paragraph({
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
const renderRow = (row) => {
    const cells = row.elements.map((el) => {
        const element = el;
        const cellChildren = (0, exports.renderLayout)(element);
        const cellWidth = element.bounding_box
            ? Math.round(element.bounding_box.bottom_right.x - element.bounding_box.top_left.x)
            : Width.get_fixed_unchecked(element.width);
        return new docx_1.TableCell({
            children: cellChildren.length > 0 ? cellChildren : [new docx_1.Paragraph({})],
            width: { size: ptToTwip(cellWidth), type: docx_1.WidthType.DXA },
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
        new docx_1.Table({
            rows: [new docx_1.TableRow({ children: cells })],
            width: { size: ptToTwip(tableWidth), type: docx_1.WidthType.DXA },
            layout: docx_1.TableLayoutType.FIXED,
            borders: tableBorders,
        }),
    ];
};
const renderStack = (stack) => stack.elements.flatMap((el) => (0, exports.renderLayout)(el));
const renderLayout = (layout) => {
    switch (layout.tag) {
        case "Elem":
            return renderElem(layout);
        case "Row":
            return renderRow(layout);
        case "Stack":
            return renderStack(layout);
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
    const children = layouts.flatMap((layout) => (0, exports.renderLayout)(layout));
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
