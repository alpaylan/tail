export type DocumentDataType =
    | { tag: "Date" }
    | { tag: "String" }
    | { tag: "MarkdownString" }
    | { tag: "Type", value: string }
    | { tag: "List", value: DocumentDataType }
    | { tag: "Types", value: DocumentDataType[] }


export type Field = {
    name: string;
    data_type: DocumentDataType;
}

export class DataSchema {
    schema_name: string;
    header_schema: Field[];
    item_schema: Field[];

    constructor(schema_name: string, header_schema: Field[], item_schema: Field[]) {
        this.schema_name = schema_name;
        this.header_schema = header_schema;
        this.item_schema = item_schema;
    }

    static fromJson(json: unknown): DataSchema {
        if (typeof json !== "object" || json === null) {
            throw new Error("DataSchema must be an object");
        }

        if (!("schema_name" in json) || !("header_schema" in json) || !("item_schema" in json)) {
            throw new Error("DataSchema must have a schema_name, header_schema, and item_schema");
        }

        return new DataSchema(
            json.schema_name as string,
            json.header_schema as Field[],
            json.item_schema as Field[],
        );
    }

    toJson() {
        return {
            schema_name: this.schema_name,
            header_schema: this.header_schema,
            item_schema: this.item_schema,
        };
    }
}
