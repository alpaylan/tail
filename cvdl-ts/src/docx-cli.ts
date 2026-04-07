import { writeFileSync } from "fs";
import { FontDict } from "./AnyLayout";
import * as Defaults from "./Defaults";
import * as DocxLayout from "./DocxLayout";
import { FileStorage } from "./FileStorage";

async function main() {
	const outputPath = process.argv[2] ?? "output.docx";
	const storage = new FileStorage("assets/fonts/");
	const fontDict = new FontDict();

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
	writeFileSync(outputPath, buffer);
	console.log(`Document is saved to ${outputPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
