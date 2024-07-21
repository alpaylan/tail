"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeLayout = exports.vertical_margin = exports.ColumnType = void 0;
const Margin = __importStar(require("./Margin"));
// eslint-disable-next-line @typescript-eslint/no-namespace
var ColumnType;
(function (ColumnType) {
    function fromJson(json) {
        if (typeof json === "string" && json === "SingleColumn") {
            return { tag: "SingleColumn" };
        }
        if (typeof json === "object" &&
            json !== null &&
            "tag" in json &&
            json.tag === "DoubleColumn" &&
            "vertical_margin" in json &&
            typeof json.vertical_margin === "number") {
            return { tag: "DoubleColumn", vertical_margin: json.vertical_margin };
        }
        throw new Error("Could not parse ColumnType");
    }
    ColumnType.fromJson = fromJson;
})(ColumnType || (exports.ColumnType = ColumnType = {}));
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
        return new ResumeLayout(json.schema_name, ColumnType.fromJson(json.column_type), Margin.fromJson(json.margin), json.width, json.height);
    }
}
exports.ResumeLayout = ResumeLayout;
