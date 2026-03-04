#!/usr/bin/env node

const path = require("node:path");
const { performance } = require("node:perf_hooks");

const AnyLayout = require("../dist/AnyLayout");
const Defaults = require("../dist/Defaults");
const { FileStorage } = require("../dist/FileStorage");

const round = (n) => Math.round(n * 1000) / 1000;
const deepClone = (value) => JSON.parse(JSON.stringify(value));

const makeRng = (seed) => {
	let state = seed >>> 0;
	return () => {
		state = (1664525 * state + 1013904223) >>> 0;
		return state / 0x100000000;
	};
};

const randomInt = (rng, max) => Math.floor(rng() * max);

const updateItemFieldRandomly = (item, rng, suffix) => {
	const names = Object.keys(item.fields);
	if (names.length === 0) return false;
	const name = names[randomInt(rng, names.length)];
	const current = item.fields[name];
	if (!current || typeof current !== "object" || !("tag" in current)) return false;

	if (current.tag === "String") {
		item.fields[name] = {
			tag: "String",
			value: `${current.value} [mut-${suffix}] 😀 \`code\``,
		};
		return true;
	}
	if (current.tag === "Url") {
		item.fields[name] = {
			tag: "Url",
			value: {
				url: current.value.url,
				text: `${current.value.text} [mut-${suffix}]`,
			},
		};
		return true;
	}
	if (current.tag === "List") {
		const next = current.value.slice();
		next.push({ tag: "String", value: `Bullet ${suffix}` });
		item.fields[name] = { tag: "List", value: next };
		return true;
	}
	if (current.tag === "None") {
		item.fields[name] = { tag: "String", value: `Filled ${suffix}` };
		return true;
	}
	return false;
};

const applyRandomMutation = (resume, rng, step, idCounterRef) => {
	if (resume.sections.length === 0) return "noop";
	const section = resume.sections[randomInt(rng, resume.sections.length)];
	if (!section || section.items.length === 0) return "noop";
	const roll = rng();

	if (roll < 0.65) {
		const item = section.items[randomInt(rng, section.items.length)];
		const ok = updateItemFieldRandomly(item, rng, `${step}`);
		return ok ? "field-update" : "noop";
	}

	if (roll < 0.8 && section.items.length > 1) {
		const from = randomInt(rng, section.items.length);
		const to = randomInt(rng, section.items.length);
		if (from !== to) {
			const [item] = section.items.splice(from, 1);
			section.items.splice(to, 0, item);
			return "move-item";
		}
		return "noop";
	}

	if (roll < 0.9) {
		const source = section.items[randomInt(rng, section.items.length)];
		const cloned = deepClone(source);
		cloned.id = `bench-${idCounterRef.value++}`;
		updateItemFieldRandomly(cloned, rng, `${step}-copy`);
		section.items.push(cloned);
		return "add-item";
	}

	if (section.items.length > 1) {
		const idx = randomInt(rng, section.items.length);
		section.items.splice(idx, 1);
		return "delete-item";
	}

	return "noop";
};

const duplicateItem = (item, id) => {
	const next = deepClone(item);
	next.id = id;
	Object.keys(next.fields).forEach((name) => {
		const field = next.fields[name];
		if (field?.tag === "String") {
			next.fields[name] = {
				tag: "String",
				value: `${field.value}\nDetailed bullet with **markdown** and emoji :smile:`,
			};
		}
	});
	return next;
};

const buildLargeResume = (baseResume, sectionRepeats, itemRepeats) => {
	const resume = deepClone(baseResume);
	const sections = [];
	let idCounter = 0;

	for (let s = 0; s < sectionRepeats; s++) {
		for (const section of baseResume.sections) {
			const clonedSection = deepClone(section);
			clonedSection.section_name = `${section.section_name}-${s}`;
			clonedSection.items = [];
			for (let i = 0; i < itemRepeats; i++) {
				for (const item of section.items) {
					clonedSection.items.push(duplicateItem(item, `seed-${idCounter++}`));
				}
			}
			clonedSection.data.id = `header-${idCounter++}`;
			sections.push(clonedSection);
		}
	}

	resume.name = `${baseResume.name}-large-${sectionRepeats}x${itemRepeats}`;
	resume.sections = sections;
	return resume;
};

const makeComplexLayouts = (baseLayouts) => {
	const Stack = require("../dist/Stack");
	const Row = require("../dist/Row");
	const Width = require("../dist/Width");

	return baseLayouts.map((schema, index) => {
		const next = deepClone(schema);
		if (index === 0) return next;
		const originalItem = deepClone(next.item_layout_schema);
		next.item_layout_schema = Stack.from({
			width: Width.fill(),
			elements: [
				Row.from({
					width: Width.fill(),
					alignment: "Justified",
					elements: [deepClone(originalItem), deepClone(originalItem)],
				}),
				originalItem,
			],
		});
		return next;
	});
};

const normalizeForComparison = (value) => {
	if (value === null || value === undefined) return value;
	if (typeof value === "number") return round(value);
	if (typeof value !== "object") return value;
	if (Array.isArray(value)) return value.map(normalizeForComparison);

	if (
		"top_left" in value &&
		"bottom_right" in value &&
		value.top_left &&
		value.bottom_right
	) {
		return {
			top_left: normalizeForComparison(value.top_left),
			bottom_right: normalizeForComparison(value.bottom_right),
		};
	}

	const out = {};
	Object.keys(value)
		.sort()
		.forEach((k) => {
			out[k] = normalizeForComparison(value[k]);
		});
	return out;
};

const canonicalizeLayouts = (layouts) =>
	JSON.stringify(normalizeForComparison(layouts));

const withSuppressedRenderLogs = (fn) => {
	const originalLog = console.log;
	const originalInfo = console.info;
	const originalWarn = console.warn;
	const originalDebug = console.debug;
	console.log = () => {};
	console.info = () => {};
	console.warn = () => {};
	console.debug = () => {};
	try {
		return fn();
	} finally {
		console.log = originalLog;
		console.info = originalInfo;
		console.warn = originalWarn;
		console.debug = originalDebug;
	}
};

const renderWithTiming = (params) => {
	const start = performance.now();
	const layouts = withSuppressedRenderLogs(() => AnyLayout.render(params));
	return { ms: performance.now() - start, layouts };
};

const benchmarkScenario = ({
	name,
	initialResume,
	layoutSchemas,
	dataSchemas,
	resumeLayout,
	fontDict,
	storage,
	steps,
	seed,
}) => {
	console.log(`\n--- Scenario: ${name} ---`);
	AnyLayout.resetIncrementalCaches();

	const rng = makeRng(seed);
	let resume = deepClone(initialResume);
	const idCounterRef = { value: 1_000_000 };
	const fullTimes = [];
	const incrementalTimes = [];
	const mutationCounts = new Map();

	// Warm-up + first equivalence check.
	const baselineFull = renderWithTiming({
		resume: deepClone(resume),
		layout_schemas: layoutSchemas,
		data_schemas: dataSchemas,
		resume_layout: resumeLayout,
		bindings: new Map(),
		storage,
		fontDict,
		incremental: false,
	});
	const baselineIncremental = renderWithTiming({
		resume: deepClone(resume),
		layout_schemas: layoutSchemas,
		data_schemas: dataSchemas,
		resume_layout: resumeLayout,
		bindings: new Map(),
		storage,
		fontDict,
		incremental: true,
	});
	if (
		canonicalizeLayouts(baselineFull.layouts) !==
		canonicalizeLayouts(baselineIncremental.layouts)
	) {
		throw new Error(`equivalence failed at baseline for scenario "${name}"`);
	}

	for (let step = 0; step < steps; step++) {
		const mutation = applyRandomMutation(resume, rng, step, idCounterRef);
		mutationCounts.set(mutation, (mutationCounts.get(mutation) || 0) + 1);

		const full = renderWithTiming({
			resume: deepClone(resume),
			layout_schemas: layoutSchemas,
			data_schemas: dataSchemas,
			resume_layout: resumeLayout,
			bindings: new Map(),
			storage,
			fontDict,
			incremental: false,
		});
		const incremental = renderWithTiming({
			resume: deepClone(resume),
			layout_schemas: layoutSchemas,
			data_schemas: dataSchemas,
			resume_layout: resumeLayout,
			bindings: new Map(),
			storage,
			fontDict,
			incremental: true,
		});

		const fullCanon = canonicalizeLayouts(full.layouts);
		const incrementalCanon = canonicalizeLayouts(incremental.layouts);
		if (fullCanon !== incrementalCanon) {
			throw new Error(
				`equivalence failed at step ${step} (${mutation}) for scenario "${name}"`,
			);
		}

		fullTimes.push(full.ms);
		incrementalTimes.push(incremental.ms);
	}

	const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
	const ratio = avg(fullTimes) / avg(incrementalTimes);
	console.log(
		`full avg=${avg(fullTimes).toFixed(2)}ms | incremental avg=${avg(incrementalTimes).toFixed(2)}ms | speedup=${ratio.toFixed(2)}x`,
	);
	console.log(
		`mutations: ${Array.from(mutationCounts.entries())
			.map(([k, v]) => `${k}:${v}`)
			.join(", ")}`,
	);
};

const main = async () => {
	const storage = new FileStorage(
		path.join(__dirname, "..", "assets", "fonts") + path.sep,
	);
	const fontDict = new AnyLayout.FontDict();
	await fontDict.load_fonts(storage);

	const baseResume = deepClone(Defaults.DefaultResume);
	const baseLayouts = deepClone(Defaults.DefaultLayoutSchemas);
	const baseDataSchemas = deepClone(Defaults.DefaultDataSchemas);
	const baseResumeLayout = deepClone(Defaults.DefaultResumeLayout);
	const complexLayouts = makeComplexLayouts(baseLayouts);
	const profile = process.env.BENCH_PROFILE || "quick";

	const scenarios =
		profile === "full"
			? [
					{
						name: "default-medium",
						initialResume: baseResume,
						layoutSchemas: baseLayouts,
						dataSchemas: baseDataSchemas,
						resumeLayout: baseResumeLayout,
						steps: 120,
						seed: 42,
					},
					{
						name: "large-document",
						initialResume: buildLargeResume(baseResume, 4, 6),
						layoutSchemas: baseLayouts,
						dataSchemas: baseDataSchemas,
						resumeLayout: baseResumeLayout,
						steps: 180,
						seed: 2024,
					},
					{
						name: "complex-layout-large",
						initialResume: buildLargeResume(baseResume, 3, 5),
						layoutSchemas: complexLayouts,
						dataSchemas: baseDataSchemas,
						resumeLayout: baseResumeLayout,
						steps: 140,
						seed: 99,
					},
			  ]
			: [
					{
						name: "default-medium",
						initialResume: baseResume,
						layoutSchemas: baseLayouts,
						dataSchemas: baseDataSchemas,
						resumeLayout: baseResumeLayout,
						steps: 60,
						seed: 42,
					},
					{
						name: "large-document",
						initialResume: buildLargeResume(baseResume, 2, 3),
						layoutSchemas: baseLayouts,
						dataSchemas: baseDataSchemas,
						resumeLayout: baseResumeLayout,
						steps: 75,
						seed: 2024,
					},
					{
						name: "complex-layout-large",
						initialResume: buildLargeResume(baseResume, 2, 2),
						layoutSchemas: complexLayouts,
						dataSchemas: baseDataSchemas,
						resumeLayout: baseResumeLayout,
						steps: 50,
						seed: 99,
					},
			  ];

	console.log(`Running incremental benchmark profile="${profile}"`);

	for (const scenario of scenarios) {
		benchmarkScenario({
			...scenario,
			fontDict,
			storage,
		});
	}

	console.log("\nIncremental benchmark completed.");
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
