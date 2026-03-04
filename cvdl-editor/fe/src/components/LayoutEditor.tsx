"use client";
import { EditorContext, DocumentDispatchContext } from "@/components/State";
import * as Alignment from "cvdl-ts/dist/Alignment";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
import { FontStyle, FontWeight } from "cvdl-ts/dist/Font";
import { Color, ColorMap } from "cvdl-ts/dist/Layout";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { LocalStorage } from "cvdl-ts/dist/LocalStorage";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import * as Layout from "cvdl-ts/dist/Layout";
import * as Elem from "cvdl-ts/dist/Elem";
import * as Stack from "cvdl-ts/dist/Stack";
import * as Row from "cvdl-ts/dist/Row";
import * as Resume from "cvdl-ts/dist/Resume";

type LensStep =
	| {
			attribute: string;
	  }
	| {
			index: number;
	  };

type Lens = LensStep[];

const focusScopeFromLens = (
	lens: Lens | null,
): "all" | "header_layout_schema" | "item_layout_schema" => {
	const firstStep = lens?.[0];
	if (firstStep && "attribute" in firstStep) {
		if (firstStep.attribute === "header_layout_schema") {
			return "header_layout_schema";
		}
		if (firstStep.attribute === "item_layout_schema") {
			return "item_layout_schema";
		}
	}
	return "all";
};

const lensForLayoutScope = (
	scope: "all" | "header_layout_schema" | "item_layout_schema",
): Lens | null => {
	if (scope === "header_layout_schema") {
		return [{ attribute: "header_layout_schema" }];
	}
	if (scope === "item_layout_schema") {
		return [{ attribute: "item_layout_schema" }];
	}
	return null;
};

const lensForDataFieldGroup = (
	group: "header_schema" | "item_schema",
): Lens => {
	return group === "header_schema"
		? [{ attribute: "header_layout_schema" }]
		: [{ attribute: "item_layout_schema" }];
};

const schemaGroupFromLens = (lens: Lens): "header_schema" | "item_schema" => {
	const firstStep = lens[0];
	if (firstStep && "attribute" in firstStep) {
		return firstStep.attribute === "header_layout_schema"
			? "header_schema"
			: "item_schema";
	}
	return "item_schema";
};

const findFieldLensInLayout = (
	layout: Layout.t,
	baseLens: Lens,
	fieldName: string,
): Lens | null => {
	if (layout.tag === "Elem") {
		return layout.is_ref && layout.item === fieldName ? baseLens : null;
	}
	for (let index = 0; index < layout.elements.length; index += 1) {
		const child = layout.elements[index];
		const childLens = findFieldLensInLayout(
			child,
			[...baseLens, { index }],
			fieldName,
		);
		if (childLens) {
			return childLens;
		}
	}
	return null;
};

const resolveFieldLensForLayoutSchema = (
	layoutSchema: LayoutSchema,
	group: "header_schema" | "item_schema",
	fieldName: string,
): Lens => {
	const rootLens = lensForDataFieldGroup(group);
	const rootLayout =
		group === "header_schema"
			? layoutSchema.header_layout_schema
			: layoutSchema.item_layout_schema;
	return findFieldLensInLayout(rootLayout, rootLens, fieldName) ?? rootLens;
};

const followLens = (lens: Lens, obj: any) => {
	return lens.reduce((acc, step) => {
		if ("attribute" in step) {
			return acc[step.attribute];
		} else {
			return acc.elements[step.index];
		}
	}, obj);
};

const rowPercentWidthTotal = (row: Row.t): number =>
	row.elements.reduce(
		(sum, child) =>
			sum + (child.width.tag === "Percent" ? child.width.value : 0),
		0,
	);

const collectReferencedFields = (layout: Layout.PreBindingLayout): string[] => {
	const fields = new Set<string>();
	const walk = (node: Layout.PreBindingLayout) => {
		if (node.tag === "Elem") {
			if (node.is_ref && typeof node.item === "string") {
				fields.add(node.item);
			}
			return;
		}
		node.elements.forEach((child) => walk(child as Layout.PreBindingLayout));
	};
	walk(layout);
	return [...fields];
};

type LayoutVisitorStep = "down" | "up" | "next" | "prev";
type LayoutVisitor = LayoutVisitorStep[];
const layoutFollowLens = (lens: LayoutVisitor, layout: Layout.t) => {
	let current = layout;
	let parents = [];

	for (let step of lens) {
		switch (step) {
			case "down": {
				if (current.tag === "Elem") {
					throw new Error("Cannot go down from Elem");
				}
				parents.push(current);
				current = current.elements[0];
				break;
			}
			case "up": {
				let parent = parents.pop();
				if (parent === undefined) {
					throw new Error("Cannot go up from root");
				}
				current = parent;
				break;
			}
			case "next": {
				let parent = parents.pop();
				if (parent === undefined) {
					throw new Error("Cannot go next from root");
				}
				let index = (parent as Layout.Container).elements.indexOf(current);
				if (index === -1) {
					throw new Error("Cannot find current element in parent");
				}
				if (index === (parent as Layout.Container).elements.length - 1) {
					throw new Error("Cannot go next from last element");
				}
				current = (parent as Layout.Container).elements[index + 1];
				break;
			}
			case "prev":
				let parent = parents.pop();
				if (parent === undefined) {
					throw new Error("Cannot go prev from root");
				}
				let index = (parent as Layout.Container).elements.indexOf(current);
				if (index === -1) {
					throw new Error("Cannot find current element in parent");
				}
				if (index === 0) {
					throw new Error("Cannot go prev from first element");
				}
				current = (parent as Layout.Container).elements[index - 1];
				break;
		}
	}
};

const ControlPanel = (props: {
	layout: Layout.t;
	layoutSchema: LayoutSchema;
	dataSchema: DataSchema.t | null;
	setLayout: any;
	lens: Lens;
	setLens: (lens: Lens) => void;
}) => {
	const current = followLens(props.lens, props.layoutSchema);
	switch (current.tag) {
		case "Row":
			return (
				<ContainerControlPanel
					current={current}
					layout={props.layout}
					layoutSchema={props.layoutSchema}
					dataSchema={props.dataSchema}
					setLayout={props.setLayout}
					lens={props.lens}
					setLens={props.setLens}
				/>
			);
		case "Stack":
			return (
				<ContainerControlPanel
					current={current}
					layout={props.layout}
					layoutSchema={props.layoutSchema}
					dataSchema={props.dataSchema}
					setLayout={props.setLayout}
					lens={props.lens}
					setLens={props.setLens}
				/>
			);
		case "Elem":
			return (
				<ElemControlPanel
					current={current}
					layout={props.layout}
					layoutSchema={props.layoutSchema}
					setLayout={props.setLayout}
					lens={props.lens}
					setLens={props.setLens}
				/>
			);
		default:
			return <p>Unknown tag</p>;
	}
};

const ContainerControlPanel = (props: {
	current: Layout.t;
	layout: Layout.t;
	layoutSchema: LayoutSchema;
	dataSchema: DataSchema.t | null;
	setLayout: any;
	lens: Lens;
	setLens: (lens: Lens) => void;
}) => {
	const [newElement, setNewElement] = useState<string>("");
	const [newRefField, setNewRefField] = useState<string>("");
	const container = props.current as Layout.Container;
	const [marginLeft, setMarginLeft] = useState(container.margin.left);
	const [marginRight, setMarginRight] = useState(container.margin.right);
	const [marginTop, setMarginTop] = useState(container.margin.top);
	const [marginBottom, setMarginBottom] = useState(container.margin.bottom);
	const [selectedElementIndices, setSelectedElementIndices] = useState<number[]>(
		[],
	);
	const selectedIndices = [...selectedElementIndices].sort((a, b) => a - b);
	const isSelectionContiguous =
		selectedIndices.length <= 1 ||
		selectedIndices.every((index, i) =>
			i === 0 ? true : index === selectedIndices[i - 1] + 1,
		);
	const isRootContainer =
		props.lens.length === 1 &&
		"attribute" in props.lens[0] &&
		(props.lens[0].attribute === "header_layout_schema" ||
			props.lens[0].attribute === "item_layout_schema");

	const replaceCurrentContainer = (nextContainer: Layout.Container) => {
		if (isRootContainer) {
			const rootStep = props.lens[0] as { attribute: string };
			(props.layoutSchema as any)[rootStep.attribute] = nextContainer;
			props.setLayout(props.layout);
			return;
		}
		const parentLens = props.lens.slice(0, -1);
		const parent = followLens(parentLens, props.layoutSchema) as Layout.Container;
		const currentStep = props.lens[props.lens.length - 1];
		if (!currentStep || !("index" in currentStep)) {
			return;
		}
		parent.elements[currentStep.index] = nextContainer;
		props.setLayout(props.layout);
	};

	const convertContainerType = (nextTag: "Row" | "Stack") => {
		if (container.tag === nextTag) {
			return;
		}
		const nextContainer: Layout.Container =
			nextTag === "Row"
				? {
						...Row.default_(),
						elements: container.elements,
						margin: container.margin,
						alignment: container.alignment,
						width: container.width,
						is_fill: container.is_fill,
						is_frozen:
							container.tag === "Row"
								? (container as Row.t).is_frozen
								: false,
				  }
				: {
						...Stack.default_(),
						elements: container.elements,
						margin: container.margin,
						alignment: container.alignment,
						width: container.width,
						is_fill: container.is_fill,
				  };
		replaceCurrentContainer(nextContainer);
	};

	const dissolveContainer = () => {
		if (isRootContainer) {
			return;
		}
		const parentLens = props.lens.slice(0, -1);
		const parent = followLens(parentLens, props.layoutSchema) as Layout.Container;
		const currentStep = props.lens[props.lens.length - 1];
		if (!currentStep || !("index" in currentStep)) {
			return;
		}
		const replaceIndex = currentStep.index;
		parent.elements.splice(replaceIndex, 1, ...container.elements);
		props.setLayout(props.layout);
		if (container.elements.length > 0) {
			props.setLens([...parentLens, { index: replaceIndex }]);
		} else {
			props.setLens(parentLens);
		}
	};

	const wrapSelectedElements = (tag: "Row" | "Stack") => {
		if (selectedIndices.length === 0) {
			return;
		}
		if (!isSelectionContiguous) {
			alert("Please select contiguous sibling elements to wrap.");
			return;
		}
		const startIndex = selectedIndices[0];
		const wrappedElements = selectedIndices.map(
			(index) => container.elements[index],
		);
		const wrapper: Layout.Container =
			tag === "Row" ? Row.default_() : Stack.default_();
		wrapper.elements = wrappedElements;
		container.elements.splice(startIndex, wrappedElements.length, wrapper);
		setSelectedElementIndices([]);
		props.setLayout(props.layout);
		props.setLens([...props.lens, { index: startIndex }]);
	};
	const fieldNames = (() => {
		if (!props.dataSchema) {
			return [];
		}
		const group = schemaGroupFromLens(props.lens);
		const fields =
			group === "header_schema"
				? props.dataSchema.header_schema
				: props.dataSchema.item_schema;
		return fields.map((field) => field.name);
	})();
	const rowPercentTotal =
		container.tag === "Row" ? rowPercentWidthTotal(container as Row.t) : null;
	const isRowPercentOverflow =
		rowPercentTotal !== null && rowPercentTotal > 100;

	useEffect(() => {
		if (fieldNames.length === 0) {
			setNewRefField("");
			return;
		}
		if (newRefField === "" || !fieldNames.includes(newRefField)) {
			setNewRefField(fieldNames[0]);
		}
	}, [fieldNames, newRefField]);

	useEffect(() => {
		setSelectedElementIndices([]);
	}, [props.lens]);

	useEffect(() => {
		setSelectedElementIndices((indices) =>
			indices.filter((index) => index < container.elements.length),
		);
	}, [container.elements.length]);

	return (
		<div style={{ display: "flex", flexDirection: "row" }}>
			<div
				className="panel"
				style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
			>
				<div style={{ width: "100%", padding: "20px" }}>
					<b>
						{container.tag}(
						{container.elements
							.map((layout) =>
								layout.tag === "Elem" ? layout.item : layout.tag,
							)
							.join(" | ")}
						)
					</b>
				</div>
				<div className="panel-item">
					<label>Alignment</label>
					<select
						name="alignment"
						value={container.alignment}
						onChange={(e) => {
							container.alignment = e.target.value as Alignment.t;
							props.setLayout(props.layout);
						}}
					>
						<option value="Left">Left</option>
						<option value="Right">Right</option>
						<option value="Center">Center</option>
						<option value="Justified">Justify</option>
					</select>
				</div>
				<div className="panel-item">
					<label>Width</label>

					<select
						name="width"
						value={container.width.tag}
						onChange={(e) => {
							container.width.tag = e.target.value as
								| "Fill"
								| "Percent"
								| "Absolute";
							props.setLayout(props.layout);
						}}
					>
						<option value="Fill">Fill</option>
						<option value="Percent">Percent(%)</option>
						<option value="Absolute">Absolute(px)</option>
					</select>
					{container.width.tag !== "Fill" && (
						<input
							type="number"
							value={container.width.value}
							onChange={(e) => {
								let value = parseInt(e.target.value);
								if (value > 0) {
									// @ts-ignore
									container.width.value = value;
									props.setLayout(props.layout);
								}
							}}
						/>
					)}
				</div>
				<div className="panel-item">
					<button
						className="bordered"
						disabled={isRootContainer}
						style={{
							color: isRootContainer ? "lightgrey" : undefined,
							borderColor: isRootContainer ? "lightgrey" : undefined,
						}}
						onClick={() => {
							if (isRootContainer) {
								return;
							}
							const parent = followLens(
								props.lens.slice(0, -1),
								props.layoutSchema,
							);
							const index = (parent as Layout.Container).elements.indexOf(
								props.current,
							);
							(parent as Layout.Container).elements.splice(index, 1);
							props.setLens(props.lens.slice(0, -1));
							props.setLayout(props.layout);
						}}
					>
						Delete
					</button>
				</div>
				<div className="panel-item-elements">
					<label>Container</label>
					<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
						<button
							className="bordered"
							onClick={() =>
								convertContainerType(
									container.tag === "Stack" ? "Row" : "Stack",
								)
							}
						>
							{container.tag === "Stack" ? "Change to Row" : "Change to Stack"}
						</button>
						<button
							className="bordered"
							disabled={isRootContainer}
							style={{
								color: isRootContainer ? "lightgrey" : undefined,
								borderColor: isRootContainer ? "lightgrey" : undefined,
							}}
							onClick={dissolveContainer}
						>
							Dissolve Into Parent
						</button>
					</div>
				</div>

				<div className="panel-item-elements">
					{container.elements.length !== 0 && <label>Elements</label>}
					{container.tag === "Row" && (
						<div
							style={{
								marginBottom: "8px",
								color: isRowPercentOverflow ? "#b91c1c" : "#15803d",
								fontWeight: 600,
							}}
						>
							Row % total: {rowPercentTotal}%
							{isRowPercentOverflow ? " (over 100%)" : ""}
						</div>
					)}
					<div style={{ display: "flex", flexDirection: "column" }}>
						{container.elements.map((element, index) => {
							return (
								<div
									key={index}
									style={{
										display: "flex",
										flexDirection: "row",
										justifyContent: "space-between",
									}}
								>
									<input
										type="checkbox"
										checked={selectedElementIndices.includes(index)}
										onChange={(e) => {
											setSelectedElementIndices((prev) => {
												if (e.target.checked) {
													return [...prev, index];
												}
												return prev.filter((i) => i !== index);
											});
										}}
									/>
									<button
										className="bordered"
										onClick={() => {
											props.setLayout(props.layout);
											props.setLens([...props.lens, { index }]);
										}}
									>
										{element.tag === "Elem"
											? `Elem(${element.item})`
											: element.tag}
									</button>
									<div>
										{
											<button
												className="bordered"
												disabled={index === 0}
												style={{
													color: index === 0 ? "lightgrey" : undefined,
													borderColor: index === 0 ? "lightgrey" : undefined,
												}}
												onClick={() => {
													const temp = container.elements[index];
													container.elements[index] =
														container.elements[index - 1];
													container.elements[index - 1] = temp;
													props.setLayout(props.layout);
												}}
											>
												{container.tag === "Stack" ? "↑" : "←"}
											</button>
										}
										{
											<button
												className="bordered"
												disabled={index >= container.elements.length - 1}
												style={{
													color:
														index >= container.elements.length - 1
															? "lightgrey"
															: undefined,
													borderColor:
														index >= container.elements.length - 1
															? "lightgrey"
															: undefined,
												}}
												onClick={() => {
													const temp = container.elements[index];
													container.elements[index] =
														container.elements[index + 1];
													container.elements[index + 1] = temp;
													props.setLayout(props.layout);
												}}
											>
												{container.tag === "Stack" ? "↓" : "→"}
											</button>
										}
									</div>
								</div>
							);
						})}
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
						<button
							className="bordered"
							disabled={
								selectedIndices.length === 0 || !isSelectionContiguous
							}
							style={{
								color:
									selectedIndices.length === 0 || !isSelectionContiguous
										? "lightgrey"
										: undefined,
								borderColor:
									selectedIndices.length === 0 || !isSelectionContiguous
										? "lightgrey"
										: undefined,
							}}
							onClick={() => wrapSelectedElements("Stack")}
						>
							Wrap Selected as Stack
						</button>
						<button
							className="bordered"
							disabled={
								selectedIndices.length === 0 || !isSelectionContiguous
							}
							style={{
								color:
									selectedIndices.length === 0 || !isSelectionContiguous
										? "lightgrey"
										: undefined,
								borderColor:
									selectedIndices.length === 0 || !isSelectionContiguous
										? "lightgrey"
										: undefined,
							}}
							onClick={() => wrapSelectedElements("Row")}
						>
							Wrap Selected as Row
						</button>
					</div>
				</div>
				<div className="panel-item">
					<label>Margins</label>
					<div>
						<label>Left</label>
						<input
							type="number"
							style={{ width: "80px" }}
							value={marginLeft}
							onChange={(e) => {
								let value = parseInt(e.target.value);
								setMarginLeft(value);
								if (value >= 0) {
									container.margin.left = parseInt(e.target.value);
									props.setLayout(props.layout);
								}
							}}
						/>
					</div>
					<div>
						<label>Right</label>
						<input
							type="number"
							style={{ width: "80px" }}
							value={marginRight}
							onChange={(e) => {
								let value = parseInt(e.target.value);
								setMarginRight(value);
								if (value >= 0) {
									container.margin.right = parseInt(e.target.value);
									props.setLayout(props.layout);
								}
							}}
						/>
					</div>
					<div>
						<label>Top</label>
						<input
							type="number"
							style={{ width: "80px" }}
							value={marginTop}
							onChange={(e) => {
								let value = parseInt(e.target.value);
								setMarginTop(value);
								if (value >= 0) {
									container.margin.top = parseInt(e.target.value);
									props.setLayout(props.layout);
								}
							}}
						/>
					</div>
					<div>
						<label>Bottom</label>
						<input
							type="number"
							style={{ width: "80px" }}
							value={marginBottom}
							onChange={(e) => {
								let value = parseInt(e.target.value);
								setMarginBottom(value);
								if (value >= 0) {
									container.margin.bottom = parseInt(e.target.value);
									props.setLayout(props.layout);
								}
							}}
						/>
					</div>
				</div>
				<div className="panel-item-elements">
					<label>Add New Text Element</label>
					<input
						type="text"
						onChange={(e) => {
							setNewElement(e.target.value);
						}}
					/>
					<button
						className="bordered"
						onClick={() => {
							const elem = Elem.default_();
							elem.is_ref = false;
							elem.item = newElement;
							elem.text = newElement;
							container.elements.push(elem);
							props.setLayout(props.layout);
						}}
					>
						{" "}
						Add
					</button>
				</div>
				<div className="panel-item-elements">
					<label>Add Field Element</label>
					{fieldNames.length === 0 ? (
						<div style={{ opacity: 0.6 }}>No fields in this schema scope.</div>
					) : (
						<>
							<select
								value={newRefField}
								onChange={(e) => {
									setNewRefField(e.target.value);
								}}
							>
								{fieldNames.map((fieldName) => (
									<option key={fieldName} value={fieldName}>
										{fieldName}
									</option>
								))}
							</select>
							<button
								className="bordered"
								onClick={() => {
									if (!newRefField) {
										return;
									}
									const elem = Elem.default_();
									elem.is_ref = true;
									elem.item = newRefField;
									container.elements.push(elem);
									props.setLayout(props.layout);
									props.setLens([
										...props.lens,
										{ index: container.elements.length - 1 },
									]);
								}}
							>
								Add
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

const ElemControlPanel = (props: {
	current: Layout.t;
	layout: Layout.t;
	layoutSchema: LayoutSchema;
	setLayout: any;
	lens: Lens;
	setLens: (lens: Lens) => void;
}) => {
	const elem = props.current as Elem.t;
	const [fontSize, setFontSize] = useState(elem.font.size);
	const [marginLeft, setMarginLeft] = useState(elem.margin.left);
	const [marginRight, setMarginRight] = useState(elem.margin.right);
	const [marginTop, setMarginTop] = useState(elem.margin.top);
	const [marginBottom, setMarginBottom] = useState(elem.margin.bottom);
	const parentRowPercentTotal = (() => {
		if (props.lens.length < 2) {
			return null;
		}
		const parentLens = props.lens.slice(0, -1);
		const parent = followLens(parentLens, props.layoutSchema) as Layout.t;
		if (parent.tag !== "Row") {
			return null;
		}
		return rowPercentWidthTotal(parent as Row.t);
	})();
	const isParentRowPercentOverflow =
		parentRowPercentTotal !== null && parentRowPercentTotal > 100;
	return (
		<div style={{ display: "flex", flexDirection: "row" }}>
			<div className="panel">
				<div style={{ width: "100%", padding: "20px" }}>
					<b>Elem({elem.item})</b>
				</div>
				<div className="panel-item">
					<label>Font Name</label>
					<select
						name="font-name"
						value={elem.font.name}
						onChange={(e) => {
							elem.font.name = e.target.value;
							props.setLayout(props.layout);
						}}
					>
						<option value="Exo">Exo</option>
						<option value="OpenSans">OpenSans</option>
						<option value="SourceCodePro">SourceCodePro</option>
					</select>
				</div>
				<div className="panel-item">
					<label>Font Size</label>
					<input
						type="number"
						value={fontSize}
						onChange={(e) => {
							let value = parseInt(e.target.value);
							setFontSize(value);
							if (value > 8) {
								elem.font.size = parseInt(e.target.value);
								props.setLayout(props.layout);
							}
						}}
					/>
				</div>
				<div className="panel-item">
					<label>Font Weight</label>
					<select
						name="font-weight"
						value={elem.font.weight}
						onChange={(e) => {
							elem.font.weight = e.target.value as FontWeight;
							props.setLayout(props.layout);
						}}
					>
						<option value="Medium">Medium</option>
						<option value="Bold">Bold</option>
					</select>
				</div>
				<div className="panel-item">
					<label>Font Style</label>
					<select
						name="font-style"
						value={elem.font.style}
						onChange={(e) => {
							elem.font.style = e.target.value as FontStyle;
							props.setLayout(props.layout);
						}}
					>
						<option value="Italic">Italic</option>
						<option value="Normal">Normal</option>
						<option value="Oblique">Oblique</option>
					</select>
				</div>
				<div className="panel-item">
					<label>Alignment</label>
					<select
						name="alignment"
						value={elem.alignment}
						onChange={(e) => {
							elem.alignment = e.target.value as Alignment.t;
							props.setLayout(props.layout);
						}}
					>
						<option value="Left">Left</option>
						<option value="Right">Right</option>
						<option value="Center">Center</option>
						<option value="Justified">Justify</option>
					</select>
				</div>
				<div className="panel-item">
					<label>Background</label>
					<select
						name="alignment"
						value={elem.background_color}
						onChange={(e) => {
							elem.background_color = e.target.value as Color;
							props.setLayout(props.layout);
						}}
					>
						{Object.keys(ColorMap).map((k) => {
							return (
								<option key={k} value={k}>
									{k}
								</option>
							);
						})}
					</select>
				</div>
				<div className="panel-item">
					<label>Width</label>

					<select
						name="width"
						value={elem.width.tag}
						onChange={(e) => {
							elem.width.tag = e.target.value as
								| "Fill"
								| "Percent"
								| "Absolute";
							props.setLayout(props.layout);
						}}
					>
						<option value="Fill">Fill</option>
						<option value="Percent">Percent(%)</option>
						<option value="Absolute">Absolute(px)</option>
					</select>
					{elem.width.tag !== "Fill" && (
						<input
							type="number"
							value={elem.width.value}
							onChange={(e) => {
								let value = parseInt(e.target.value);
								if (value > 0) {
									// @ts-ignore
									elem.width.value = value;
									props.setLayout(props.layout);
								}
							}}
						/>
					)}
					{parentRowPercentTotal !== null && (
						<div
							style={{
								marginTop: "6px",
								color: isParentRowPercentOverflow ? "#b91c1c" : "#15803d",
								fontWeight: 600,
							}}
						>
							Parent row % total: {parentRowPercentTotal}%
							{isParentRowPercentOverflow ? " (over 100%)" : ""}
						</div>
					)}
				</div>
				<div className="panel-item">
					<button
						className="bordered"
						onClick={() => {
							const parent = followLens(
								props.lens.slice(0, -1),
								props.layoutSchema,
							);
							const index = (parent as Layout.Container).elements.indexOf(
								props.current,
							);
							(parent as Layout.Container).elements.splice(index, 1);
							props.setLens(props.lens.slice(0, -1));
							props.setLayout(props.layout);
						}}
					>
						Delete
					</button>
				</div>
				{!elem.is_ref && (
					<div className="panel-item">
						<label>Change Text</label>
						<input
							type="text"
							value={elem.item}
							onChange={(e) => {
								elem.item = e.target.value;
								props.setLayout(props.layout);
							}}
						/>
					</div>
				)}
				<div className="panel-item">
					<label>Margins</label>
					<div>
						<label>Left</label>
						<input
							type="number"
							style={{ width: "80px" }}
							value={marginLeft}
							onChange={(e) => {
								let value = parseInt(e.target.value);
								setMarginLeft(value);
								if (value >= 0) {
									elem.margin.left = parseInt(e.target.value);
									props.setLayout(props.layout);
								}
							}}
						/>
					</div>
					<div>
						<label>Right</label>
						<input
							type="number"
							style={{ width: "80px" }}
							value={marginRight}
							onChange={(e) => {
								let value = parseInt(e.target.value);
								setMarginRight(value);
								if (value >= 0) {
									elem.margin.right = parseInt(e.target.value);
									props.setLayout(props.layout);
								}
							}}
						/>
					</div>
					<div>
						<label>Top</label>
						<input
							type="number"
							style={{ width: "80px" }}
							value={marginTop}
							onChange={(e) => {
								let value = parseInt(e.target.value);
								setMarginTop(value);
								if (value >= 0) {
									elem.margin.top = parseInt(e.target.value);
									props.setLayout(props.layout);
								}
							}}
						/>
					</div>
					<div>
						<label>Bottom</label>
						<input
							type="number"
							style={{ width: "80px" }}
							value={marginBottom}
							onChange={(e) => {
								let value = parseInt(e.target.value);
								setMarginBottom(value);
								if (value >= 0) {
									elem.margin.bottom = parseInt(e.target.value);
									props.setLayout(props.layout);
								}
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

const RowEditor = (props: { layout: any; lens: Lens; setLens: any }) => {
	return (
		<fieldset
			className="layout-editor-row"
			style={{
				display: "flex",
				flexDirection: "row",
			}}
			onClick={(e) => {
				props.setLens([...props.lens]);
				e.stopPropagation();
			}}
		>
			<legend>Row</legend>
			{props.layout.elements.map((item: any, index: number) => {
				return (
					<LayoutEditWindow
						key={index}
						layout={item}
						lens={[...props.lens, { index: index }]}
						setLens={props.setLens}
					/>
				);
			})}
		</fieldset>
	);
};

const StackEditor = (props: { layout: any; lens: Lens; setLens: any }) => {
	return (
		<fieldset
			className="layout-editor-stack"
			onClick={(e) => {
				props.setLens([...props.lens]);
				e.stopPropagation();
			}}
		>
			<legend>Stack</legend>
			{props.layout.elements.map((item: any, index: number) => {
				return (
					<LayoutEditWindow
						key={index}
						layout={item}
						lens={[...props.lens, { index: index }]}
						setLens={props.setLens}
					/>
				);
			})}
		</fieldset>
	);
};

const ItemEditor = (props: { layout: any; lens: Lens; setLens: any }) => {
	return (
		<div
			className="layout-editor-item"
			style={{
				fontFamily: props.layout.font.name + ", sans-serif",
				fontSize: props.layout.font.size,
				fontWeight: props.layout.font.weight,
				fontStyle: props.layout.font.style,
				justifySelf: props.layout.alignment,
				width: props.layout.width.value + "%",
				border: "1px solid black",
				padding: "5px",
			}}
			onClick={(e) => {
				props.setLens([...props.lens]);
				e.stopPropagation();
			}}
		>
			{props.layout.item}
		</div>
	);
};

const TagSwitch = (props: {
	tag: string;
	layout: LayoutSchema;
	lens: any;
	setLens: any;
}) => {
	switch (props.tag) {
		case "Row":
			return (
				<RowEditor
					layout={props.layout}
					lens={props.lens}
					setLens={props.setLens}
				/>
			);
		case "Stack":
			return (
				<StackEditor
					layout={props.layout}
					lens={props.lens}
					setLens={props.setLens}
				/>
			);
		case "Elem":
			return (
				<ItemEditor
					layout={props.layout}
					lens={props.lens}
					setLens={props.setLens}
				/>
			);
		default:
			return <p>Unknown tag</p>;
	}
};

const LayoutEditWindow = (props: { layout: any; lens: any; setLens: any }) => {
	return (
		<TagSwitch
			tag={props.layout.tag}
			layout={props.layout}
			lens={props.lens}
			setLens={props.setLens}
		/>
	);
};

const markUsedElements = (layout: LayoutSchema, dataSchema: DataSchema.t) => {
	const elements: { [key: string]: boolean } = {};

	if (dataSchema === null || layout === null) {
		return elements;
	}

	dataSchema.item_schema.forEach((item) => {
		elements[item.name] = false;
	});

	const markUsed = (layout: any) => {
		if (layout.tag === "Elem") {
			if (layout.is_ref) {
				elements[layout.item] = true;
			}
		} else {
			layout.elements.forEach((element: any) => {
				markUsed(element);
			});
		}
	};

	markUsed(layout.header_layout_schema);
	markUsed(layout.item_layout_schema);

	return elements;
};

const unusedElements = (layout: LayoutSchema, dataSchema: DataSchema.t) => {
	const elements = markUsedElements(layout, dataSchema);
	return Object.entries(elements)
		.filter((entry) => !entry[1])
		.map((entry) => entry[0]);
};

const AddNewLayout = (props: {
	copy: boolean;
}) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);
	const [addingSection, setAddingSection] = useState<boolean>(false);
	const [sectionName, setSectionName] = useState<string>("");
	const [dataSchema, setDataSchema] = useState<string>(
		state?.dataSchemas?.[0]?.schema_name ?? "",
	);
	const [availableLayoutSchemas, setAvailableLayoutSchemas] = useState<
		LayoutSchema[]
	>(state?.layoutSchemas ?? []);
	const [layoutSchema, setLayoutSchema] = useState<string>(
		availableLayoutSchemas.length > 0
			? availableLayoutSchemas[0].schema_name ?? ""
			: "",
	);

	return (
		<>
			{!addingSection && (
				<button
					className="bordered"
					onClick={() => {
						setAddingSection(!addingSection);
					}}
				>
					⊕{" "}
					{props.copy
						? "Copy Existing Layout"
						: "Create New Layout from Scratch"}{" "}
				</button>
			)}
			{addingSection && (
				<div className="panel">
					<div className="panel-item">
						<label>Layout Name</label>
						<input
							type="text"
							value={sectionName}
							placeholder="Layout name"
							onChange={(e) => setSectionName(e.target.value)}
						/>
					</div>
					<div className="panel-item">
						<label>Data Schema</label>
						<select
							value={dataSchema}
							onChange={(e) => {
								setDataSchema(e.target.value);
								setAvailableLayoutSchemas(
									(state?.layoutSchemas ?? []).filter(
										(schema) => schema.data_schema_name === e.target.value,
									),
								);
							}}
						>
							{state?.dataSchemas.map((schema) => {
								return (
									<option key={schema.schema_name} value={schema.schema_name}>
										{schema.schema_name}
									</option>
								);
							})}
						</select>
					</div>
					{props.copy && (
						<div className="panel-item">
							<label>Layout Schema</label>
							<select
								value={layoutSchema}
								onChange={(e) => {
									setLayoutSchema(e.target.value);
								}}
							>
								{availableLayoutSchemas.map((schema) => {
									return (
										<option key={schema.schema_name} value={schema.schema_name}>
											{schema.schema_name}
										</option>
									);
								})}
							</select>
						</div>
					)}
					<div style={{ display: "flex", flexDirection: "row" }}>
						<div className="panel-item">
							<button
								className="bordered"
								onClick={() => {
									setAddingSection(!addingSection);
								}}
							>
								{" "}
								Cancel{" "}
							</button>
						</div>
						<div className="panel-item">
							<button
								className="bordered"
								onClick={() => {
									setAddingSection(!addingSection);
									const newLayout = props.copy
										? state?.layoutSchemas.find(
												(schema) => schema.schema_name === layoutSchema,
											)!
										: new LayoutSchema(
												sectionName,
												dataSchema,
												Stack.default_(),
												Stack.default_(),
											);
									newLayout.data_schema_name = dataSchema;
									newLayout.schema_name = sectionName;

										storage.save_layout_schema(newLayout);
										dispatch!({
											type: "add-layout",
											layout: newLayout,
										});
									}}
								>
								{" "}
								Add{" "}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

const storage = new LocalStorage();

const LayoutEditor = () => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);
	const resumeContext = state?.resume;

	const layoutSchemaNames = Resume.layoutSchemas(resumeContext!);
	const [layoutSchema, setLayoutSchema] = useState<LayoutSchema | null>(null);
	const [dataSchema, setDataSchema] = useState<DataSchema.t | null>(null);
	const [layoutSchemaControlPanel, setLayoutSchemaControlPanel] =
		useState<Lens | null>(null);
	const [selectionSource, setSelectionSource] = useState<"auto" | "manual">(
		"manual",
	);
	const [creatingNewLayoutSchema, setCreatingNewLayoutSchema] =
		useState<boolean>(false);
	const [selectedLayout, setSelectedLayout] = useState<Layout.t | null>(null);
	const [allAvailableLayouts, setAllAvailableLayouts] = useState<string[]>(
		(state?.layoutSchemas ?? []).map((schema) => schema.schema_name),
	);
	const editorPath = state?.editorPath;
	const editorPathVersion = state?.editorPathVersion ?? 0;
	const resumeSections = state?.resume.sections;
	const preserveExistingFocus = useRef(
		Boolean(state?.previewFocus && state.previewFocus.tag !== "none"),
	);
	const preservedEditorPathVersion = useRef<number | null>(
		state?.editorPathVersion ?? null,
	);
	const initializedFromExistingFocus = useRef(false);
	const lastAppliedEditorPathVersion = useRef<number | null>(null);

	useEffect(() => {
		if (layoutSchemaControlPanel === null || layoutSchema === null) {
			return;
		}
		const current = followLens(layoutSchemaControlPanel!, layoutSchema!);
		setSelectedLayout(current);
	}, [layoutSchema, layoutSchemaControlPanel]);

	useEffect(() => {
		if (!layoutSchema || !state?.dataSchemas) {
			setDataSchema(null);
			return;
		}
		const nextDataSchema =
			state.dataSchemas.find(
				(schema) => schema.schema_name === layoutSchema.data_schema_name,
			) ?? null;
		setDataSchema(nextDataSchema);
	}, [layoutSchema, state?.dataSchemas]);

	const selectLayoutBySchemaName = useCallback((
		nextLayoutSchemaName: string,
		nextLens: Lens | null = null,
		source: "auto" | "manual" = "manual",
	) => {
		const nextLayoutSchema =
			state?.layoutSchemas.find((schema) => schema.schema_name === nextLayoutSchemaName) ??
			null;
		if (!nextLayoutSchema) {
			return;
		}
		const nextDataSchema =
			state?.dataSchemas.find(
				(schema) => schema.schema_name === nextLayoutSchema.data_schema_name,
			) ?? null;
		setLayoutSchema(nextLayoutSchema);
		setDataSchema(nextDataSchema);
		setLayoutSchemaControlPanel(nextLens);
		setSelectionSource(source);
	}, [state?.layoutSchemas, state?.dataSchemas]);

	const setLayoutLens = useCallback(
		(nextLens: Lens | null, source: "auto" | "manual" = "manual") => {
			if (source === "manual") {
				preserveExistingFocus.current = false;
			}
			setLayoutSchemaControlPanel(nextLens);
			setSelectionSource(source);
		},
		[],
	);

	useEffect(() => {
		if (!state || initializedFromExistingFocus.current || !preserveExistingFocus.current) {
			return;
		}
		const previewFocus = state.previewFocus;
		if (!previewFocus || previewFocus.tag === "none") {
			return;
		}
		if (previewFocus.tag === "layout-schema") {
			selectLayoutBySchemaName(
				previewFocus.schemaName,
				lensForLayoutScope(previewFocus.scope),
				"manual",
			);
			initializedFromExistingFocus.current = true;
			preservedEditorPathVersion.current = editorPathVersion;
			return;
		}
		if (previewFocus.tag === "data-field" || previewFocus.tag === "data-schema") {
			const sourceSection = state.resume.sections.find(
				(section) => section.data_schema === previewFocus.schemaName,
			);
			if (!sourceSection) {
				preserveExistingFocus.current = false;
				return;
			}
			const sourceLayoutSchema =
				state.layoutSchemas.find(
					(schema) => schema.schema_name === sourceSection.layout_schema,
				) ?? null;
			const nextLens =
				previewFocus.tag === "data-field"
					? sourceLayoutSchema
						? resolveFieldLensForLayoutSchema(
								sourceLayoutSchema,
								previewFocus.group,
								previewFocus.fieldName,
							)
						: lensForDataFieldGroup(previewFocus.group)
					: previewFocus.handoffField
						? sourceLayoutSchema
							? resolveFieldLensForLayoutSchema(
									sourceLayoutSchema,
									previewFocus.handoffField.group,
									previewFocus.handoffField.fieldName,
								)
							: lensForDataFieldGroup(previewFocus.handoffField.group)
						: null;
			selectLayoutBySchemaName(sourceSection.layout_schema, nextLens, "manual");
			initializedFromExistingFocus.current = true;
			preservedEditorPathVersion.current = editorPathVersion;
		}
	}, [state, editorPathVersion, selectLayoutBySchemaName]);

	useEffect(() => {
		if (!editorPath || editorPath.tag === "none" || !resumeSections) {
			return;
		}
		if (lastAppliedEditorPathVersion.current === editorPathVersion) {
			return;
		}
		if (preserveExistingFocus.current) {
			if (preservedEditorPathVersion.current === null) {
				preservedEditorPathVersion.current = editorPathVersion;
			}
			if (editorPathVersion === preservedEditorPathVersion.current) {
				return;
			}
		}
		const sectionName = editorPath.section;
		const targetSection = resumeSections.find(
			(section) => section.section_name === sectionName,
		);
		if (!targetSection) {
			return;
		}
		preserveExistingFocus.current = false;
		const sourceLayoutSchema =
			state?.layoutSchemas.find(
				(schema) => schema.schema_name === targetSection.layout_schema,
			) ?? null;
		const nextLens: Lens =
			editorPath.tag === "section"
				? [{ attribute: "header_layout_schema" }]
				: editorPath.tag === "field"
					? sourceLayoutSchema
						? resolveFieldLensForLayoutSchema(
								sourceLayoutSchema,
								editorPath.item === -1 ? "header_schema" : "item_schema",
								editorPath.field,
							)
						: [{ attribute: editorPath.item === -1 ? "header_layout_schema" : "item_layout_schema" }]
					: [{ attribute: "item_layout_schema" }];
		selectLayoutBySchemaName(targetSection.layout_schema, nextLens, "auto");
		lastAppliedEditorPathVersion.current = editorPathVersion;
	}, [
		editorPath,
		resumeSections,
		selectLayoutBySchemaName,
		editorPathVersion,
		state?.layoutSchemas,
	]);

	useEffect(() => {
		if (!dispatch) {
			return;
		}
		if (!layoutSchema) {
			return;
		}
		if (preserveExistingFocus.current) {
			return;
		}
		dispatch({
			type: "set-preview-focus",
			focus: {
				tag: "layout-schema",
				schemaName: layoutSchema.schema_name,
				scope:
					selectionSource === "auto"
						? "all"
						: focusScopeFromLens(layoutSchemaControlPanel),
				fieldNames:
					selectionSource === "manual" && layoutSchemaControlPanel !== null
						? collectReferencedFields(
								followLens(
									layoutSchemaControlPanel,
									layoutSchema,
								) as Layout.PreBindingLayout,
							)
						: undefined,
				handoffFieldName:
					selectionSource === "auto" && editorPath?.tag === "field"
						? editorPath.field
						: undefined,
			},
		});
	}, [dispatch, layoutSchema, layoutSchemaControlPanel, selectionSource, editorPath]);

	const setLayout = (_updatedLayout: Layout.t) => {
		if (!layoutSchema) {
			return;
		}
		preserveExistingFocus.current = false;
		// Controls mutate nested layout nodes in place. Persist the whole schema
		// object so edits under either header or item scopes are retained.
		const nextLayoutSchema = new LayoutSchema(
			layoutSchema.schema_name,
			layoutSchema.data_schema_name,
			layoutSchema.header_layout_schema,
			layoutSchema.item_layout_schema,
		);
		setLayoutSchema(nextLayoutSchema);
		storage.save_layout_schema(nextLayoutSchema);
		dispatch!({ type: "layout-update", value: nextLayoutSchema });
	};
	return (
		<div>
			<h1>Layout Editor</h1>

			<AddNewLayout copy={true} />
			<AddNewLayout copy={false} />

			<div style={{ display: "flex", flexDirection: "row" }}>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "left",
						width: "50%",
						maxHeight: "300px",
						overflowY: "scroll",
					}}
				>
					{layoutSchemaNames && layoutSchemaNames.length !== 0 && (
						<h2>Currently Used Layouts</h2>
					)}
						{[...new Set(layoutSchemaNames)].map((name, index) => {
							return (
								<button
									className="bordered"
									key={index}
									style={{
										fontWeight:
											layoutSchema?.schema_name === name ? "bold" : "normal",
										borderColor:
											layoutSchema?.schema_name === name ? "#2563eb" : undefined,
									}}
									onClick={() => {
										preserveExistingFocus.current = false;
										selectLayoutBySchemaName(name, null, "manual");
									}}
								>
									{name}
								</button>
						);
					})}
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "left",
						width: "50%",
						maxHeight: "300px",
						overflowY: "scroll",
					}}
				>
					<h2>All Available Layouts</h2>
						{allAvailableLayouts.map((name, index) => {
							if (layoutSchemaNames?.includes(name)) {
								return null;
							}
							return (
								<button
									className="bordered"
									key={index}
									style={{
										fontWeight:
											layoutSchema?.schema_name === name ? "bold" : "normal",
										borderColor:
											layoutSchema?.schema_name === name ? "#2563eb" : undefined,
									}}
									onClick={() => {
										preserveExistingFocus.current = false;
										selectLayoutBySchemaName(name, null, "manual");
									}}
								>
									{name}
								</button>
						);
					})}
				</div>
			</div>

			{layoutSchema !== null ? (
				<>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								padding: "10px",
							}}
						>
							<LayoutEditWindow
								setLens={(nextLens: Lens) => setLayoutLens(nextLens, "manual")}
								lens={[{ attribute: "header_layout_schema" }]}
								layout={layoutSchema.header_layout_schema}
							/>
							<div style={{ height: "5px" }}></div>
							<LayoutEditWindow
								setLens={(nextLens: Lens) => setLayoutLens(nextLens, "manual")}
								lens={[{ attribute: "item_layout_schema" }]}
								layout={layoutSchema.item_layout_schema}
							/>
						</div>
						{layoutSchemaControlPanel !== null && (
							<ControlPanel
								layout={layoutSchema.item_layout_schema}
								layoutSchema={layoutSchema}
								dataSchema={dataSchema}
								setLayout={setLayout}
								lens={layoutSchemaControlPanel}
								setLens={(nextLens: Lens) => setLayoutLens(nextLens, "manual")}
							/>
						)}
					</div>
				</>
			) : (
				creatingNewLayoutSchema && (
					<div>
						{resumeContext &&
							Resume.dataSchemas(resumeContext).map((name, index) => {
								return (
									<button
										key={index}
										onClick={() => {
											const dataSchema = state?.dataSchemas.find(
												(schema) => schema.schema_name === name,
											)!;
											setDataSchema(dataSchema);
										}}
									>
										{name}
									</button>
								);
							})}
						<button onClick={() => setCreatingNewLayoutSchema(false)}>
							Cancel
						</button>
					</div>
				)
			)}
			{dataSchema !== null &&
				selectedLayout &&
				selectedLayout.tag !== "Elem" && (
					<div>
						{unusedElements(layoutSchema!, dataSchema).map((used, index) => {
							return (
								<button
									key={index}
									style={{
										color: used[1] ? "black" : "red",
										border: "1px solid black",
										margin: "2px",
										padding: "2px",
										borderRadius: "5px",
									}}
									onClick={() => {
										const elem = Elem.default_();
										elem.is_ref = true;
										elem.item = used;
										(selectedLayout! as Layout.Container).elements.push(elem);
										setLayout(selectedLayout!);
									}}
								>
									{used} +
								</button>
							);
						})}
					</div>
				)}
		</div>
	);
};

export default LayoutEditor;
