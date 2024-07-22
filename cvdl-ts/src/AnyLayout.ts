import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import { Storage } from "./Storage";
import { vertical_margin, ResumeLayout } from "./ResumeLayout";
import * as Utils from "./Utils";

import * as fontkit from "fontkit";
import * as Layout from "./Layout";
import * as Resume from "./Resume";

export type ElementPath =
	| {
		tag: "none";
	}
	| {
		tag: "section";
		section: string;
	}
	| {
		tag: "item";
		section: string;
		item: number;
	}
	| {
		tag: "field";
		section: string;
		item: number;
		field: string;
	};

export type RenderProps = {
	resume: Resume.t;
	layout_schemas: LayoutSchema[];
	data_schemas: DataSchema.t[];
	resume_layout: ResumeLayout;
	bindings: Map<string, unknown>;
	storage: Storage;
	fontDict?: FontDict;
};

const cartesian =
	(...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

export class FontDict {
	fonts: Map<string, fontkit.Font>;

	constructor() {
		this.fonts = new Map();
	}

	async load_fonts(storage: Storage) {
		const variants = cartesian(["Exo", "OpenSans", "SourceCodePro"], ["Medium", "Bold"], ["", "Italic"]);

		await Promise.all(
			variants.map(async ([name, weight, style]) => {
				const fontName = `${name}-${weight}${style}`;
				console.error(`Loading font ${fontName}`);
				if (this.fonts.has(fontName)) {
					console.log(`Font ${fontName} is already loaded`);
					return;
				}
				const font_data = await storage.load_font(fontName);
				const fontkit_font = fontkit.create(font_data);
				this.fonts.set(fontName, fontkit_font as fontkit.Font);
			}));
		
		return this;
	}

	get_font(name: string) {
		const font = this.fonts.get(name);
		if (font === undefined) {
			throw new Error(`Could not find font ${name}`);
		}
		return font;
	}
}

export async function render({
	resume,
	layout_schemas,
	data_schemas,
	resume_layout,
	bindings,
	fontDict,
}: RenderProps): Promise<Layout.RenderedLayout[]> {
	// Compute the total usable width by subtracting the margins from the document width
	const width =
		resume_layout.width -
		(resume_layout.margin.left + resume_layout.margin.right);

	// If the resume is double column, then the usable width is halved
	const column_width =
		resume_layout.column_type.tag === "SingleColumn"
			? width
			: width - vertical_margin(resume_layout.column_type) / 2.0;

	const layouts = [];
	console.error("Rendering sections...");
	for (const section of resume.sections) {
		// Render Section Header
		// 1. Find the layout schema for the section
		console.info("Computing section: ", section.section_name);

		const layout_schema = layout_schemas.find(
			(s) => s.schema_name === section.layout_schema,
		);

		if (layout_schema === undefined) {
			throw new Error(`Could not find layout schema ${section.layout_schema}`);
		}
		let start_time = Date.now();
		// await fontDict.load_fonts_from_schema(layout_schema, storage);
		let end_time = Date.now();
		console.info(
			`Font loading time: ${end_time - start_time}ms for section ${section.section_name}`,
		);
		// 2. Find the data schema for the section
		const data_schema = data_schemas.find(
			(s) => s.schema_name === section.data_schema,
		);

		if (data_schema === undefined) {
			throw new Error(`Could not find data schema ${section.data_schema}`);
		}

		start_time = Date.now();
		// 3. Render the header
		const layout = Layout.computeBoxes(
			Layout.normalize(
				Layout.instantiate(
					layout_schema.header_layout_schema,
					section.data,
					data_schema.header_schema,
					bindings
				),
				column_width,
				fontDict,
			),
			fontDict,
		);
		layout.path = { tag: "section", section: section.section_name };

		console.info("Header is computed");
		layouts.push(layout);
		end_time = Date.now();
		console.info(
			`Header rendering time: ${end_time - start_time}ms for section ${section.section_name}`,
		);
		start_time = Date.now();
		// Render Section Items
		for (const [index, item] of section.items.entries()) {
			// 3. Render the item
			const layout = Layout.computeBoxes(
				Layout.normalize(
					Layout.instantiate(
						layout_schema.item_layout_schema,
						item,
						data_schema.item_schema,
						bindings
					),
					column_width,
					fontDict,
				),
				fontDict,
			);
			layout.path = { tag: "item", section: section.section_name, item: index };
			layouts.push(layout);
		}
		end_time = Date.now();
		console.info(
			`Item rendering time: ${end_time - start_time}ms for section ${section.section_name}`,
		);
	}

	console.log("Position calculations are completed.");

	return layouts;
}
