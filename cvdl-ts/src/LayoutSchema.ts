import * as Layout from "./Layout";

export class LayoutSchema {
	schema_name: string;
	data_schema_name: string;
	header_layout_schema: Layout.t;
	item_layout_schema: Layout.t;

	constructor(
		schema_name: string,
		data_schema_name: string,
		header_layout_schema: Layout.t,
		item_layout_schema: Layout.t,
	) {
		this.schema_name = schema_name;
		this.data_schema_name = data_schema_name;
		this.header_layout_schema = header_layout_schema;
		this.item_layout_schema = item_layout_schema;
	}

	static empty(schema_name: string, data_schema_name: string): LayoutSchema {
		return new LayoutSchema(
			schema_name,
			data_schema_name,
			Layout.empty(),
			Layout.empty(),
		);
	}

	static fromJson(json: any): LayoutSchema {
		return new LayoutSchema(
			json.schema_name,
			json.data_schema_name,
			Layout.fromJson(json.header_layout_schema),
			Layout.fromJson(json.item_layout_schema),
		);
	}

	fonts() {
		return [
			...Layout.fonts(this.header_layout_schema),
			...Layout.fonts(this.item_layout_schema),
		];
	}

	toJson() {
		return {
			schema_name: this.schema_name,
			data_schema_name: this.data_schema_name,
			header_layout_schema: Layout.toJson(this.header_layout_schema),
			item_layout_schema: Layout.toJson(this.item_layout_schema),
		};
	}
}
