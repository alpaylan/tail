export declare namespace DateFormat {
    type t = "YYYY-MM-DD" | "MM-DD-YYYY" | "DD-MM-YYYY" | "YYYY/MM/DD" | "MM/DD/YYYY" | "DD/MM/YYYY" | "Month, YYYY" | "DD Month, YYYY" | "Month DD, YYYY" | "Mon YYYY" | "Mon DD, YYYY" | "YYYY";
    const formats: readonly ["YYYY-MM-DD", "MM-DD-YYYY", "DD-MM-YYYY", "YYYY/MM/DD", "MM/DD/YYYY", "DD/MM/YYYY", "Month, YYYY", "DD Month, YYYY", "Month DD, YYYY", "Mon YYYY", "Mon DD, YYYY", "YYYY"];
    const print: (date: string, format: t) => string;
    const parse: (date: string) => string;
}
export declare namespace DocumentDataType {
    type Date = {
        tag: "Date";
        format: DateFormat.t;
    };
    type PureString = {
        tag: "String";
    };
    type MarkdownString = {
        tag: "MarkdownString";
    };
    type PureNumber = {
        tag: "Number";
    };
    type Type = {
        tag: "Type";
        value: string;
    };
    type List = {
        tag: "List";
        value: DocumentDataType.t;
    };
    type Types = {
        tag: "Types";
        value: DocumentDataType.t[];
    };
    type t = Date | PureString | MarkdownString | PureNumber | Type | List | Types;
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
