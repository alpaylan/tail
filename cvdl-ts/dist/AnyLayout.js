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
exports.render = exports.FontDict = void 0;
const ResumeLayout_1 = require("./ResumeLayout");
const fontkit = __importStar(require("fontkit"));
const _1 = require(".");
class FontDict {
    constructor() {
        this.fonts = new Map();
    }
    async load_fonts_from_schema(schema, storage) {
        for (const font of schema.fonts()) {
            const fontName = _1.Font.full_name(font);
            console.log(`Loading font ${fontName}`);
            if (this.fonts.has(fontName)) {
                console.log(`Font ${fontName} is already loaded`);
                continue;
            }
            const font_data = await storage.load_font(font);
            const fontkit_font = fontkit.create(font_data);
            this.fonts.set(fontName, fontkit_font);
        }
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
async function render({ resume, layout_schemas, data_schemas, resume_layout, storage, fontDict }) {
    // Each box contains a set of elements(positioned by 0x0 and projected into its bounding box)
    const font_dict = fontDict !== null && fontDict !== void 0 ? fontDict : new FontDict();
    // Compute the total usable width by subtracting the margins from the document width
    const width = resume_layout.width - (resume_layout.margin.left + resume_layout.margin.right);
    // If the resume is double column, then the usable width is halved
    const column_width = resume_layout.column_type.tag === "SingleColumn"
        ? width
        : (width - (0, ResumeLayout_1.vertical_margin)(resume_layout.column_type) / 2.0);
    const layouts = [];
    console.error("Rendering sections...");
    for (const section of resume.sections) {
        console.error("Print section:", section);
        // Render Section Header
        // 1. Find the layout schema for the section
        console.info("Computing section: ", section.section_name);
        const layout_schema = layout_schemas
            .find(s => s.schema_name === section.layout_schema);
        if (layout_schema === undefined) {
            throw new Error(`Could not find layout schema ${section.layout_schema}`);
        }
        let start_time = Date.now();
        await font_dict.load_fonts_from_schema(layout_schema, storage);
        let end_time = Date.now();
        console.info(`Font loading time: ${end_time - start_time}ms for section ${section.section_name}`);
        // 2. Find the data schema for the section
        const _data_schema = data_schemas.find(s => s.schema_name === section.data_schema);
        if (_data_schema === undefined) {
            throw new Error(`Could not find data schema ${section.data_schema}`);
        }
        start_time = Date.now();
        // 3. Render the header
        const layout = _1.Layout.computeBoxes(_1.Layout.normalize(_1.Layout.instantiate(layout_schema.header_layout_schema, section.data), column_width, font_dict), font_dict);
        console.error("Header is computed");
        layouts.push(layout);
        end_time = Date.now();
        console.info(`Header rendering time: ${end_time - start_time}ms for section ${section.section_name}`);
        start_time = Date.now();
        // Render Section Items
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // @ts-nocheck
        for (const [index, item] of section.items.entries()) {
            console.log("Computing item");
            console.error("Item:", item);
            // 1. Find the layout schema for the section
            const layout_schema = layout_schemas
                .find((s) => s.schema_name == section.layout_schema);
            if (layout_schema == undefined) {
                throw new Error(`Could not find layout schema ${section.layout_schema}`);
            }
            await font_dict.load_fonts_from_schema(layout_schema, storage);
            console.log("Fonts are loaded");
            // 2. Find the data schema for the section
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _data_schema = data_schemas
                .find((s) => s.schema_name == section.data_schema);
            // 3. Render the item
            const layout = _1.Layout.computeBoxes(_1.Layout.normalize(_1.Layout.instantiate(layout_schema.item_layout_schema, item.fields), column_width, font_dict), font_dict);
            layouts.push(layout);
        }
        end_time = Date.now();
        console.info(`Item rendering time: ${end_time - start_time}ms for section ${section.section_name}`);
    }
    console.log("Position calculations are completed.");
    return [font_dict, layouts];
}
exports.render = render;
