export type Optional<T> = {
    [P in keyof T]?: T[P];
};
export declare function with_<T>(e: T, w: Optional<T>): T;
export declare function copy<T>(s: T): T;
