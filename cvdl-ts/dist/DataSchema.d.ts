export declare namespace DateFormat {
    type t = "YYYY-MM-DD" | "MM-DD-YYYY" | "DD-MM-YYYY" | "YYYY/MM/DD" | "MM/DD/YYYY" | "DD/MM/YYYY" | "Month, YYYY" | "DD Month, YYYY" | "Month DD, YYYY" | "Mon YYYY" | "Mon DD, YYYY" | "YYYY" | "unknown";
    const formats: readonly ["YYYY-MM-DD", "MM-DD-YYYY", "DD-MM-YYYY", "YYYY/MM/DD", "MM/DD/YYYY", "DD/MM/YYYY", "Month, YYYY", "DD Month, YYYY", "Month DD, YYYY", "Mon YYYY", "Mon DD, YYYY", "YYYY", "unknown"];
    const print: (date: string, format: t) => string;
    const parse: (date: string) => string;
}
export declare namespace DocumentDataType {
    type Date = {
        tag: "Date";
        format: DateFormat.t;
    };
    type URL = {
        tag: "String";
    };
    type PureString = {
        tag: "Url";
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
    type t = Date | PureString | MarkdownString | URL | PureNumber | Type | List | Types;
    type DocumentDataType = t;
}
export type Field = {
    name: string;
    type: DocumentDataType.t;
};
export declare namespace DataSchema {
    type t = {
        schema_name: string;
        header_schema: Field[];
        item_schema: Field[];
    };
    function dataSchema(schema_name: string, header_schema: Field[], item_schema: Field[]): t;
}
