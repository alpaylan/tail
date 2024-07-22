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
const PdfLayout_1 = require("./PdfLayout");
const fs_1 = require("fs");
const AnyLayout_1 = require("./AnyLayout");
const FileStorage_1 = require("./FileStorage");
const Defaults = __importStar(require("./Defaults"));
const resumePath = process.argv[2];
// const dataSchemas: DataSchema.t[] = JSON.parse(readFileSync("projdir/data-schemas.json", "utf-8"));
const bindings = new Map();
JSON.parse((0, fs_1.readFileSync)("projdir/bindings.json", "utf-8")).forEach((binding) => bindings.set(binding.key, binding.value));
// const layoutSchemas: LayoutSchema[] = (
// 	JSON.parse(readFileSync("projdir/layout-schemas.json", "utf-8")) as unknown[]
// ).map((schema) => LayoutSchema.fromJson(schema));
// const resumeLayouts: ResumeLayout[] = (
// 	JSON.parse(readFileSync("projdir/resume-layouts.json", "utf-8")) as unknown[]
// ).map((schema) => ResumeLayout.fromJson(schema));
// const resume = Resume.fromJson(JSON.parse(readFileSync(resumePath, "utf-8")));
// const resumeLayout = resumeLayouts.filter(
// 	(layout) => layout.schema_name === resume.resume_layout(),
// )[0]!;
const dataSchemas = Defaults.DefaultDataSchemas;
const layoutSchemas = Defaults.DefaultLayoutSchemas;
const resumeLayout = Defaults.DefaultResumeLayout;
const resume = Defaults.DefaultResume;
const fontDict = new AnyLayout_1.FontDict();
const storage = new FileStorage_1.FileStorage("assets/fonts/");
fontDict.load_fonts(storage).then(() => {
    (0, PdfLayout_1.render)({
        resume,
        data_schemas: dataSchemas,
        layout_schemas: layoutSchemas,
        resume_layout: resumeLayout,
        bindings,
        fontDict,
        storage,
        debug: false,
    }).then((result) => {
        result.blob.arrayBuffer().then((buffer) => {
            (0, fs_1.writeFileSync)("output.pdf", Buffer.from(buffer));
        });
    });
});
