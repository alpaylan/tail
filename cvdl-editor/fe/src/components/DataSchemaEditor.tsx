"use client";

import {
	DataSchema,
	DateFormat,
	DocumentDataType,
	Field,
} from "cvdl-ts/dist/DataSchema";
import * as Layout from "cvdl-ts/dist/Layout";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { DocumentDispatchContext, EditorContext } from "./State";

const cloneSchema = (schema: DataSchema.t): DataSchema.t => {
	return JSON.parse(JSON.stringify(schema)) as DataSchema.t;
};

const defaultTypeForTag = (
	tag: DocumentDataType.t["tag"],
): DocumentDataType.t => {
	switch (tag) {
		case "String":
			return { tag: "String" };
		case "Url":
			return { tag: "Url" };
		case "MarkdownString":
			return { tag: "MarkdownString" };
		case "Number":
			return { tag: "Number" };
		case "Date":
			return { tag: "Date", format: "unknown" };
		case "Type":
			return { tag: "Type", value: "" };
		case "List":
			return { tag: "List", value: { tag: "String" } };
		case "Types":
			return { tag: "Types", value: [{ tag: "String" }] };
	}
};

const emptyField = (): Field => ({
	name: "new_field",
	type: { tag: "String" },
});

const removedFieldNames = (before: Field[], after: Field[]): Set<string> => {
	const nextNames = new Set(after.map((field) => field.name));
	const removed = new Set<string>();
	before.forEach((field) => {
		if (!nextNames.has(field.name)) {
			removed.add(field.name);
		}
	});
	return removed;
};

const removeFieldRefsFromLayout = (
	layout: Layout.PreBindingLayout,
	removed: Set<string>,
): Layout.PreBindingLayout | null => {
	if (layout.tag === "Elem") {
		if (layout.is_ref && removed.has(layout.item)) {
			return null;
		}
		return layout;
	}
	const nextElements = layout.elements
		.map((child) =>
			removeFieldRefsFromLayout(child as Layout.PreBindingLayout, removed),
		)
		.filter((child): child is Layout.PreBindingLayout => child !== null);
	return {
		...layout,
		elements: nextElements,
	};
};

type FieldGroup = "header_schema" | "item_schema";

type TypeEditorProps = {
	type: DocumentDataType.t;
	onChange: (type: DocumentDataType.t) => void;
	depth?: number;
};

const TypeEditor = ({ type, onChange, depth = 0 }: TypeEditorProps) => {
	const style = {
		marginLeft: `${depth * 12}px`,
		padding: "6px",
		border: "1px solid #ddd",
		borderRadius: "6px",
	};

	return (
		<div style={style}>
			<div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
				<label>Type</label>
				<select
					value={type.tag}
					onChange={(e) => {
						onChange(
							defaultTypeForTag(e.target.value as DocumentDataType.t["tag"]),
						);
					}}
				>
					<option value="String">String</option>
					<option value="Url">Url</option>
					<option value="MarkdownString">MarkdownString</option>
					<option value="Number">Number</option>
					<option value="Date">Date</option>
					<option value="Type">Type</option>
					<option value="List">List</option>
					<option value="Types">Types</option>
				</select>
			</div>

			{type.tag === "Date" && (
				<div style={{ marginTop: "6px" }}>
					<label>Date Format </label>
					<select
						value={type.format}
						onChange={(e) => {
							onChange({
								...type,
								format: e.target.value as DateFormat.t,
							});
						}}
					>
						{DateFormat.formats.map((format) => (
							<option key={format} value={format}>
								{format}
							</option>
						))}
					</select>
				</div>
			)}

			{type.tag === "Type" && (
				<div style={{ marginTop: "6px" }}>
					<label>Value </label>
					<input
						type="text"
						value={type.value}
						onChange={(e) => onChange({ ...type, value: e.target.value })}
					/>
				</div>
			)}

			{type.tag === "List" && (
				<div style={{ marginTop: "6px" }}>
					<div>List Item Type</div>
					<TypeEditor
						type={type.value}
						onChange={(value) => onChange({ ...type, value })}
						depth={depth + 1}
					/>
				</div>
			)}

			{type.tag === "Types" && (
				<div style={{ marginTop: "6px" }}>
					<div style={{ marginBottom: "6px" }}>Union Types</div>
					{type.value.map((nestedType, index) => (
						<div
							key={index}
							style={{ display: "flex", gap: "6px", marginBottom: "6px" }}
						>
							<div style={{ flex: 1 }}>
								<TypeEditor
									type={nestedType}
									onChange={(nextType) => {
										const nextTypes = [...type.value];
										nextTypes[index] = nextType;
										onChange({ ...type, value: nextTypes });
									}}
									depth={depth + 1}
								/>
							</div>
							<button
								className="bordered"
								onClick={() => {
									const nextTypes = type.value.filter((_, i) => i !== index);
									onChange({
										...type,
										value:
											nextTypes.length === 0 ? [{ tag: "String" }] : nextTypes,
									});
								}}
							>
								-
							</button>
						</div>
					))}
					<button
						className="bordered"
						onClick={() => {
							onChange({ ...type, value: [...type.value, { tag: "String" }] });
						}}
					>
						+ Add Type
					</button>
				</div>
			)}
		</div>
	);
};

type FieldEditorProps = {
	title: string;
	schemaName: string;
	group: FieldGroup;
	focusedFieldName: string | null;
	onFocusField: (field: { group: FieldGroup; name: string } | null) => void;
	fields: Field[];
	onChange: (fields: Field[]) => void;
};

const FieldEditor = ({
	title,
	schemaName,
	group,
	focusedFieldName,
	onFocusField,
	fields,
	onChange,
}: FieldEditorProps) => {
	return (
		<div
			style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<h3>{title}</h3>
				<button
					className="bordered"
					onClick={() => {
						const nextFields = [...fields, emptyField()];
						onChange(nextFields);
						onFocusField({
							group,
							name: nextFields[nextFields.length - 1]?.name ?? "new_field",
						});
					}}
				>
					+ Add Field
				</button>
			</div>

			{fields.length === 0 && (
				<div style={{ opacity: 0.6 }}>No fields yet.</div>
			)}

			{fields.map((field, index) => (
				<div
					key={index}
					id={`schema-field-${schemaName}-${group}-${field.name}`}
					style={{
						border:
							focusedFieldName === field.name
								? "2px solid #2563eb"
								: "1px solid #eee",
						backgroundColor:
							focusedFieldName === field.name
								? "rgba(219, 234, 254, 0.35)"
								: "transparent",
						padding: "8px",
						borderRadius: "8px",
						marginBottom: "8px",
					}}
					onClick={() => onFocusField({ group, name: field.name })}
				>
					<div
						style={{
							display: "flex",
							gap: "8px",
							alignItems: "center",
							marginBottom: "8px",
						}}
					>
						<label>Field Name</label>
						<input
							type="text"
							onFocus={() => onFocusField({ group, name: field.name })}
							value={field.name}
							onChange={(e) => {
								const nextFieldName = e.target.value;
								const nextFields = [...fields];
								nextFields[index] = { ...field, name: nextFieldName };
								onChange(nextFields);
								if (focusedFieldName === field.name) {
									onFocusField({ group, name: nextFieldName });
								}
							}}
						/>
						<button
							className="bordered"
							onClick={() => {
								onChange(fields.filter((_, i) => i !== index));
								if (focusedFieldName === field.name) {
									onFocusField(null);
								}
							}}
						>
							Delete
						</button>
					</div>
					<TypeEditor
						type={field.type}
						onChange={(nextType) => {
							const nextFields = [...fields];
							nextFields[index] = { ...field, type: nextType };
							onChange(nextFields);
						}}
					/>
				</div>
			))}
		</div>
	);
};

const DataSchemaEditor = () => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);

	const schemaNames = useMemo(
		() => [
			...new Set(state?.dataSchemas.map((schema) => schema.schema_name) ?? []),
		],
		[state?.dataSchemas],
	);
	const [selectedSchemaName, setSelectedSchemaName] = useState<string | null>(
		null,
	);
	const [draftSchema, setDraftSchema] = useState<DataSchema.t | null>(null);
	const [selectedFieldFocus, setSelectedFieldFocus] = useState<{
		group: FieldGroup;
		name: string;
	} | null>(null);
	const [selectionSource, setSelectionSource] = useState<"auto" | "manual">(
		"auto",
	);
	const preserveExistingFocus = useRef(
		Boolean(state?.previewFocus && state.previewFocus.tag !== "none"),
	);
	const preservedEditorPathVersion = useRef<number | null>(
		state?.editorPathVersion ?? null,
	);
	const initializedFromExistingFocus = useRef(false);
	const editorPath = state?.editorPath;
	const editorPathVersion = state?.editorPathVersion ?? 0;
	const resumeSections = state?.resume.sections;

	useEffect(() => {
		if (
			!state ||
			initializedFromExistingFocus.current ||
			!preserveExistingFocus.current
		) {
			return;
		}
		const previewFocus = state.previewFocus;
		if (!previewFocus || previewFocus.tag === "none") {
			return;
		}

		const resolveFieldFocus = (
			schemaName: string,
			fieldName: string | undefined,
		): { group: FieldGroup; name: string } | null => {
			if (!fieldName) {
				return null;
			}
			const schema = state.dataSchemas.find(
				(item) => item.schema_name === schemaName,
			);
			if (!schema) {
				return null;
			}
			if (schema.header_schema.some((field) => field.name === fieldName)) {
				return { group: "header_schema", name: fieldName };
			}
			if (schema.item_schema.some((field) => field.name === fieldName)) {
				return { group: "item_schema", name: fieldName };
			}
			return null;
		};

		if (previewFocus.tag === "data-field") {
			setSelectedSchemaName(previewFocus.schemaName);
			setSelectedFieldFocus({
				group: previewFocus.group,
				name: previewFocus.fieldName,
			});
			setSelectionSource("manual");
			initializedFromExistingFocus.current = true;
			preservedEditorPathVersion.current = editorPathVersion;
			return;
		}

		if (previewFocus.tag === "data-schema") {
			setSelectedSchemaName(previewFocus.schemaName);
			setSelectedFieldFocus(
				previewFocus.handoffField
					? {
							group: previewFocus.handoffField.group,
							name: previewFocus.handoffField.fieldName,
						}
					: null,
			);
			setSelectionSource("manual");
			initializedFromExistingFocus.current = true;
			preservedEditorPathVersion.current = editorPathVersion;
			return;
		}

		if (previewFocus.tag === "layout-schema") {
			const layoutSchema = state.layoutSchemas.find(
				(schema) => schema.schema_name === previewFocus.schemaName,
			);
			if (!layoutSchema) {
				preserveExistingFocus.current = false;
				return;
			}
			const schemaName = layoutSchema.data_schema_name;
			setSelectedSchemaName(schemaName);
			const fieldCandidate =
				previewFocus.handoffFieldName ??
				(previewFocus.fieldNames && previewFocus.fieldNames.length === 1
					? previewFocus.fieldNames[0]
					: undefined);
			setSelectedFieldFocus(resolveFieldFocus(schemaName, fieldCandidate));
			setSelectionSource("manual");
			initializedFromExistingFocus.current = true;
			preservedEditorPathVersion.current = editorPathVersion;
		}
	}, [state, editorPathVersion]);

	useEffect(() => {
		if (!editorPath || editorPath.tag === "none" || !resumeSections) {
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
		setSelectedSchemaName(targetSection.data_schema);
		setSelectedFieldFocus(null);
		setSelectionSource("auto");
	}, [editorPath, resumeSections, editorPathVersion]);

	useEffect(() => {
		if (preserveExistingFocus.current) {
			return;
		}
		if (!selectedSchemaName && schemaNames.length > 0) {
			setSelectedSchemaName(schemaNames[0]);
		}
	}, [schemaNames, selectedSchemaName]);

	useEffect(() => {
		if (!selectedSchemaName || !state?.dataSchemas) {
			setDraftSchema(null);
			return;
		}
		const selected = state.dataSchemas.find(
			(schema) => schema.schema_name === selectedSchemaName,
		);
		setDraftSchema(selected ? cloneSchema(selected) : null);
	}, [selectedSchemaName, state?.dataSchemas]);

	const sourceSchema = useMemo(() => {
		if (!selectedSchemaName || !state?.dataSchemas) {
			return null;
		}
		return (
			state.dataSchemas.find(
				(schema) => schema.schema_name === selectedSchemaName,
			) ?? null
		);
	}, [selectedSchemaName, state?.dataSchemas]);

	const isDirty = useMemo(() => {
		if (!draftSchema || !sourceSchema) {
			return false;
		}
		return JSON.stringify(draftSchema) !== JSON.stringify(sourceSchema);
	}, [draftSchema, sourceSchema]);

	const focusedField = useMemo(() => {
		if (!draftSchema || !state || state.editorPath.tag !== "field") {
			return null;
		}
		const fieldName = state.editorPath.field;
		if (draftSchema.header_schema.some((field) => field.name === fieldName)) {
			return { group: "header_schema" as FieldGroup, name: fieldName };
		}
		if (draftSchema.item_schema.some((field) => field.name === fieldName)) {
			return { group: "item_schema" as FieldGroup, name: fieldName };
		}
		return null;
	}, [draftSchema, state]);

	const activeFieldFocus =
		selectedFieldFocus ?? (selectionSource === "auto" ? focusedField : null);
	const activeFieldGroup = activeFieldFocus?.group;
	const activeFieldName = activeFieldFocus?.name;
	const focusedFieldGroup = focusedField?.group;
	const focusedFieldName = focusedField?.name;
	const selectedFieldGroup = selectedFieldFocus?.group;
	const selectedFieldName = selectedFieldFocus?.name;

	useEffect(() => {
		if (!dispatch) {
			return;
		}
		if (!selectedSchemaName) {
			return;
		}
		if (preserveExistingFocus.current) {
			return;
		}
		if (selectedFieldGroup && selectedFieldName) {
			dispatch({
				type: "set-preview-focus",
				focus: {
					tag: "data-field",
					schemaName: selectedSchemaName,
					group: selectedFieldGroup,
					fieldName: selectedFieldName,
				},
			});
			return;
		}
		if (selectionSource === "auto" && focusedFieldGroup && focusedFieldName) {
			dispatch({
				type: "set-preview-focus",
				focus: {
					tag: "data-schema",
					schemaName: selectedSchemaName,
					handoffField: {
						group: focusedFieldGroup,
						fieldName: focusedFieldName,
					},
				},
			});
			return;
		}
		dispatch({
			type: "set-preview-focus",
			focus: { tag: "data-schema", schemaName: selectedSchemaName },
		});
	}, [
		dispatch,
		selectedSchemaName,
		selectedFieldGroup,
		selectedFieldName,
		selectionSource,
		focusedFieldGroup,
		focusedFieldName,
	]);

	useEffect(() => {
		if (!draftSchema || !activeFieldGroup || !activeFieldName) {
			return;
		}
		const elementId = `schema-field-${draftSchema.schema_name}-${activeFieldGroup}-${activeFieldName}`;
		const target = document.getElementById(elementId);
		target?.scrollIntoView({ behavior: "smooth", block: "center" });
	}, [draftSchema, activeFieldGroup, activeFieldName]);

	const saveDraft = () => {
		if (!draftSchema || !dispatch || !state) {
			return;
		}
		const source = state.dataSchemas.find(
			(schema) => schema.schema_name === draftSchema.schema_name,
		);
		const nextSchemas = state.dataSchemas.map((schema) =>
			schema.schema_name === draftSchema.schema_name
				? cloneSchema(draftSchema)
				: schema,
		);
		dispatch({ type: "load-data-schemas", value: nextSchemas });
		if (!source) {
			return;
		}

		const removedHeader = removedFieldNames(
			source.header_schema,
			draftSchema.header_schema,
		);
		const removedItem = removedFieldNames(
			source.item_schema,
			draftSchema.item_schema,
		);
		if (removedHeader.size === 0 && removedItem.size === 0) {
			return;
		}

		const nextResume = JSON.parse(
			JSON.stringify(state.resume),
		) as typeof state.resume;
		nextResume.sections = nextResume.sections.map((section) => {
			if (section.data_schema !== draftSchema.schema_name) {
				return section;
			}
			const nextSectionFields = { ...section.data.fields };
			removedHeader.forEach((name) => {
				delete nextSectionFields[name];
			});
			const nextItems = section.items.map((item) => {
				const nextItemFields = { ...item.fields };
				removedItem.forEach((name) => {
					delete nextItemFields[name];
				});
				return {
					...item,
					fields: nextItemFields,
				};
			});
			return {
				...section,
				data: {
					...section.data,
					fields: nextSectionFields,
				},
				items: nextItems,
			};
		});

		const nextLayoutSchemas = state.layoutSchemas.map((schema) => {
			if (schema.data_schema_name !== draftSchema.schema_name) {
				return schema;
			}
			const nextSchema = LayoutSchema.fromJson(schema.toJson());
			if (removedHeader.size > 0) {
				const nextHeader = removeFieldRefsFromLayout(
					nextSchema.header_layout_schema as Layout.PreBindingLayout,
					removedHeader,
				);
				nextSchema.header_layout_schema = nextHeader ?? Layout.empty();
			}
			if (removedItem.size > 0) {
				const nextItem = removeFieldRefsFromLayout(
					nextSchema.item_layout_schema as Layout.PreBindingLayout,
					removedItem,
				);
				nextSchema.item_layout_schema = nextItem ?? Layout.empty();
			}
			return nextSchema;
		});

		setSelectedFieldFocus((focus) => {
			if (!focus) {
				return focus;
			}
			const removed =
				focus.group === "header_schema" ? removedHeader : removedItem;
			return removed.has(focus.name) ? null : focus;
		});
		dispatch({ type: "load-layout-schemas", value: nextLayoutSchemas });
		dispatch({ type: "load", value: nextResume });
	};

	const resetDraft = () => {
		if (!sourceSchema) {
			return;
		}
		setDraftSchema(cloneSchema(sourceSchema));
	};

	const updateGroup = (group: FieldGroup, fields: Field[]) => {
		if (!draftSchema) {
			return;
		}
		setDraftSchema({
			...draftSchema,
			[group]: fields,
		});
	};

	return (
		<div>
			<h1>Schema Editor</h1>
			<div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
				<div
					style={{
						minWidth: "220px",
						display: "flex",
						flexDirection: "column",
						gap: "6px",
					}}
				>
					<h2>Schemas</h2>
					{schemaNames.length === 0 && <div>No schemas available.</div>}
					{schemaNames.map((name) => (
						<button
							key={name}
							className="bordered"
							onClick={() => {
								preserveExistingFocus.current = false;
								setSelectedSchemaName(name);
								setSelectedFieldFocus(null);
								setSelectionSource("manual");
							}}
							style={{
								fontWeight: name === selectedSchemaName ? "bold" : "normal",
								borderColor:
									name === selectedSchemaName ? "#2563eb" : undefined,
							}}
						>
							{name}
						</button>
					))}
				</div>

				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						gap: "12px",
					}}
				>
					{draftSchema ? (
						<>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<h2>{draftSchema.schema_name}</h2>
								<div style={{ display: "flex", gap: "8px" }}>
									{isDirty && (
										<span style={{ color: "#b45309" }}>Unsaved changes</span>
									)}
									<button
										className="bordered"
										onClick={resetDraft}
										disabled={!isDirty}
									>
										Reset
									</button>
									<button
										className="bordered"
										onClick={saveDraft}
										disabled={!isDirty}
									>
										Save
									</button>
								</div>
							</div>

							<FieldEditor
								title="Header Schema"
								schemaName={draftSchema.schema_name}
								group="header_schema"
								focusedFieldName={
									activeFieldFocus?.group === "header_schema"
										? activeFieldFocus.name
										: null
								}
								onFocusField={(focus) => {
									preserveExistingFocus.current = false;
									setSelectedFieldFocus(focus);
									setSelectionSource("manual");
								}}
								fields={draftSchema.header_schema}
								onChange={(fields) => updateGroup("header_schema", fields)}
							/>
							<FieldEditor
								title="Item Schema"
								schemaName={draftSchema.schema_name}
								group="item_schema"
								focusedFieldName={
									activeFieldFocus?.group === "item_schema"
										? activeFieldFocus.name
										: null
								}
								onFocusField={(focus) => {
									preserveExistingFocus.current = false;
									setSelectedFieldFocus(focus);
									setSelectionSource("manual");
								}}
								fields={draftSchema.item_schema}
								onChange={(fields) => updateGroup("item_schema", fields)}
							/>
						</>
					) : (
						<div>Select a schema to edit.</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default DataSchemaEditor;
