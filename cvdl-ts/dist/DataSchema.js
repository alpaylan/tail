"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSchema = exports.Field = exports.DocumentDataType = void 0;
var DocumentDataType;
(function (DocumentDataType) {
    function parse(s) {
        if (s === "Date") {
            return { tag: "Date" };
        }
        else if (s === "String") {
            return { tag: "String" };
        }
        else if (s === "MarkdownString") {
            return { tag: "MarkdownString" };
        }
        else if (s === "Number") {
            return { tag: "Number" };
        }
        else if (s.startsWith("List")) {
            return { tag: "List", value: parse(s.slice(5, -1).trim()) };
        }
        else if (s.includes("|")) {
            return { tag: "Types", value: s.split("|").map((s) => s.trim()).map(parse) };
        }
        else {
            throw new Error("Invalid DocumentDataType: " + s);
        }
    }
    DocumentDataType.parse = parse;
    function print(d) {
        switch (d.tag) {
            case "Date":
                return "Date";
            case "String":
                return "String";
            case "MarkdownString":
                return "MarkdownString";
            case "Number":
                return "Number";
            case "Type":
                return d.value;
            case "List":
                return "List<" + print(d.value) + ">";
            case "Types":
                return d.value.map(print).join(" | ");
        }
    }
    DocumentDataType.print = print;
})(DocumentDataType || (exports.DocumentDataType = DocumentDataType = {}));
var Field;
(function (Field) {
    function fromJson(json) {
        if (typeof json !== "object" || json === null) {
            throw new Error("Field must be an object");
        }
        if (!("name" in json) || !("type" in json)) {
            throw new Error("Field must have a name and type");
        }
        if (typeof json.name !== "string") {
            throw new Error("Field name must be a string");
        }
        if (typeof json.type !== "string") {
            throw new Error("Field type must be a string");
        }
        return {
            name: json.name,
            type: DocumentDataType.parse(json.type),
        };
    }
    Field.fromJson = fromJson;
    function toJson(f) {
        return {
            name: f.name,
            type: DocumentDataType.print(f.type),
        };
    }
    Field.toJson = toJson;
})(Field || (exports.Field = Field = {}));
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
        return new DataSchema(json.schema_name, json.header_schema.map(Field.fromJson), json.item_schema.map(Field.fromJson));
    }
    toJson() {
        return {
            schema_name: this.schema_name,
            header_schema: this.header_schema.map(Field.toJson),
            item_schema: this.item_schema.map(Field.toJson),
        };
    }
}
exports.DataSchema = DataSchema;