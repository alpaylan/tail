"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeLayout = exports.vertical_margin = void 0;
const vertical_margin = (columnType) => {
    if (columnType.tag === "SingleColumn") {
        return 0;
    }
    else if (columnType.tag === "DoubleColumn") {
        return columnType.vertical_margin;
    }
    return 0;
};
exports.vertical_margin = vertical_margin;
class ResumeLayout {
    constructor(schema_name, column_type, margin, width, height) {
        this.schema_name = schema_name;
        this.column_type = column_type;
        this.margin = margin;
        this.width = width;
        this.height = height;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json) {
        return new ResumeLayout(json.schema_name, json.column_type, json.margin, json.width, json.height);
    }
}
exports.ResumeLayout = ResumeLayout;
