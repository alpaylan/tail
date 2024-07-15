import * as Layout from "./Layout";
export declare class LayoutSchema {
    schema_name: string;
    data_schema_name: string;
    header_layout_schema: Layout.t;
    item_layout_schema: Layout.t;
    constructor(schema_name: string, data_schema_name: string, header_layout_schema: Layout.t, item_layout_schema: Layout.t);
    static empty(schema_name: string, data_schema_name: string): LayoutSchema;
    static fromJson(json: any): LayoutSchema;
    fonts(): import("./Font").t[];
    toJson(): {
        schema_name: string;
        data_schema_name: string;
        header_layout_schema: unknown;
        item_layout_schema: unknown;
    };
}
