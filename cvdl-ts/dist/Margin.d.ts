export type t = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
type Margin = t;
export declare function margin(top: number, bottom: number, left: number, right: number): Margin;
export declare function copy(m: Margin): t;
export declare function default_(): t;
export declare function fromJson(json: unknown): Margin;
export declare function toJson(m: Margin): unknown;
export {};
