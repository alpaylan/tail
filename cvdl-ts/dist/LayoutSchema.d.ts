import * as Layout from "./Layout";
export declare class LayoutSchema {
    schema_name: string;
    data_schema_name: string;
    header_layout_schema: Layout.PreBindingLayout;
    item_layout_schema: Layout.PreBindingLayout;
    constructor(schema_name: string, data_schema_name: string, header_layout_schema: Layout.PreBindingLayout, item_layout_schema: Layout.PreBindingLayout);
    static empty(schema_name: string, data_schema_name: string): LayoutSchema;
    static fromJson(json: any): LayoutSchema;
    toJson(): {
        schema_name: string;
        data_schema_name: string;
        header_layout_schema: Layout.PreBindingLayout;
        item_layout_schema: Layout.PreBindingLayout;
    };
}
