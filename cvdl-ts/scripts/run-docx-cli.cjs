const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const cwd = path.resolve(__dirname, "..");
const tscPath = path.resolve(
	cwd,
	"..",
	"node_modules",
	"typescript",
	"bin",
	"tsc",
);
const docxCliPath = path.resolve(cwd, "dist", "docx-cli.js");

const compile = spawnSync(
	process.execPath,
	[tscPath, "-p", "tsconfig.json", "--noEmitOnError", "false"],
	{
		cwd,
		stdio: "inherit",
	},
);

if (!fs.existsSync(docxCliPath)) {
	process.exit(compile.status ?? 1);
}

if (compile.status && compile.status !== 0) {
	console.warn(
		"TypeScript reported errors, but emitted JS is available. Running docx CLI anyway.",
	);
}

const run = spawnSync(
	process.execPath,
	[docxCliPath, ...process.argv.slice(2)],
	{
		cwd,
		stdio: "inherit",
	},
);

process.exit(run.status ?? 0);
