import * as Layout from "./Layout";

export class LayoutSchema {
	schema_name: string;
	data_schema_name: string;
	header_layout_schema: Layout.PreBindingLayout;
	item_layout_schema: Layout.PreBindingLayout;

	constructor(
		schema_name: string,
		data_schema_name: string,
		header_layout_schema: Layout.PreBindingLayout,
		item_layout_schema: Layout.PreBindingLayout,
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
			json.header_layout_schema,
			json.item_layout_schema,
		);
	}

	toJson() {
		return {
			schema_name: this.schema_name,
			data_schema_name: this.data_schema_name,
			header_layout_schema: this.header_layout_schema,
			item_layout_schema: this.item_layout_schema,
		};
	}
}
