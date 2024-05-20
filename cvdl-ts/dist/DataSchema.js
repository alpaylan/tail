"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSchema = void 0;
class DataSchema {
    constructor(schema_name, header_schema, item_schema) {
        this.schema_name = schema_name;
        this.header_schema = header_schema;
        this.item_schema = item_schema;
    }
    static fromJson(json) {
        if (typeof json !== "object" || json === null) {
            throw new Error("DataSchema must be an object");
        }
        if (!("schema_name" in json) || !("header_schema" in json) || !("item_schema" in json)) {
            throw new Error("DataSchema must have a schema_name, header_schema, and item_schema");
        }
        return new DataSchema(json.schema_name, json.header_schema, json.item_schema);
    }
    toJson() {
        return {
            schema_name: this.schema_name,
            header_schema: this.header_schema,
            item_schema: this.item_schema,
        };
    }
}
exports.DataSchema = DataSchema;
