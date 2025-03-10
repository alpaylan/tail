import { render } from "./PdfLayout";
import { readFileSync, writeFileSync } from "fs";
import { FontDict } from "./AnyLayout";
import { FileStorage } from "./FileStorage";
import * as Defaults from "./Defaults";

const resumePath: string = process.argv[2];

// const dataSchemas: DataSchema.t[] = JSON.parse(readFileSync("projdir/data-schemas.json", "utf-8"));

const bindings = new Map<string, object>();
JSON.parse(readFileSync("projdir/bindings.json", "utf-8")).forEach((binding) =>
	bindings.set(binding.key, binding.value),
);

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

const fontDict = new FontDict();
const storage = new FileStorage("assets/fonts/");

fontDict.load_fonts(storage).then(() => {
	render({
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
			writeFileSync("output.pdf", Buffer.from(buffer));
		});
	});
});
