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
exports.LayoutSchema = void 0;
const Layout = __importStar(require("./Layout"));
class LayoutSchema {
    constructor(schema_name, data_schema_name, header_layout_schema, item_layout_schema) {
        this.schema_name = schema_name;
        this.data_schema_name = data_schema_name;
        this.header_layout_schema = header_layout_schema;
        this.item_layout_schema = item_layout_schema;
    }
    static empty(schema_name, data_schema_name) {
        return new LayoutSchema(schema_name, data_schema_name, Layout.empty(), Layout.empty());
    }
    static fromJson(json) {
        return new LayoutSchema(json.schema_name, json.data_schema_name, Layout.fromJson(json.header_layout_schema), Layout.fromJson(json.item_layout_schema));
    }
    fonts() {
        return [
            ...Layout.fonts(this.header_layout_schema),
            ...Layout.fonts(this.item_layout_schema),
        ];
    }
    toJson() {
        return {
            schema_name: this.schema_name,
            data_schema_name: this.data_schema_name,
            header_layout_schema: Layout.toJson(this.header_layout_schema),
            item_layout_schema: Layout.toJson(this.item_layout_schema),
        };
    }
}
exports.LayoutSchema = LayoutSchema;
