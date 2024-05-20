export type DocumentDataType = {
    tag: "Date";
} | {
    tag: "String";
} | {
    tag: "MarkdownString";
} | {
    tag: "Type";
    value: string;
} | {
    tag: "List";
    value: DocumentDataType;
} | {
    tag: "Types";
    value: DocumentDataType[];
};
export type Field = {
    name: string;
    data_type: DocumentDataType;
};
export declare class DataSchema {
    schema_name: string;
    header_schema: Field[];
    item_schema: Field[];
    constructor(schema_name: string, header_schema: Field[], item_schema: Field[]);
    static fromJson(json: unknown): DataSchema;
    toJson(): {
        schema_name: string;
        header_schema: Field[];
        item_schema: Field[];
    };
}
