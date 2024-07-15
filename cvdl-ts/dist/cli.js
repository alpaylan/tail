"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataSchema_1 = require("./DataSchema");
const LayoutSchema_1 = require("./LayoutSchema");
const PdfLayout_1 = require("./PdfLayout");
const fs_1 = require("fs");
const ResumeLayout_1 = require("./ResumeLayout");
const Resume_1 = require("./Resume");
const AnyLayout_1 = require("./AnyLayout");
const FileStorage_1 = require("./FileStorage");
const resumePath = process.argv[2];
const dataSchemas = JSON.parse((0, fs_1.readFileSync)("projdir/data-schemas.json", "utf-8")).map((schema) => DataSchema_1.DataSchema.fromJson(schema));
const layoutSchemas = JSON.parse((0, fs_1.readFileSync)("projdir/layout-schemas.json", "utf-8")).map((schema) => LayoutSchema_1.LayoutSchema.fromJson(schema));
const resumeLayouts = JSON.parse((0, fs_1.readFileSync)("projdir/resume-layouts.json", "utf-8")).map((schema) => ResumeLayout_1.ResumeLayout.fromJson(schema));
const resume = Resume_1.Resume.fromJson(JSON.parse((0, fs_1.readFileSync)(resumePath, "utf-8")));
const resumeLayout = resumeLayouts.filter((layout) => layout.schema_name === resume.resume_layout())[0];
const fontDict = new AnyLayout_1.FontDict();
const storage = new FileStorage_1.FileStorage("assets/fonts/");
(0, PdfLayout_1.render)({ resume, data_schemas: dataSchemas, layout_schemas: layoutSchemas, resume_layout: resumeLayout, fontDict, storage, debug: false }).then((result) => {
    result.blob.arrayBuffer().then((buffer) => {
        (0, fs_1.writeFileSync)("output.pdf", Buffer.from(buffer));
    });
});
