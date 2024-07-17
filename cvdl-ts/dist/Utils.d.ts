export type Optional<T> = {
    [P in keyof T]?: T[P];
};
export declare function with_<T>(e: T, w: Optional<T>): T;
