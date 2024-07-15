export type t = Percent | Absolute | Fill;
type Width = t;
export type Percent = {
    tag: "Percent";
    value: number;
};
export type Absolute = {
    tag: "Absolute";
    value: number;
};
export type Fill = {
    tag: "Fill";
};
export declare function copy(width: Width): Width;
export declare function default_(): Width;
export declare function percent(value: number): Width;
export declare function absolute(value: number): Width;
export declare function fill(): Width;
export declare function is_fill(self: Width): boolean;
export declare function get_fixed_unchecked(self: Width): number;
export declare function scale(self: Width, scale: number): Width;
export declare function fromJson(json: any): Width;
export declare function toJson(self: Width): any;
export {};
