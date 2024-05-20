import { SectionLayout } from "./Layout";

export class LayoutSchema {
    schema_name: string;
    data_schema_name: string;
    header_layout_schema: SectionLayout;
    item_layout_schema: SectionLayout;

    constructor(schema_name: string, data_schema_name: string, header_layout_schema: SectionLayout, item_layout_schema: SectionLayout) {
        this.schema_name = schema_name;
        this.data_schema_name = data_schema_name;
        this.header_layout_schema = header_layout_schema;
        this.item_layout_schema = item_layout_schema;
    }

    static empty(schema_name: string, data_schema_name: string): LayoutSchema {
        return new LayoutSchema(
            schema_name,
            data_schema_name,
            SectionLayout.empty(),
            SectionLayout.empty()
        );
    }

    static fromJson(json: any): LayoutSchema {
        return new LayoutSchema(
            json.schema_name,
            json.data_schema_name,
            SectionLayout.fromJson(json.header_layout_schema),
            SectionLayout.fromJson(json.item_layout_schema)
        );
    }

    fonts() {
        return [
            ...this.header_layout_schema.fonts(),
            ...this.item_layout_schema.fonts(),
        ];
    }

    toJson() {
        return {
            schema_name: this.schema_name,
            data_schema_name: this.data_schema_name,
            header_layout_schema: this.header_layout_schema.toJson(),
            item_layout_schema: this.item_layout_schema.toJson(),
        };
    }

}