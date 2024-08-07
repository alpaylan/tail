export type Optional<T> = {
	[P in keyof T]?: T[P];
};

export function with_<T>(e: T, w: Optional<T>): T {
	return { ...e, ...w };
}

export function copy<T>(s: T): T {
	return {
		...s,
	};
}

export function randomString(): string {
	return Math.random().toString(36).substring(7);
}
