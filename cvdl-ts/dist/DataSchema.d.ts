export declare namespace DocumentDataType {
    type t = {
        tag: "Date";
    } | {
        tag: "String";
    } | {
        tag: "MarkdownString";
    } | {
        tag: "Number";
    } | {
        tag: "Type";
        value: string;
    } | {
        tag: "List";
        value: t;
    } | {
        tag: "Types";
        value: t[];
    };
    type DocumentDataType = t;
    function parse(s: string): DocumentDataType;
    function print(d: DocumentDataType): string;
}
export declare namespace Field {
    type t = {
        name: string;
        type: DocumentDataType.t;
    };
    type Field = t;
    function fromJson(json: unknown): Field;
    function toJson(f: Field): unknown;
}
export declare class DataSchema {
    schema_name: string;
    header_schema: Field.t[];
    item_schema: Field.t[];
    constructor(schema_name: string, header_schema: Field.t[], item_schema: Field.t[]);
    static fromJson(json: unknown): DataSchema;
    toJson(): {
        schema_name: string;
        header_schema: unknown[];
        item_schema: unknown[];
    };
}
