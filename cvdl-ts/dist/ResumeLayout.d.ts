import * as Margin from "./Margin";
export type ColumnType = {
    tag: "SingleColumn";
} | {
    tag: "DoubleColumn";
    vertical_margin: number;
};
export declare namespace ColumnType {
    function fromJson(json: unknown): ColumnType;
}
export declare const vertical_margin: (columnType: ColumnType) => number;
export declare class ResumeLayout {
    schema_name: string;
    column_type: ColumnType;
    margin: Margin.t;
    width: number;
    height: number;
    constructor(schema_name: string, column_type: ColumnType, margin: Margin.t, width: number, height: number);
    static fromJson(json: any): ResumeLayout;
}
