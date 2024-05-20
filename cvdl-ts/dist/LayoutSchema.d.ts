import { SectionLayout } from "./Layout";
export declare class LayoutSchema {
    schema_name: string;
    data_schema_name: string;
    header_layout_schema: SectionLayout;
    item_layout_schema: SectionLayout;
    constructor(schema_name: string, data_schema_name: string, header_layout_schema: SectionLayout, item_layout_schema: SectionLayout);
    static empty(schema_name: string, data_schema_name: string): LayoutSchema;
    static fromJson(json: any): LayoutSchema;
    fonts(): import("./Font").Font[];
    toJson(): {
        schema_name: string;
        data_schema_name: string;
        header_layout_schema: any;
        item_layout_schema: any;
    };
}
