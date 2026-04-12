// Use DOM as a backend for the CVDL layout engine.

import {
	ElementPath,
	FontDict,
	render as anyRender,
} from "cvdl-ts/dist/AnyLayout";
import * as Resume from "cvdl-ts/dist/Resume";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { ResumeLayout } from "cvdl-ts/dist/ResumeLayout";
import { Storage } from "cvdl-ts/dist/Storage";
import { Dispatch } from "react";
import { EditorAction, EditorState } from "@/components/State";
import { ColorMap } from "cvdl-ts/dist/Layout";
import { Font, Layout } from "cvdl-ts";
import * as Elem from "cvdl-ts/dist/Elem";
import { Box } from "cvdl-ts/dist/Box";

export type RenderResult = {
	blob: Blob;
	fontDict: FontDict;
};

export type RenderProps = {
	resume: Resume.t;
	data_schemas: DataSchema.t[];
	layout_schemas: LayoutSchema[];
	resume_layout: ResumeLayout;
	storage: Storage;
	bindings: Map<string, unknown>;
	fontDict: FontDict;
	debug: boolean;
	state: EditorState;
	dispatch: Dispatch<EditorAction>;
};

type Tracker = {
	page: number;
	pageContainer: HTMLElement;
	height: number;
	layout: ResumeLayout;
	sectionsByName: Map<string, Resume.ResumeSection.t>;
	fontDict: FontDict;
	state: EditorState;
	dispatch: Dispatch<EditorAction>;
	path: ElementPath | null;
	debug: boolean;
};

type DebugTag = "Section" | Layout.RenderedLayout["tag"];

type DebugNode = {
	id: string;
	parentId: string | null;
	tag: DebugTag;
	label: string;
	depth: number;
	x: number;
	yAbs: number;
	width: number;
	height: number;
	children: string[];
};

type DebugScene = {
	nodes: Map<string, DebugNode>;
	childrenByParent: Map<string, string[]>;
	rootIds: string[];
};

type DebugSceneBuilder = {
	nodes: Map<string, DebugNode>;
	childrenByParent: Map<string, string[]>;
	sectionOrder: string[];
	sectionBounds: Map<
		string,
		{ x1: number; y1: number; x2: number; y2: number }
	>;
};

const DEBUG_LABEL_WIDTH = 160;
const DEBUG_ZOOM_SCALE = 1.35;

const debugInteraction = {
	branch: [] as string[],
	hoverNodeId: null as string | null,
	scene: null as DebugScene | null,
};

const resetDebugInteraction = () => {
	debugInteraction.hoverNodeId = null;
	debugInteraction.branch = [];
	debugInteraction.scene = null;
};

const pathToSectionName = (path?: ElementPath): string => {
	if (!path || path.tag === "none") {
		return "Unscoped";
	}
	return path.section;
};

const resolveRenderPath = (
	layoutPath: ElementPath | undefined,
	trackerPath: ElementPath | null,
): ElementPath => {
	return layoutPath ?? trackerPath ?? { tag: "none" };
};

const isItemPath = (path: ElementPath) => {
	return path.tag === "item" || path.tag === "field";
};

type PreviewHighlightKind = "none" | "context" | "target" | "single";

const fieldGroupMatchesPath = (
	group: "header_schema" | "item_schema",
	path: ElementPath,
) => {
	if (group === "header_schema") {
		return path.tag === "section";
	}
	return isItemPath(path);
};

const getSectionForPath = (
	path: ElementPath,
	tracker: Tracker,
): Resume.ResumeSection.t | null => {
	if (path.tag === "none") {
		return null;
	}
	return tracker.sectionsByName.get(path.section) ?? null;
};

const isPreviewFocusMatch = (
	tracker: Tracker,
	path: ElementPath,
	element: Elem.t,
): PreviewHighlightKind => {
	const focus = tracker.state.previewFocus;
	if (!focus || focus.tag === "none") {
		return "none";
	}

	const section = getSectionForPath(path, tracker);
	if (!section) {
		return "none";
	}

	switch (focus.tag) {
		case "data-schema": {
			if (section.data_schema !== focus.schemaName) {
				return "none";
			}
			if (
				focus.handoffField &&
				element.item === focus.handoffField.fieldName &&
				fieldGroupMatchesPath(focus.handoffField.group, path)
			) {
				return "target";
			}
			return "context";
		}
		case "data-field":
			if (section.data_schema !== focus.schemaName) {
				return "none";
			}
			if (element.item !== focus.fieldName) {
				return "none";
			}
			if (fieldGroupMatchesPath(focus.group, path)) {
				return "single";
			}
			return "none";
		case "layout-schema":
			if (section.layout_schema !== focus.schemaName) {
				return "none";
			}
			const scopeMatches =
				focus.scope === "all"
					? true
					: focus.scope === "header_layout_schema"
						? path.tag === "section"
						: isItemPath(path);
			if (!scopeMatches) {
				return "none";
			}
			if (focus.handoffFieldName) {
				if (element.item === focus.handoffFieldName) {
					return "target";
				}
				return "context";
			}
			if (!focus.fieldNames || focus.fieldNames.length === 0) {
				return "single";
			}
			return focus.fieldNames.includes(element.item) ? "single" : "none";
	}
};

const getTopLevelNodeBaseId = (
	sectionNodeId: string,
	layout: Layout.RenderedLayout,
	fallbackIndex: number,
): string => {
	if (!layout.path) {
		return `${sectionNodeId}::block-${fallbackIndex}`;
	}
	switch (layout.path.tag) {
		case "section":
			return `${sectionNodeId}::header`;
		case "item":
			return `${sectionNodeId}::item-${layout.path.item}`;
		case "field":
			return `${sectionNodeId}::field-${layout.path.item}-${layout.path.field}`;
		case "none":
			return `${sectionNodeId}::block-${fallbackIndex}`;
	}
};

const getTopLevelNodeLabel = (layout: Layout.RenderedLayout): string => {
	if (!layout.path) {
		return layout.tag;
	}
	switch (layout.path.tag) {
		case "section":
			return `Header (${layout.tag})`;
		case "item":
			return `Item ${layout.path.item} (${layout.tag})`;
		case "field":
			return `Field ${layout.path.field} (${layout.tag})`;
		case "none":
			return layout.tag;
	}
};

const createDebugSceneBuilder = (): DebugSceneBuilder => ({
	nodes: new Map<string, DebugNode>(),
	childrenByParent: new Map<string, string[]>(),
	sectionOrder: [],
	sectionBounds: new Map<
		string,
		{ x1: number; y1: number; x2: number; y2: number }
	>(),
});

const ensureUniqueNodeId = (
	builder: DebugSceneBuilder,
	baseId: string,
): string => {
	if (!builder.nodes.has(baseId)) {
		return baseId;
	}
	let index = 1;
	while (builder.nodes.has(`${baseId}#${index}`)) {
		index += 1;
	}
	return `${baseId}#${index}`;
};

const addChildNode = (
	childrenByParent: Map<string, string[]>,
	parentId: string,
	childId: string,
) => {
	const children = childrenByParent.get(parentId);
	if (!children) {
		childrenByParent.set(parentId, [childId]);
		return;
	}
	children.push(childId);
};

const collectLayoutDebugTree = (
	builder: DebugSceneBuilder,
	layout: Layout.RenderedLayout,
	parentId: string,
	depth: number,
	flowOffset: number,
	nodeId: string,
	label: string,
): DebugNode | null => {
	if (!layout.bounding_box) {
		return null;
	}

	const x = layout.bounding_box.top_left.x;
	const yAbs = layout.bounding_box.top_left.y + flowOffset;
	const width = layout.bounding_box.width();
	const height = layout.bounding_box.height();
	if (width <= 0 || height <= 0) {
		return null;
	}

	const uniqueId = ensureUniqueNodeId(builder, nodeId);
	const node: DebugNode = {
		id: uniqueId,
		parentId,
		tag: layout.tag,
		label,
		depth,
		x,
		yAbs,
		width,
		height,
		children: [],
	};
	builder.nodes.set(uniqueId, node);
	addChildNode(builder.childrenByParent, parentId, uniqueId);

	if (layout.tag === "Stack" || layout.tag === "Row") {
		const elements =
			layout.tag === "Stack"
				? (layout as Layout.RenderedStack).elements
				: (layout as Layout.RenderedRow).elements;

		elements.forEach((child, index) => {
			const renderedChild = child as Layout.RenderedLayout;
			collectLayoutDebugTree(
				builder,
				renderedChild,
				uniqueId,
				depth + 1,
				flowOffset,
				`${uniqueId}/${renderedChild.tag.toLowerCase()}-${index}`,
				renderedChild.tag,
			);
		});
	}

	return node;
};

const collectTopLevelDebugNode = (
	builder: DebugSceneBuilder,
	layout: Layout.RenderedLayout,
	flowOffset: number,
	fallbackIndex: number,
) => {
	const sectionName = pathToSectionName(layout.path);
	const sectionNodeId = `section::${sectionName}`;
	if (!builder.nodes.has(sectionNodeId)) {
		builder.nodes.set(sectionNodeId, {
			id: sectionNodeId,
			parentId: null,
			tag: "Section",
			label: sectionName,
			depth: 0,
			x: 0,
			yAbs: 0,
			width: 0,
			height: 0,
			children: [],
		});
		builder.sectionOrder.push(sectionNodeId);
	}

	const topNodeBaseId = getTopLevelNodeBaseId(
		sectionNodeId,
		layout,
		fallbackIndex,
	);
	const topNode = collectLayoutDebugTree(
		builder,
		layout,
		sectionNodeId,
		1,
		flowOffset,
		topNodeBaseId,
		getTopLevelNodeLabel(layout),
	);
	if (!topNode) {
		return;
	}

	const existingBounds = builder.sectionBounds.get(sectionNodeId);
	const x1 = topNode.x;
	const y1 = topNode.yAbs;
	const x2 = topNode.x + topNode.width;
	const y2 = topNode.yAbs + topNode.height;
	if (!existingBounds) {
		builder.sectionBounds.set(sectionNodeId, { x1, y1, x2, y2 });
		return;
	}
	builder.sectionBounds.set(sectionNodeId, {
		x1: Math.min(existingBounds.x1, x1),
		y1: Math.min(existingBounds.y1, y1),
		x2: Math.max(existingBounds.x2, x2),
		y2: Math.max(existingBounds.y2, y2),
	});
};

const finalizeDebugScene = (
	builder: DebugSceneBuilder,
	resumeLayout: ResumeLayout,
): DebugScene => {
	for (const sectionNodeId of builder.sectionOrder) {
		const sectionNode = builder.nodes.get(sectionNodeId);
		const bounds = builder.sectionBounds.get(sectionNodeId);
		if (!sectionNode || !bounds) {
			continue;
		}
		sectionNode.x = 0;
		sectionNode.yAbs = bounds.y1;
		sectionNode.width =
			resumeLayout.width - resumeLayout.margin.left - resumeLayout.margin.right;
		sectionNode.height = bounds.y2 - bounds.y1;
	}

	for (const [id, node] of builder.nodes.entries()) {
		node.children = builder.childrenByParent.get(id) ?? [];
	}

	const rootIds = builder.sectionOrder.filter((id) => {
		const node = builder.nodes.get(id);
		return Boolean(node && node.height > 0 && node.width > 0);
	});

	return {
		nodes: builder.nodes,
		childrenByParent: builder.childrenByParent,
		rootIds,
	};
};

const reconcileDebugBranch = (scene: DebugScene) => {
	const nextBranch: string[] = [];
	let expectedParent: string | null = null;
	for (const nodeId of debugInteraction.branch) {
		const node = scene.nodes.get(nodeId);
		if (!node || node.parentId !== expectedParent) {
			break;
		}
		nextBranch.push(nodeId);
		expectedParent = nodeId;
	}
	debugInteraction.branch = nextBranch;

	if (
		debugInteraction.hoverNodeId &&
		!scene.nodes.has(debugInteraction.hoverNodeId)
	) {
		debugInteraction.hoverNodeId = null;
	}
};

const getPathToNode = (scene: DebugScene, nodeId: string): string[] => {
	const node = scene.nodes.get(nodeId);
	if (!node) {
		return [];
	}
	const path: string[] = [node.id];
	let parentId = node.parentId;
	while (parentId) {
		const parent = scene.nodes.get(parentId);
		if (!parent) {
			break;
		}
		path.push(parent.id);
		parentId = parent.parentId;
	}
	return path.reverse();
};

const deriveVisibleDebugNodes = (scene: DebugScene) => {
	const ancestors = new Set(debugInteraction.branch);
	let focusParentId: string | null =
		debugInteraction.branch.length > 0
			? debugInteraction.branch[debugInteraction.branch.length - 1]
			: null;
	let focusChildren =
		focusParentId === null
			? scene.rootIds
			: scene.childrenByParent.get(focusParentId) ?? [];

	if (focusChildren.length === 0 && focusParentId !== null) {
		const parentOfFocus = scene.nodes.get(focusParentId)?.parentId ?? null;
		focusChildren =
			parentOfFocus === null
				? scene.rootIds
				: scene.childrenByParent.get(parentOfFocus) ?? [];
	}

	const focusSet = new Set(focusChildren);
	const visibleSet = new Set<string>();
	focusChildren.forEach((id) => visibleSet.add(id));
	debugInteraction.branch.forEach((id) => visibleSet.add(id));

	return { ancestors, focusSet, visibleSet };
};

const clearExistingDebugOverlays = (container: HTMLElement) => {
	container
		.querySelectorAll(".cvdl-debug-overlay-layer")
		.forEach((element) => element.remove());
};

const contentAbsYToContainerY = (
	yAbs: number,
	layout: ResumeLayout,
): number => {
	const contentHeight =
		layout.height - layout.margin.top - layout.margin.bottom;
	if (contentHeight <= 0) {
		return yAbs;
	}
	const page = Math.floor(yAbs / contentHeight);
	const yInContent = yAbs % contentHeight;
	return page * layout.height + layout.margin.top + yInContent;
};

const getFocusedSectionNode = (scene: DebugScene): DebugNode | null => {
	if (debugInteraction.branch.length === 0) {
		return null;
	}
	const first = scene.nodes.get(debugInteraction.branch[0]);
	if (first && first.tag === "Section") {
		return first;
	}
	const hovered = debugInteraction.hoverNodeId
		? scene.nodes.get(debugInteraction.hoverNodeId)
		: null;
	if (!hovered) {
		return null;
	}
	let current: DebugNode | undefined = hovered;
	while (current) {
		if (current.tag === "Section") {
			return current;
		}
		if (!current.parentId) {
			return null;
		}
		current = scene.nodes.get(current.parentId);
	}
	return null;
};

const resetFocusZoom = (container: HTMLElement) => {
	container.style.transform = "none";
	container.style.transformOrigin = "";
	container.style.transition = "";
	container.style.willChange = "";
};

const applyFocusZoom = (
	container: HTMLElement,
	tracker: Tracker,
	scene: DebugScene,
) => {
	const focusedSection = getFocusedSectionNode(scene);
	if (!focusedSection) {
		resetFocusZoom(container);
		return;
	}
	const viewport = container.parentElement;
	if (!viewport) {
		resetFocusZoom(container);
		return;
	}

	const top = contentAbsYToContainerY(focusedSection.yAbs, tracker.layout);
	const bottom = contentAbsYToContainerY(
		focusedSection.yAbs + focusedSection.height,
		tracker.layout,
	);
	const centerX =
		tracker.layout.margin.left + focusedSection.x + focusedSection.width / 2;
	const centerY = (top + bottom) / 2;

	const cx = viewport.clientWidth / 2;
	const cy = viewport.clientHeight / 2;
	const tx = cx - DEBUG_ZOOM_SCALE * centerX;
	const ty = cy - DEBUG_ZOOM_SCALE * centerY;

	container.style.transformOrigin = "0 0";
	container.style.transition = "transform 180ms ease-out";
	container.style.willChange = "transform";
	container.style.transform = `translate(${tx}px, ${ty}px) scale(${DEBUG_ZOOM_SCALE})`;
};

const splitNodeToPageSegments = (
	scene: DebugScene,
	node: DebugNode,
	layout: ResumeLayout,
): Array<{
	page: number;
	left: number;
	top: number;
	width: number;
	height: number;
}> => {
	const contentHeight =
		layout.height - layout.margin.top - layout.margin.bottom;
	if (contentHeight <= 0) {
		return [];
	}

	// Keep child overlays visually inside their parent's bounds.
	let x1 = node.x;
	let y1 = node.yAbs;
	let x2 = node.x + node.width;
	let y2 = node.yAbs + node.height;
	if (node.parentId) {
		const parent = scene.nodes.get(node.parentId);
		if (parent) {
			x1 = Math.max(x1, parent.x);
			y1 = Math.max(y1, parent.yAbs);
			x2 = Math.min(x2, parent.x + parent.width);
			y2 = Math.min(y2, parent.yAbs + parent.height);
		}
	}
	if (x2 <= x1 || y2 <= y1) {
		return [];
	}

	const segments: Array<{
		page: number;
		left: number;
		top: number;
		width: number;
		height: number;
	}> = [];
	let remaining = y2 - y1;
	let consumed = 0;
	while (remaining > 0) {
		const currentAbsY = y1 + consumed;
		const page = Math.floor(currentAbsY / contentHeight);
		const yInContent = currentAbsY % contentHeight;
		const segmentHeight = Math.min(remaining, contentHeight - yInContent);
		segments.push({
			page,
			left: x1 + layout.margin.left,
			top: yInContent + layout.margin.top,
			width: x2 - x1,
			height: segmentHeight,
		});
		remaining -= segmentHeight;
		consumed += segmentHeight;
	}

	return segments;
};

const DEBUG_COLORS: Record<
	DebugTag,
	{ border: string; fill: string; labelBg: string; labelText: string }
> = {
	Section: {
		border: "rgba(147, 51, 234, 0.75)",
		fill: "rgba(147, 51, 234, 0.08)",
		labelBg: "rgba(243, 232, 255, 0.95)",
		labelText: "#6b21a8",
	},
	Stack: {
		border: "rgba(37, 99, 235, 0.75)",
		fill: "rgba(37, 99, 235, 0.08)",
		labelBg: "rgba(219, 234, 254, 0.95)",
		labelText: "#1e40af",
	},
	Row: {
		border: "rgba(5, 150, 105, 0.75)",
		fill: "rgba(5, 150, 105, 0.08)",
		labelBg: "rgba(209, 250, 229, 0.95)",
		labelText: "#065f46",
	},
	Elem: {
		border: "rgba(202, 138, 4, 0.8)",
		fill: "rgba(250, 204, 21, 0.08)",
		labelBg: "rgba(254, 249, 195, 0.95)",
		labelText: "#854d0e",
	},
};

const renderDebugOverlays = (
	container: HTMLElement,
	tracker: Tracker,
	scene: DebugScene,
) => {
	clearExistingDebugOverlays(container);
	if (scene.rootIds.length === 0) {
		return;
	}

	const { ancestors, focusSet, visibleSet } = deriveVisibleDebugNodes(scene);
	const pageLayers = new Map<number, HTMLElement>();
	const getOverlayLayer = (page: number): HTMLElement => {
		const existing = pageLayers.get(page);
		if (existing) {
			return existing;
		}
		const pageContainer = getPageContainer(page, tracker);
		const overlay = document.createElement("div");
		overlay.className = "cvdl-debug-overlay-layer";
		overlay.style.cssText = `
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			pointer-events: auto;
			background: transparent;
			z-index: 60;
		`;
		overlay.addEventListener("click", (event) => {
			// Click on empty overlay space steps one level up.
			if (event.target !== overlay) {
				return;
			}
			if (debugInteraction.branch.length === 0) {
				return;
			}
			debugInteraction.branch = debugInteraction.branch.slice(0, -1);
			renderDebugOverlays(container, tracker, scene);
			applyFocusZoom(container, tracker, scene);
		});
		pageContainer.appendChild(overlay);
		pageLayers.set(page, overlay);
		return overlay;
	};

	const onNodeClick = (nodeId: string) => {
		if (debugInteraction.scene !== scene) {
			return;
		}
		const node = scene.nodes.get(nodeId);
		if (!node || node.children.length === 0) {
			return;
		}
		const path = getPathToNode(scene, nodeId);
		if (path.length === 0) {
			return;
		}
		debugInteraction.branch = path;
		renderDebugOverlays(container, tracker, scene);
		applyFocusZoom(container, tracker, scene);
	};

	const labelDrawn = new Set<string>();
	for (const nodeId of visibleSet) {
		const node = scene.nodes.get(nodeId);
		if (!node) {
			continue;
		}
		const segments = splitNodeToPageSegments(scene, node, tracker.layout);
		const isFocusNode = focusSet.has(nodeId);
		const isAncestorNode = ancestors.has(nodeId);
		const isOpenable = node.children.length > 0;
		const colors = DEBUG_COLORS[node.tag];
		const borderWidth = Math.max(1, 3 - Math.min(node.depth, 2));

		for (const segment of segments) {
			const overlay = getOverlayLayer(segment.page);
			const box = document.createElement("div");
			box.dataset.debugNodeId = nodeId;
			const idleFill = isFocusNode ? colors.fill : "rgba(0, 0, 0, 0.01)";
			const idleBorderColor = colors.border;
			box.style.cssText = `
					position: absolute;
					left: ${segment.left}px;
					top: ${segment.top}px;
					width: ${Math.max(1, segment.width)}px;
					height: ${Math.max(1, segment.height)}px;
					border: ${borderWidth}px ${isAncestorNode ? "dashed" : "solid"} ${idleBorderColor};
					background: ${idleFill};
					box-sizing: border-box;
					pointer-events: auto;
					cursor: ${isOpenable ? "pointer" : "default"};
					transition: background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
					z-index: ${100 + node.depth};
				`;
			box.addEventListener("mouseenter", () => {
				debugInteraction.hoverNodeId = nodeId;
				if (!isOpenable) {
					return;
				}
				box.style.background = colors.fill;
				box.style.borderColor = colors.labelText;
				box.style.boxShadow = `0 0 0 1px ${colors.labelText} inset`;
			});
			box.addEventListener("mouseleave", () => {
				if (debugInteraction.hoverNodeId === nodeId) {
					debugInteraction.hoverNodeId = null;
				}
				box.style.background = idleFill;
				box.style.borderColor = idleBorderColor;
				box.style.boxShadow = "none";
			});
			box.addEventListener("click", (event) => {
				event.stopPropagation();
				onNodeClick(nodeId);
			});
			overlay.appendChild(box);

			if (!labelDrawn.has(nodeId)) {
				let labelLeft = segment.left + segment.width + 6;
				const maxLabelRight =
					tracker.layout.width - tracker.layout.margin.right;
				if (labelLeft + DEBUG_LABEL_WIDTH > maxLabelRight) {
					labelLeft = Math.max(
						tracker.layout.margin.left,
						segment.left - DEBUG_LABEL_WIDTH - 6,
					);
				}
				const labelTop = Math.max(tracker.layout.margin.top, segment.top - 15);
				const label = document.createElement("div");
				label.innerText = `${node.label} d${node.depth}${isOpenable ? "  >" : ""}`;
				label.style.cssText = `
					position: absolute;
					left: ${labelLeft}px;
					top: ${labelTop}px;
					max-width: ${DEBUG_LABEL_WIDTH}px;
					font-family: monospace;
					font-size: 10px;
					padding: 1px 4px;
					border-radius: 4px;
					border: 1px solid ${colors.border};
					color: ${colors.labelText};
					background: ${colors.labelBg};
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					pointer-events: none;
					z-index: ${120 + node.depth};
				`;
				overlay.appendChild(label);
				labelDrawn.add(nodeId);
			}
		}
	}
};

const getPageContainer = (page: number, tracker: Tracker) => {
	if (document.getElementById(`page-${page}`)) {
		return document.getElementById(`page-${page}`)!;
	}

	const pageContainer = document.createElement("div");
	pageContainer.id = `page-${page}`;
	pageContainer.style.cssText = `
		position: relative;
		width: ${tracker.layout.width}px;
		height: ${tracker.layout.height}px;
		border: ${tracker.debug ? "2px solid #2563eb" : "1px solid black"};
	`;
	if (tracker.debug) {
		const debugBadge = document.createElement("div");
		debugBadge.innerText = "DEBUG";
		debugBadge.style.cssText = `
			position: absolute;
			right: 6px;
			top: 6px;
			font-size: 10px;
			font-family: monospace;
			color: #1d4ed8;
			background: rgba(219, 234, 254, 0.9);
			padding: 2px 4px;
			border: 1px solid #93c5fd;
			border-radius: 4px;
			pointer-events: none;
			z-index: 50;
		`;
		pageContainer.appendChild(debugBadge);
	}
	document.getElementById("pdf-container")!.appendChild(pageContainer);
	return pageContainer;
};

export const render = ({
	resume,
	data_schemas,
	layout_schemas,
	resume_layout,
	storage,
	bindings,
	fontDict,
	state,
	dispatch,
	debug = false,
}: RenderProps) => {
	const container = document.getElementById("pdf-container")!;
	container.innerHTML = "";

	const startTime = Date.now();
	const layouts = anyRender({
		layout_schemas,
		resume,
		bindings,
		data_schemas,
		resume_layout,
		storage,
		fontDict,
	});
	const endTime = Date.now();
	console.info(`Rendering time: ${endTime - startTime}ms`);

	try {
		for (const [font_name, font] of fontDict.fonts.entries()) {
			// @ts-ignore
			document.fonts.add(new FontFace(font_name, font.stream.buffer));
		}
	} catch (e) {
		console.error(e);
	}

	const tracker: Tracker = {
		page: 0,
		path: null,
		pageContainer: container,
		height: 0,
		sectionsByName: new Map(
			resume.sections.map((section) => [section.section_name, section]),
		),
		state,
		dispatch,
		layout: resume_layout,
		fontDict,
		debug,
	};
	tracker.pageContainer = getPageContainer(tracker.page, tracker);

	const debugBuilder = debug ? createDebugSceneBuilder() : null;

	layouts.forEach((layout, index) => {
		const flowOffset = layout.flow_offset_y ?? tracker.height;
		if (debugBuilder) {
			collectTopLevelDebugNode(debugBuilder, layout, flowOffset, index);
		}

		renderSectionLayout(layout, { ...tracker, height: flowOffset });
		if (layout.flow_offset_y === undefined) {
			tracker.height +=
				layout.bounding_box!.height() +
				layout.margin.top +
				layout.margin.bottom;
		}
	});

	if (debugBuilder) {
		const scene = finalizeDebugScene(debugBuilder, resume_layout);
		debugInteraction.scene = scene;
		reconcileDebugBranch(scene);
		renderDebugOverlays(container, tracker, scene);
		applyFocusZoom(container, tracker, scene);
	} else {
		clearExistingDebugOverlays(container);
		resetDebugInteraction();
		resetFocusZoom(container);
	}
};

export const mergeSpans = (spans: Elem.Span[]): Elem.Span[] => {
	if (spans.length === 0) {
		return [];
	}

	const firstSpan = spans[0];
	if (!firstSpan) {
		return [];
	}

	const merged_spans: Elem.Span[] = [];
	let currentSpan = firstSpan;
	for (let i = 1; i < spans.length; i++) {
		const nextSpan = spans[i];
		if (!nextSpan) {
			continue;
		}
		const hasBothBBoxes = Boolean(currentSpan.bbox && nextSpan.bbox);
		if (
			hasBothBBoxes &&
			currentSpan.bbox!.top_left.y === nextSpan.bbox!.top_left.y &&
			currentSpan.font === nextSpan.font &&
			currentSpan.is_code === nextSpan.is_code &&
			currentSpan.is_bold === nextSpan.is_bold &&
			currentSpan.is_italic === nextSpan.is_italic &&
			currentSpan.is_emoji === nextSpan.is_emoji &&
			currentSpan.emoji_url === nextSpan.emoji_url
		) {
			currentSpan = {
				...currentSpan,
				text: currentSpan.text + nextSpan.text,
				bbox:
					currentSpan.bbox && nextSpan.bbox
						? new Box(currentSpan.bbox.top_left, nextSpan.bbox.bottom_right)
						: currentSpan.bbox,
			};
		} else {
			merged_spans.push(currentSpan);
			currentSpan = nextSpan;
		}
	}
	merged_spans.push(currentSpan);
	return merged_spans;
};

export const renderSectionLayout = (
	layout: Layout.RenderedLayout,
	tracker: Tracker,
) => {
	switch (layout.tag) {
		case "Stack": {
			const stack = layout as Layout.RenderedStack;
			for (const elem of stack.elements) {
				renderSectionLayout(elem, {
					...tracker,
					path: layout.path ?? tracker.path,
				});
			}
			break;
		}
		case "Row": {
			const row = layout as Layout.RenderedRow;
			for (const elem of row.elements) {
				renderSectionLayout(elem, {
					...tracker,
					path: layout.path ?? tracker.path,
				});
			}
			break;
		}
		case "Elem": {
			const element = layout as Elem.t;
			if (!layout.bounding_box) {
				return;
			}

			const spans =
				element.alignment === "Justified"
					? element.spans!
					: mergeSpans(element.spans!);
			const renderPath = resolveRenderPath(layout.path, tracker.path);
			const highlightKind = isPreviewFocusMatch(tracker, renderPath, element);
			const baseBackgroundColor =
				highlightKind === "target"
					? "rgba(216, 180, 254, 0.72)"
					: highlightKind === "context" || highlightKind === "single"
						? "rgba(186, 230, 253, 0.65)"
						: ColorMap[element.background_color];
			const hoverBackgroundColor =
				highlightKind === "target"
					? "rgba(192, 132, 252, 0.88)"
					: highlightKind === "context" || highlightKind === "single"
						? "rgba(125, 211, 252, 0.85)"
						: "lightgray";
			const previewOutline =
				highlightKind === "target"
					? "0 0 0 1px rgba(126, 34, 206, 0.92)"
					: highlightKind === "context" || highlightKind === "single"
						? "0 0 0 1px rgba(3, 105, 161, 0.75)"
						: "none";

			spans.forEach((span) => {
				if (
					!span ||
					(!span.is_emoji &&
						(span.text === "" ||
							span.text === " " ||
							span.text === "\n" ||
							span.text === "\n\n"))
				) {
					return;
				}

				const absoluteY =
					layout.bounding_box.top_left.y +
					tracker.height +
					span.bbox!.top_left.y;
				const page = Math.floor(
					absoluteY /
						(tracker.layout.height -
							tracker.layout.margin.top -
							tracker.layout.margin.bottom),
				);
				const currentPageY =
					absoluteY %
					(tracker.layout.height -
						tracker.layout.margin.top -
						tracker.layout.margin.bottom);
				const y = currentPageY + tracker.layout.margin.top;
				const x =
					layout.bounding_box.top_left.x +
					tracker.layout.margin.left +
					span.bbox!.top_left.x;

				const selectPath = () => {
					const path = renderPath;
					if (path.tag === "section") {
						tracker.dispatch({ type: "set-editor-path", path: { ...path } });
						return;
					}
					if (path.tag === "item") {
						tracker.dispatch({
							type: "set-editor-path",
							path: { ...path, tag: "field", field: element.item },
						});
						return;
					}
					if (path.tag === "field") {
						tracker.dispatch({
							type: "set-editor-path",
							path: { ...path },
						});
						return;
					}
					console.error("Cannot path to item", tracker.path, element.item);
				};

				tracker.pageContainer = getPageContainer(page, tracker);
				const spanElem = document.createElement("span");
				if (span.is_emoji && span.emoji_url) {
					const imgElem = document.createElement("img");
					const imgSize = span.font!.size * 1.6;
					imgElem.src = span.emoji_url;
					imgElem.style.cssText = `
						position: absolute;
						left: ${x}px;
						top: ${y - span.font!.size * 0.2}px;
						width: ${imgSize}px;
						height: ${imgSize}px;
						box-shadow: ${previewOutline};
						cursor: pointer;
						z-index: 2;
					`;
					imgElem.addEventListener("mouseenter", () => {
						imgElem.style.boxShadow = "0 0 0 1px rgba(3, 105, 161, 1)";
					});
					imgElem.addEventListener("mouseleave", () => {
						imgElem.style.boxShadow = previewOutline;
					});
					imgElem.addEventListener("click", (e) => {
						e.stopPropagation();
						selectPath();
					});
					tracker.pageContainer.appendChild(imgElem);
					return;
				}

				spanElem.innerText = span.text;
				spanElem.style.cssText = `
					position: absolute;
					left: ${x}px;
					top: ${y}px;
					font-family: "${Font.full_name(span.font!)}", sans-serif;
					font-size: ${span.font!.size}px;
					font-style: ${span.font!.style};
					font-weight: ${span.font!.weight};
					background-color: ${baseBackgroundColor};
					box-shadow: ${previewOutline};
					z-index: 2;
				`;

				spanElem.addEventListener("mouseover", () => {
					spanElem.style.backgroundColor = hoverBackgroundColor;
					spanElem.style.cursor = "pointer";
				});

				spanElem.addEventListener("mouseout", () => {
					spanElem.style.backgroundColor = baseBackgroundColor;
					spanElem.style.animation = "none";
					spanElem.style.boxShadow = previewOutline;
				});

				spanElem.addEventListener("click", (e) => {
					e.stopPropagation();
					selectPath();
				});

				spanElem.addEventListener("contextmenu", (e) => {
					e.stopPropagation();
					e.preventDefault();
					console.error("settings");
				});

				if (span.is_code) {
					const roundedRectangleElem = document.createElement("div");
					roundedRectangleElem.style.cssText = `
						position: absolute;
						left: ${x - span.font!.size / 5}px;
						top: ${y}px;
						width: ${span.bbox!.width() + (span.font!.size / 5) * 2}px;
						height: ${span.bbox!.height()}px;
						border-radius: 5px;
						border: 1px solid black;
						background-color: rgba(0, 0, 0, 0.05);
					`;
					tracker.pageContainer.appendChild(roundedRectangleElem);
				}

				if (element.url) {
					const urlElem = document.createElement("a");
					urlElem.style.cssText = `
						position: absolute;
						left: ${x - span.font!.size / 5}px;
						top: ${y}px;
						width: ${span.bbox!.width() + (span.font!.size / 5) * 2}px;
						height: ${span.bbox!.height()}px;
						border: 1px solid lightblue;
						z-index: 3;
					`;
					urlElem.href = element.url;
					tracker.pageContainer.appendChild(urlElem);
				}

				tracker.pageContainer.appendChild(spanElem);
			});
			break;
		}
	}
};
