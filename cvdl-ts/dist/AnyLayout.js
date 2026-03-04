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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontDict = void 0;
exports.resetIncrementalCaches = resetIncrementalCaches;
exports.render = render;
const ResumeLayout_1 = require("./ResumeLayout");
const fontkit = __importStar(require("fontkit"));
const Layout = __importStar(require("./Layout"));
const blockCache = new Map();
let flowPlacementCache = {
    order: [],
    signatures: [],
    offsets: [],
    heights: [],
};
const stableBindingsSignature = (bindings) => {
    const sortedEntries = Array.from(bindings.entries()).sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(sortedEntries);
};
const stableSignature = (value) => {
    try {
        return JSON.stringify(value);
    }
    catch {
        return String(value);
    }
};
const getOrComputeBlock = (key, signature, compute, stats) => {
    const cached = blockCache.get(key);
    if (cached && cached.signature === signature) {
        stats.hits += 1;
        return cached.layout;
    }
    const layout = compute();
    blockCache.set(key, { signature, layout });
    stats.misses += 1;
    return layout;
};
function resetIncrementalCaches() {
    blockCache.clear();
    flowPlacementCache = {
        order: [],
        signatures: [],
        offsets: [],
        heights: [],
    };
}
const cartesian = (...a) => a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
class FontDict {
    constructor() {
        this.fonts = new Map();
    }
    async load_fonts(storage) {
        const variants = cartesian(["Exo", "OpenSans", "SourceCodePro"], ["Medium", "Bold"], ["", "Italic"]);
        await Promise.all(variants.map(async ([name, weight, style]) => {
            const fontName = `${name}-${weight}${style}`;
            if (this.fonts.has(fontName)) {
                console.log(`Font ${fontName} is already loaded`);
                return;
            }
            const font_data = await storage.load_font(fontName);
            const fontkit_font = fontkit.create(font_data);
            this.fonts.set(fontName, fontkit_font);
        }));
        return this;
    }
    get_font(name) {
        const font = this.fonts.get(name);
        if (font === undefined) {
            throw new Error(`Could not find font ${name}`);
        }
        return font;
    }
}
exports.FontDict = FontDict;
function render({ resume, layout_schemas, data_schemas, resume_layout, bindings, fontDict, incremental = true, }) {
    var _a;
    // Compute the total usable width by subtracting the margins from the document width
    const width = resume_layout.width -
        (resume_layout.margin.left + resume_layout.margin.right);
    // If the resume is double column, then the usable width is halved
    const column_width = resume_layout.column_type.tag === "SingleColumn"
        ? width
        : width - (0, ResumeLayout_1.vertical_margin)(resume_layout.column_type) / 2.0;
    const layouts = [];
    const usedKeys = new Set();
    const stats = { hits: 0, misses: 0 };
    const blockOrder = [];
    const blockSignatures = [];
    const blockHeights = [];
    const bindingsSignature = stableBindingsSignature(bindings);
    const fontSignature = stableSignature(Array.from(fontDict.fonts.keys()).sort());
    let firstDirtyBlock = incremental ? -1 : 0;
    console.info("Rendering sections...");
    for (const section of resume.sections) {
        // Render Section Header
        // 1. Find the layout schema for the section
        console.info("Computing section: ", section.section_name);
        const layout_schema = layout_schemas.find((s) => s.schema_name === section.layout_schema);
        if (layout_schema === undefined) {
            throw new Error(`Could not find layout schema ${section.layout_schema}`);
        }
        let start_time = Date.now();
        // await fontDict.load_fonts_from_schema(layout_schema, storage);
        let end_time = Date.now();
        console.info(`Font loading time: ${end_time - start_time}ms for section ${section.section_name}`);
        // 2. Find the data schema for the section
        const data_schema = data_schemas.find((s) => s.schema_name === section.data_schema);
        if (data_schema === undefined) {
            throw new Error(`Could not find data schema ${section.data_schema}`);
        }
        start_time = Date.now();
        // 3. Render the header
        const headerKey = `${section.section_name}::header`;
        const headerSignature = stableSignature({
            column_width,
            fontSignature,
            bindingsSignature,
            layout: layout_schema.header_layout_schema,
            fields: data_schema.header_schema,
            data: section.data,
        });
        usedKeys.add(headerKey);
        const blockIndex = blockOrder.length;
        blockOrder.push(headerKey);
        blockSignatures.push(headerSignature);
        if (incremental &&
            firstDirtyBlock === -1 &&
            (flowPlacementCache.order[blockIndex] !== headerKey ||
                flowPlacementCache.signatures[blockIndex] !== headerSignature)) {
            firstDirtyBlock = blockIndex;
        }
        const layout = incremental
            ? getOrComputeBlock(headerKey, headerSignature, () => Layout.computeBoxes(Layout.normalize(Layout.instantiate(layout_schema.header_layout_schema, section.data, data_schema.header_schema, bindings), column_width, fontDict), fontDict), stats)
            : (() => {
                stats.misses += 1;
                return Layout.computeBoxes(Layout.normalize(Layout.instantiate(layout_schema.header_layout_schema, section.data, data_schema.header_schema, bindings), column_width, fontDict), fontDict);
            })();
        layout.path = { tag: "section", section: section.section_name };
        blockHeights.push(layout.bounding_box.height() + layout.margin.top + layout.margin.bottom);
        console.info("Header is computed");
        layouts.push(layout);
        end_time = Date.now();
        console.info(`Header rendering time: ${end_time - start_time}ms for section ${section.section_name}`);
        start_time = Date.now();
        // Render Section Items
        for (const [index, item] of section.items.entries()) {
            const itemKey = `${section.section_name}::item::${(_a = item.id) !== null && _a !== void 0 ? _a : index}`;
            const itemSignature = stableSignature({
                column_width,
                fontSignature,
                bindingsSignature,
                layout: layout_schema.item_layout_schema,
                fields: data_schema.item_schema,
                data: item,
            });
            usedKeys.add(itemKey);
            const blockIndex = blockOrder.length;
            blockOrder.push(itemKey);
            blockSignatures.push(itemSignature);
            if (incremental &&
                firstDirtyBlock === -1 &&
                (flowPlacementCache.order[blockIndex] !== itemKey ||
                    flowPlacementCache.signatures[blockIndex] !== itemSignature)) {
                firstDirtyBlock = blockIndex;
            }
            const layout = incremental
                ? getOrComputeBlock(itemKey, itemSignature, () => Layout.computeBoxes(Layout.normalize(Layout.instantiate(layout_schema.item_layout_schema, item, data_schema.item_schema, bindings), column_width, fontDict), fontDict), stats)
                : (() => {
                    stats.misses += 1;
                    return Layout.computeBoxes(Layout.normalize(Layout.instantiate(layout_schema.item_layout_schema, item, data_schema.item_schema, bindings), column_width, fontDict), fontDict);
                })();
            layout.path = { tag: "item", section: section.section_name, item: index };
            blockHeights.push(layout.bounding_box.height() + layout.margin.top + layout.margin.bottom);
            layouts.push(layout);
        }
        end_time = Date.now();
        console.info(`Item rendering time: ${end_time - start_time}ms for section ${section.section_name}`);
    }
    const hasSameBlockShape = flowPlacementCache.order.length === blockOrder.length &&
        firstDirtyBlock === -1;
    if (!incremental || !hasSameBlockShape) {
        if (firstDirtyBlock === -1) {
            firstDirtyBlock = Math.min(blockOrder.length, flowPlacementCache.order.length);
        }
    }
    const offsets = new Array(blockOrder.length).fill(0);
    if (incremental && firstDirtyBlock > 0) {
        for (let i = 0; i < firstDirtyBlock; i++) {
            offsets[i] = flowPlacementCache.offsets[i];
        }
    }
    if (!incremental || firstDirtyBlock !== -1) {
        const start = !incremental ? 0 : Math.max(0, firstDirtyBlock);
        let cursor = start === 0 ? 0 : offsets[start - 1] + blockHeights[start - 1];
        for (let i = start; i < blockOrder.length; i++) {
            offsets[i] = cursor;
            cursor += blockHeights[i];
        }
    }
    else {
        for (let i = 0; i < blockOrder.length; i++) {
            offsets[i] = flowPlacementCache.offsets[i];
        }
    }
    for (let i = 0; i < layouts.length; i++) {
        layouts[i].flow_offset_y = offsets[i];
    }
    if (incremental) {
        for (const key of Array.from(blockCache.keys())) {
            if (!usedKeys.has(key)) {
                blockCache.delete(key);
            }
        }
        flowPlacementCache = {
            order: blockOrder,
            signatures: blockSignatures,
            offsets,
            heights: blockHeights,
        };
        console.info(`Incremental block cache: ${stats.hits} hit(s), ${stats.misses} miss(es), firstDirtyBlock=${firstDirtyBlock}, size=${blockCache.size}`);
    }
    else {
        console.info(`Full render mode: ${stats.misses} block(s) recomputed`);
    }
    console.log("Position calculations are completed.");
    return layouts;
}
