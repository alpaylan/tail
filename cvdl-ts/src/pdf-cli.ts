import { writeFileSync } from "fs";
import { FontDict } from "./AnyLayout";
import * as Defaults from "./Defaults";
import { FileStorage } from "./FileStorage";
import * as PdfLayout from "./PdfLayout";

async function main() {
	const outputPath = process.argv[2] ?? "output.pdf";
	const sampleName = process.argv[3] ?? "default";
	const resume =
		sampleName === "comparison"
			? Defaults.ComparisonResume
			: Defaults.DefaultResume;
	const storage = new FileStorage("assets/fonts/");
	const fontDict = new FontDict();

	await fontDict.load_fonts(storage);

	const result = await PdfLayout.render({
		resume,
		data_schemas: Defaults.DefaultDataSchemas,
		layout_schemas: Defaults.DefaultLayoutSchemas,
		resume_layout: Defaults.DefaultResumeLayout,
		bindings: Defaults.DefaultBindings,
		fontDict,
		storage,
		debug: false,
	});

	const buffer = new Uint8Array(await result.blob.arrayBuffer());
	writeFileSync(outputPath, buffer);
	console.log(`Document is saved to ${outputPath} using sample ${sampleName}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
