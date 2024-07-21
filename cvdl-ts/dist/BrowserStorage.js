"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserStorage = void 0;
const LocalStorage_1 = require("./LocalStorage");
const IndexedDB_1 = require("./IndexedDB");
class BrowserStorage {
    async initiate_storage() {
        new LocalStorage_1.LocalStorage().initiate_storage();
    }
    list_resumes() {
        return new LocalStorage_1.LocalStorage().list_resumes();
    }
    list_data_schemas() {
        return new LocalStorage_1.LocalStorage().list_data_schemas();
    }
    list_layout_schemas() {
        return new LocalStorage_1.LocalStorage().list_layout_schemas();
    }
    list_resume_layouts() {
        return new LocalStorage_1.LocalStorage().list_resume_layouts();
    }
    load_resume(resume_name) {
        return new LocalStorage_1.LocalStorage().load_resume(resume_name);
    }
    load_data_schema(schema_name) {
        return new LocalStorage_1.LocalStorage().load_data_schema(schema_name);
    }
    load_layout_schema(schema_name) {
        return new LocalStorage_1.LocalStorage().load_layout_schema(schema_name);
    }
    load_resume_layout(schema_name) {
        return new LocalStorage_1.LocalStorage().load_resume_layout(schema_name);
    }
    save_resume(resume_name, resume_data) {
        return new LocalStorage_1.LocalStorage().save_resume(resume_name, resume_data);
    }
    save_data_schema(data_schema) {
        return new LocalStorage_1.LocalStorage().save_data_schema(data_schema);
    }
    save_layout_schema(layout_schema) {
        return new LocalStorage_1.LocalStorage().save_layout_schema(layout_schema);
    }
    save_resume_layout(resume_layout) {
        throw new Error("Method not implemented.");
    }
    async load_font(font) {
        return new IndexedDB_1.IndexedDB().load_font(font);
    }
}
exports.BrowserStorage = BrowserStorage;
