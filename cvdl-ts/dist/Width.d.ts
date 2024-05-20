export type Width = Percent | Absolute | Fill;
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
export declare namespace Width {
    function copy(width: Width): Width;
    function default_(): Width;
    function percent(value: number): Width;
    function absolute(value: number): Width;
    function fill(): Width;
    function is_fill(self: Width): boolean;
    function get_fixed_unchecked(self: Width): number;
    function scale(self: Width, scale: number): Width;
    function fromJson(json: any): Width;
    function toJson(self: Width): any;
}
