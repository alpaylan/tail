

export module DateFormat {
    export type t =
        | "YYYY-MM-DD"
        | "MM-DD-YYYY"
        | "DD-MM-YYYY"
        | "YYYY/MM/DD"
        | "MM/DD/YYYY"
        | "DD/MM/YYYY"
        | "Month, YYYY"
        | "DD Month, YYYY"
        | "Month DD, YYYY"
        | "Mon YYYY"
        | "Mon DD, YYYY"
        | "YYYY"

    export const formats = [
        "YYYY-MM-DD",
        "MM-DD-YYYY",
        "DD-MM-YYYY",
        "YYYY/MM/DD",
        "MM/DD/YYYY",
        "DD/MM/YYYY",
        "Month, YYYY",
        "DD Month, YYYY",
        "Month DD, YYYY",
        "Mon YYYY",
        "Mon DD, YYYY",
        "YYYY"
    ] as const;

    export const print = (date: string, format: t): string => {
        console.error(date);
        const d = new Date(date + "T00:00:00");
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();

        let result = format as string;
        result = result.replace("YYYY", year.toString());
        result = result.replace("YY", year.toString().slice(-2));
        result = result.replace("MM", month.toString().padStart(2, "0"));
        result = result.replace("DD", day.toString().padStart(2, "0"));
        result = result.replace("Month", d.toLocaleString('default', { month: 'long' }));
        result = result.replace("Mon", d.toLocaleString('default', { month: 'short' }));
        return result;
    }

    export const parse = (date: string): string => {
        const d = new Date(date + "T00:00:00");
        console.error(d);
        if (isNaN(d.getTime())) {
            return "";
        }
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }
}


export module DocumentDataType {

    export type Date = { tag: "Date", format: DateFormat.t };
    export type PureString = { tag: "String" };
    export type MarkdownString = { tag: "MarkdownString" };
    export type PureNumber = { tag: "Number" };
    export type Type = { tag: "Type", value: string };
    export type List = { tag: "List", value: DocumentDataType.t };
    export type Types = { tag: "Types", value: DocumentDataType.t[] };
    
    export type t =
        | Date 
        | PureString 
        | MarkdownString 
        | PureNumber 
        | Type 
        | List 
        | Types;

    export type DocumentDataType = t;

    export function parse(s: string) : DocumentDataType {
        if (s === "Date") {
            return { tag: "Date", format: s.length > 4 ? s.slice(5, -1).trim() as DateFormat.t : "YYYY-MM-DD" };
        } else if (s === "String") {
            return { tag: "String" };
        } else if (s === "MarkdownString") {
            return { tag: "MarkdownString" };
        } else if (s === "Number") {
            return { tag: "Number" };
        } else if (s.startsWith("List")) {
            return { tag: "List", value: parse(s.slice(5, -1).trim()) };
        } else if (s.includes("|")) {
            return { tag: "Types", value: s.split("|").map((s) => s.trim()).map(parse) };
        } else {
            throw new Error("Invalid DocumentDataType: " + s);
        }
    }

    export function print(d: DocumentDataType) : string {
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
}



export module Field {
    export type t = {
        name: string;
        type: DocumentDataType.t;
    }
    
    export type Field = t;

    export function fromJson(json: unknown): Field {
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
            type: DocumentDataType.parse(json.type as string),
        };
    }

    export function toJson(f: Field): unknown {
        return {
            name: f.name,
            type: DocumentDataType.print(f.type),
        };
    }
    
}

export class DataSchema {
    schema_name: string;
    header_schema: Field.t[];
    item_schema: Field.t[];

    constructor(schema_name: string, header_schema: Field.t[], item_schema: Field.t[]) {
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
            (json.header_schema as unknown[]).map(Field.fromJson),
            (json.item_schema as unknown[]).map(Field.fromJson),
        );
    }

    toJson() {
        return {
            schema_name: this.schema_name,
            header_schema: this.header_schema.map(Field.toJson),
            item_schema: this.item_schema.map(Field.toJson),
        };
    }
}
