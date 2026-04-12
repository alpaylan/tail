const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const JSZip = require("jszip");

const packageRoot = path.resolve(__dirname, "..");
process.chdir(packageRoot);

const Defaults = require("../dist/Defaults");
const Margin = require("../dist/Margin");
const DocxLayout = require("../dist/DocxLayout");
const { FontDict } = require("../dist/AnyLayout");
const { FileStorage } = require("../dist/FileStorage");
const { LayoutSchema } = require("../dist/LayoutSchema");

async function openArchive(docxPath) {
	const data = fs.readFileSync(docxPath);
	return JSZip.loadAsync(data);
}

async function listArchiveEntries(docxPath) {
	const zip = await openArchive(docxPath);
	return Object.keys(zip.files);
}

async function readArchiveEntry(docxPath, entryPath) {
	const zip = await openArchive(docxPath);
	const entry = zip.file(entryPath);
	if (!entry) {
		throw new Error(`Missing archive entry: ${entryPath}`);
	}

	return entry.async("string");
}

async function createRenderContext() {
	const storage = new FileStorage("assets/fonts/");
	const fontDict = new FontDict();
	await fontDict.load_fonts(storage);
	return { storage, fontDict };
}

async function renderDocx(renderContext, overrides = {}) {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cvdl-docx-test-"));
	const outputPath = path.join(tmpDir, "output.docx");
	const props = {
		resume: Defaults.DefaultResume,
		data_schemas: Defaults.DefaultDataSchemas,
		layout_schemas: Defaults.DefaultLayoutSchemas,
		resume_layout: Defaults.DefaultResumeLayout,
		bindings: Defaults.DefaultBindings,
		fontDict: renderContext.fontDict,
		storage: renderContext.storage,
		...overrides,
	};

	const result = await DocxLayout.render(props);
	fs.writeFileSync(outputPath, Buffer.from(await result.blob.arrayBuffer()));
	return { tmpDir, outputPath };
}

function cleanupTemp({ tmpDir }) {
	fs.rmSync(tmpDir, { recursive: true, force: true });
}

function cloneDefaultResume() {
	return structuredClone(Defaults.DefaultResume);
}

function createMarginTestSchemas() {
	return Defaults.DefaultLayoutSchemas.map((schema) => {
		if (schema.schema_name !== "Work Experience") return schema;

		const itemLayout = {
			...schema.item_layout_schema,
			margin: Margin.margin(14, 18, 16, 24),
			elements: schema.item_layout_schema.elements.map((element, index) =>
				index === 1
					? { ...element, margin: Margin.margin(8, 12, 10, 0) }
					: element,
			),
		};

		return new LayoutSchema(
			schema.schema_name,
			schema.data_schema_name,
			schema.header_layout_schema,
			itemLayout,
		);
	});
}

async function testImageBackedEmoji(renderContext) {
	const resume = cloneDefaultResume();
	const workSection = resume.sections.find(
		(section) => section.section_name === "Work Experience",
	);
	assert.ok(workSection, "Expected default resume to contain Work Experience");

	workSection.items[0].fields.summary = {
		tag: "String",
		value: "Testing custom emoji :geyik: in markdown output",
	};

	const renderResult = await renderDocx(renderContext, { resume });

	try {
		const entries = await listArchiveEntries(renderResult.outputPath);
		const documentXml = await readArchiveEntry(
			renderResult.outputPath,
			"word/document.xml",
		);

		assert.ok(
			entries.some(
				(entry) =>
					entry.startsWith("word/media/") && entry.toLowerCase().endsWith(".png"),
			),
			"Expected DOCX to embed an emoji image under word/media/",
		);
		assert.ok(
			documentXml.includes("<w:drawing>"),
			"Expected DOCX document.xml to contain an inline drawing for emoji",
		);
		assert.ok(
			!documentXml.includes("WTF"),
			'Expected DOCX document.xml to avoid the internal "WTF" placeholder',
		);
	} finally {
		cleanupTemp(renderResult);
	}
}

async function testSemanticContainerMargins(renderContext) {
	const renderResult = await renderDocx(renderContext, {
		layout_schemas: createMarginTestSchemas(),
	});

	try {
		const documentXml = await readArchiveEntry(
			renderResult.outputPath,
			"word/document.xml",
		);

		assert.ok(
			documentXml.includes('w:before="280"'),
			"Expected stack top margin to become paragraph spacing before",
		);
		assert.ok(
			documentXml.includes('w:after="360"'),
			"Expected stack bottom margin to become paragraph spacing after",
		);
		assert.ok(
			documentXml.includes('<w:ind w:left="320"/>'),
			"Expected stack left margin to become paragraph indent",
		);
		assert.ok(
			documentXml.includes('<w:tblInd w:type="dxa" w:w="520"/>'),
			"Expected row and inherited left margins to become table indent",
		);
	} finally {
		cleanupTemp(renderResult);
	}
}

async function main() {
	const renderContext = await createRenderContext();
	const tests = [
		["embeds image-backed markdown emojis", testImageBackedEmoji],
		["preserves semantic stack and row margins", testSemanticContainerMargins],
	];

	for (const [name, testFn] of tests) {
		await testFn(renderContext);
		console.log(`PASS ${name}`);
	}

	console.log(`DOCX harness passed (${tests.length} checks)`);
}

main().catch((error) => {
	console.error("DOCX harness failed");
	console.error(error);
	process.exitCode = 1;
});
