"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutSchema = void 0;
const Layout_1 = require("./Layout");
class LayoutSchema {
    constructor(schema_name, data_schema_name, header_layout_schema, item_layout_schema) {
        this.schema_name = schema_name;
        this.data_schema_name = data_schema_name;
        this.header_layout_schema = header_layout_schema;
        this.item_layout_schema = item_layout_schema;
    }
    static empty(schema_name, data_schema_name) {
        return new LayoutSchema(schema_name, data_schema_name, Layout_1.SectionLayout.empty(), Layout_1.SectionLayout.empty());
    }
    static fromJson(json) {
        return new LayoutSchema(json.schema_name, json.data_schema_name, Layout_1.SectionLayout.fromJson(json.header_layout_schema), Layout_1.SectionLayout.fromJson(json.item_layout_schema));
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
exports.LayoutSchema = LayoutSchema;
