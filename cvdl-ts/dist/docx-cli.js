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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const AnyLayout_1 = require("./AnyLayout");
const Defaults = __importStar(require("./Defaults"));
const DocxLayout = __importStar(require("./DocxLayout"));
const FileStorage_1 = require("./FileStorage");
async function main() {
    var _a;
    const outputPath = (_a = process.argv[2]) !== null && _a !== void 0 ? _a : "output.docx";
    const storage = new FileStorage_1.FileStorage("assets/fonts/");
    const fontDict = new AnyLayout_1.FontDict();
    await fontDict.load_fonts(storage);
    const result = await DocxLayout.render({
        resume: Defaults.DefaultResume,
        data_schemas: Defaults.DefaultDataSchemas,
        layout_schemas: Defaults.DefaultLayoutSchemas,
        resume_layout: Defaults.DefaultResumeLayout,
        bindings: Defaults.DefaultBindings,
        fontDict,
        storage,
    });
    const buffer = new Uint8Array(await result.blob.arrayBuffer());
    (0, fs_1.writeFileSync)(outputPath, buffer);
    console.log(`Document is saved to ${outputPath}`);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
