export module DateFormat {
	export type t =
		| "YYYY-MM-DD"
		| "MM-DD-YYYY"
		| "DD-MM-YYYY"
		| "YYYY/MM/DD"
		| "MM/DD/YYYY"
		| "DD/MM/YYYY"
		| "Month, YYYY"
		| "DD Month, YYYY"
		| "Month DD, YYYY"
		| "Mon YYYY"
		| "Mon DD, YYYY"
		| "YYYY"
		| "unknown";

	export const formats = [
		"YYYY-MM-DD",
		"MM-DD-YYYY",
		"DD-MM-YYYY",
		"YYYY/MM/DD",
		"MM/DD/YYYY",
		"DD/MM/YYYY",
		"Month, YYYY",
		"DD Month, YYYY",
		"Month DD, YYYY",
		"Mon YYYY",
		"Mon DD, YYYY",
		"YYYY",
		"unknown",
	] as const;

	export const print = (date: string, format: t): string => {
		const d = new Date(date + "T00:00:00");
		const year = d.getFullYear();
		const month = d.getMonth() + 1;
		const day = d.getDate();

		let result = format as string;
		result = result.replace("YYYY", year.toString());
		result = result.replace("YY", year.toString().slice(-2));
		result = result.replace("MM", month.toString().padStart(2, "0"));
		result = result.replace("DD", day.toString().padStart(2, "0"));
		result = result.replace(
			"Month",
			d.toLocaleString("default", { month: "long" }),
		);
		result = result.replace(
			"Mon",
			d.toLocaleString("default", { month: "short" }),
		);
		return result;
	};

	export const parse = (date: string): string => {
		const d = new Date(date + "T00:00:00");
		if (isNaN(d.getTime())) {
			return "";
		}
		return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
	};
}

export module DocumentDataType {
	export type Date = { tag: "Date"; format: DateFormat.t };
	export type URL = { tag: "String" };
	export type PureString = { tag: "Url" };
	export type MarkdownString = { tag: "MarkdownString" };
	export type PureNumber = { tag: "Number" };
	export type Type = { tag: "Type"; value: string };
	export type List = { tag: "List"; value: DocumentDataType.t };
	export type Types = { tag: "Types"; value: DocumentDataType.t[] };

	export type t =
		| Date
		| PureString
		| MarkdownString
		| URL
		| PureNumber
		| Type
		| List
		| Types;

	export type DocumentDataType = t;
}

export type Field = {
	name: string;
	type: DocumentDataType.t;
};

export module DataSchema {
	export type t = {
		schema_name: string;
		header_schema: Field[];
		item_schema: Field[];
	};

	export function dataSchema(
		schema_name: string,
		header_schema: Field[],
		item_schema: Field[],
	): t {
		return { schema_name, header_schema, item_schema };
	}
}
