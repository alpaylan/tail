import * as Margin from "./Margin";

export type ColumnType =
	| { tag: "SingleColumn" }
	| { tag: "DoubleColumn"; vertical_margin: number };

// eslint-disable-next-line @typescript-eslint/no-namespace
export module ColumnType {
	export function fromJson(json: unknown): ColumnType {
		if (typeof json === "string" && json === "SingleColumn") {
			return { tag: "SingleColumn" };
		}
		if (
			typeof json === "object" &&
			json !== null &&
			"tag" in json &&
			json.tag === "DoubleColumn" &&
			"vertical_margin" in json &&
			typeof json.vertical_margin === "number"
		) {
			return { tag: "DoubleColumn", vertical_margin: json.vertical_margin };
		}

		throw new Error("Could not parse ColumnType");
	}
}

export const vertical_margin = (columnType: ColumnType) => {
	if (columnType.tag === "SingleColumn") {
		return 0;
	} else if (columnType.tag === "DoubleColumn") {
		return columnType.vertical_margin;
	}

	return 0;
};

export class ResumeLayout {
	schema_name: string;
	column_type: ColumnType;
	margin: Margin.t;
	width: number;
	height: number;

	constructor(
		schema_name: string,
		column_type: ColumnType,
		margin: Margin.t,
		width: number,
		height: number,
	) {
		this.schema_name = schema_name;
		this.column_type = column_type;
		this.margin = margin;
		this.width = width;
		this.height = height;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static fromJson(json: any): ResumeLayout {
		return new ResumeLayout(
			json.schema_name,
			ColumnType.fromJson(json.column_type),
			Margin.fromJson(json.margin),
			json.width,
			json.height,
		);
	}
}
