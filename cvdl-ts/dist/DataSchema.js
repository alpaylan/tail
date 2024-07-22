"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSchema = exports.DateFormat = void 0;
var DateFormat;
(function (DateFormat) {
    DateFormat.formats = [
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
    ];
    DateFormat.print = (date, format) => {
        const d = new Date(date + "T00:00:00");
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        let result = format;
        result = result.replace("YYYY", year.toString());
        result = result.replace("YY", year.toString().slice(-2));
        result = result.replace("MM", month.toString().padStart(2, "0"));
        result = result.replace("DD", day.toString().padStart(2, "0"));
        result = result.replace("Month", d.toLocaleString("default", { month: "long" }));
        result = result.replace("Mon", d.toLocaleString("default", { month: "short" }));
        return result;
    };
    DateFormat.parse = (date) => {
        const d = new Date(date + "T00:00:00");
        if (isNaN(d.getTime())) {
            return "";
        }
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    };
})(DateFormat || (exports.DateFormat = DateFormat = {}));
var DataSchema;
(function (DataSchema) {
    function dataSchema(schema_name, header_schema, item_schema) {
        return { schema_name, header_schema, item_schema };
    }
    DataSchema.dataSchema = dataSchema;
})(DataSchema || (exports.DataSchema = DataSchema = {}));
