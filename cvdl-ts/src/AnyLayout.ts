/* eslint-disable */
import { Box } from "./Box";
import { DataSchema } from "./DataSchema";
import { Elem } from "./Layout";
import { LayoutSchema } from "./LayoutSchema";
import { LocalStorage } from "./LocalStorage";
import { Resume } from "./Resume";
import { vertical_margin, ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";

import * as fontkit from 'fontkit';

export type ElementPath = {
    tag: 'none',
} | {
    tag: 'section',
    section: string
} | {
    tag: 'item',
    section: string,
    item: number
} | {
    tag: 'field',
    section: string,
    item: number,
    field: string,
}

export class ElementBox {
    bounding_box: Box;
    elements: [Box, Elem][];
    path?: ElementPath;

    constructor(bounding_box: Box, elements: [Box, Elem][]) {
        this.bounding_box = bounding_box;
        this.elements = elements;
        this.path = { tag: 'none' };
    }

    move_y_by(y: number): ElementBox {
        this.bounding_box = this.bounding_box.move_y_by(y);
        this.elements = this
            .elements
            .map(([b, e]) => ([b.move_y_by(y), e]));
        return this;
    }

    move_x_by(x: number): ElementBox {
        this.bounding_box = this.bounding_box.move_x_by(x);
        this.elements = this
            .elements
            .map(([b, e]) => ([b.move_x_by(x), e]));
        return this;
    }
}

export type RenderProps = {
    resume: Resume,
    layout_schemas: LayoutSchema[],
    data_schemas: DataSchema[],
    resume_layout: ResumeLayout,
    storage: LocalStorage,
    fontDict?: FontDict
}

export class FontDict {
    fonts: Map<string, fontkit.Font>;

    constructor() {
        this.fonts = new Map();
    }

    
    async load_fonts_from_schema(schema: LayoutSchema, storage: LocalStorage) {
        for (const font of schema.fonts()) {
            console.log(`Loading font ${font.full_name()}`);
            if (this.fonts.has(font.full_name())) {
                console.log(`Font ${font.full_name()} is already loaded`);
                continue;
            }
            const font_data = await storage.load_font(font);
            const fontkit_font = fontkit.create(font_data);
            this.fonts.set(font.full_name(), fontkit_font);
        }
    }

    get_font(name: string) {
        const font = this.fonts.get(name);
        if (font === undefined) {
            throw new Error(`Could not find font ${name}`);
        }
        return font;
    }
}

export async function render({ resume, layout_schemas, data_schemas, resume_layout, storage, fontDict }: RenderProps): Promise<[FontDict, ElementBox[][]]> {
    // Each box contains a set of elements(positioned by 0x0 and projected into its bounding box)
    const boxes: ElementBox[] = [];
    const font_dict = fontDict ?? new FontDict();

    // Compute the total usable width by subtracting the margins from the document width
    const width = resume_layout.width - (resume_layout.margin.left + resume_layout.margin.right);

    // If the resume is double column, then the usable width is halved
    const column_width = resume_layout.column_type.tag === "SingleColumn"
        ? width
        : (width - vertical_margin(resume_layout.column_type) / 2.0);

    for (const section of resume.sections) {
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
        const result = layout_schema
            .header_layout_schema
            .copy()
            .instantiate(section.data)
            .normalize(column_width, font_dict)
            .compute_boxes(font_dict);
        end_time = Date.now();
        console.info(`Header rendering time: ${end_time - start_time}ms for section ${section.section_name}`);
        result.path = {
            tag: 'section',
            section: section.section_name
        }
        boxes.push(result);

        start_time = Date.now();
        // Render Section Items
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // @ts-nocheck
        for (const [index, item] of section.items.entries()) {
            console.log("Computing item");
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
                .find((s) => s.schema_name == section.data_schema)
            // 3. Render the item
            const result = layout_schema
                .item_layout_schema
                .copy()
                .instantiate(item.fields)
                .normalize(column_width, font_dict)
                .compute_boxes(font_dict);
            result.path = {
                tag: 'item',
                section: section.section_name,
                item: index
            };
            boxes.push(result);
        }
        end_time = Date.now();
        console.info(`Item rendering time: ${end_time - start_time}ms for section ${section.section_name}`);
    }
    
    let current_y = resume_layout.margin.top;
    let current_x = resume_layout.margin.left;

    const pages: ElementBox[][] = []
    pages.push([]);

    for (const box of boxes) {
        if (current_y + box.bounding_box.height() > resume_layout.height) {
            current_y = resume_layout.margin.top;
            current_x += column_width + vertical_margin(resume_layout.column_type);
            if (current_x > width) {
                pages.push([]);
                current_x = resume_layout.margin.left;
            }
        }
        pages[pages.length - 1].push(box.move_y_by(current_y).move_x_by(current_x));
        current_y += box.bounding_box.height();
    }

    console.log("Position calculations are completed.");

    return [font_dict, pages];
}
