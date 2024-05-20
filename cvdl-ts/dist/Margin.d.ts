export declare class Margin {
    top: number;
    bottom: number;
    left: number;
    right: number;
    constructor(top: number, bottom: number, left: number, right: number);
    copy(): Margin;
    static default_(): Margin;
    static fromJson(json: any): Margin;
    toJson(): {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}
