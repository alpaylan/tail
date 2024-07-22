import * as Margin from "./Margin";

export type ColumnType =
	| { tag: "SingleColumn" }
	| { tag: "DoubleColumn"; vertical_margin: number };

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
			json.column_type,
			json.margin,
			json.width,
			json.height,
		);
	}
}
