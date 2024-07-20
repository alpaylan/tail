import { DataSchema } from "./DataSchema";
import { LayoutSchema } from "./LayoutSchema";
import { render } from "./PdfLayout";
import { readFileSync, writeFileSync } from "fs";
import { ResumeLayout } from "./ResumeLayout";
import { Resume } from "./Resume";
import { FontDict } from "./AnyLayout";
import { FileStorage } from "./FileStorage";

const resumePath: string = process.argv[2];

const dataSchemas: DataSchema[] = (
	JSON.parse(readFileSync("projdir/data-schemas.json", "utf-8")) as unknown[]
).map((schema) => DataSchema.fromJson(schema));
const layoutSchemas: LayoutSchema[] = (
	JSON.parse(readFileSync("projdir/layout-schemas.json", "utf-8")) as unknown[]
).map((schema) => LayoutSchema.fromJson(schema));
const resumeLayouts: ResumeLayout[] = (
	JSON.parse(readFileSync("projdir/resume-layouts.json", "utf-8")) as unknown[]
).map((schema) => ResumeLayout.fromJson(schema));

const resume = Resume.fromJson(JSON.parse(readFileSync(resumePath, "utf-8")));
const resumeLayout = resumeLayouts.filter(
	(layout) => layout.schema_name === resume.resume_layout(),
)[0]!;

const fontDict = new FontDict();
const storage = new FileStorage("assets/fonts/");

render({
	resume,
	data_schemas: dataSchemas,
	layout_schemas: layoutSchemas,
	resume_layout: resumeLayout,
	fontDict,
	storage,
	debug: false,
}).then((result) => {
	result.blob.arrayBuffer().then((buffer) => {
		writeFileSync("output.pdf", Buffer.from(buffer));
	});
});
