import * as Resume from "cvdl-ts/dist/Resume";

import { ElementPath } from "cvdl-ts/dist/AnyLayout";
import {
	ResumeSection,
	ItemContent,
	Item,
} from "cvdl-ts/dist/Resume";
import { createContext } from "react";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { LocalStorage } from "cvdl-ts/dist/LocalStorage";
import * as Utils from "cvdl-ts/dist/Utils";
import { DataSchema } from "cvdl-ts/dist/DataSchema";

const storage = new LocalStorage();

export type EditorState = {
	resume: Resume.t;
	dataSchemas: DataSchema.t[];
	layoutSchemas: LayoutSchema[];
	editorPath: ElementPath;
	editHistory: DocumentAction[];
};

export const EditorContext = createContext<EditorState | null>(null);

// Create a global storage for ResumeData
// export const DocumentContext = createContext<Resume | null>(null);
export const DocumentDispatchContext =
	createContext<React.Dispatch<any> | null>(null);

type DocumentAction =
	| {
		type: "field-update";
		section: string;
		item: number;
		field: string;
		value: ItemContent.t;
	}
	| {
		type: "load";
		value: Resume.t;
	}
	| {
		type: "layout-update";
		value: LayoutSchema;
	}
	| {
		type: "delete-item";
		section: string;
		item: number;
	}
	| {
		type: "add-empty-item";
		section: string;
	}
	| {
		type: "copy-item";
		section: string;
		item: number;
	}
	| {
		type: "move-item";
		section: string;
		item: number;
		direction: "up" | "down";
	}
	| {
		type: "add-item";
		section: string;
		item: Item;
		index?: number;
	}
	| {
		type: "add-section";
		index?: number;
		section: ResumeSection.t;
	}
	| {
		type: "add-empty-section";
		section_name: string;
		data_schema: string;
		layout_schema: string;
	}
	| {
		type: "delete-section";
		section_name: string;
	}
	| {
		type: "section-layout-update";
		section_name: string;
		layout_schema_name: string;
	}
	| {
		type: "add-layout";
		layout: LayoutSchema;
	}
	| {
		type: "create-new-resume";
		resumeName: string;
	}
	| {
		type: "switch-resume";
		resumeName: string;
	}
	| {
		type: "undo";
	} | {
		type: "load-data-schemas";
		value: DataSchema.t[];
	} | {
		type: "load-layout-schemas";
		value: LayoutSchema[];
	};

export type ContentEditorAction = {
	type: "set-editor-path";
	path: ElementPath;
};

export type EditorAction = DocumentAction | ContentEditorAction;

const cloneEditorHistory = (history: DocumentAction[]) => {
	return history.map((action) => {
		return { ...action };
	});
};

const reId = (resume: Resume.t) => {
	const newResume = JSON.parse(JSON.stringify(resume)) as Resume.t;
	newResume.sections = newResume.sections.map((section) => {
		const newSection = { ...section };
		newSection.items = newSection.items.map((item) => {
			const newItem = { ...item };
			newItem.id = Utils.randomString();
			return newItem;
		});
		return newSection;
	});
	return newResume;
}

export const DocumentReducer = (state: EditorState, action_: EditorAction) => {
	let newState = reId(state.resume);
	let path = state.editorPath;
	let editHistory = cloneEditorHistory(state.editHistory) as DocumentAction[];
	let undoing = false;

	if (action_.type === "undo" && editHistory.length > 0) {
		let lastAction = editHistory.pop();
		action_ = lastAction! as EditorAction;
		undoing = true;
	}
	// Learn why this is needed.
	const action = action_ as EditorAction;

	if (action.type === "load-data-schemas") {
		for (const schema of action.value) {
			storage.save_data_schema(schema);
		}
		return {
			resume: state.resume,
			dataSchemas: action.value,
			layoutSchemas: state.layoutSchemas,
			editorPath: state.editorPath,
			editHistory: state.editHistory,
		};
	}

	if (action.type === "load-layout-schemas") {
		for (const schema of action.value) {
			storage.save_layout_schema(schema);
		}
		return {
			resume: state.resume,
			dataSchemas: state.dataSchemas,
			layoutSchemas: action.value,
			editorPath: state.editorPath,
			editHistory: state.editHistory,
		};
	}

	if (action.type === "set-editor-path") {
		path = action.path;
		if (path.tag === "section") {
			document
				.getElementById(path.section)
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		} else if (path.tag === "item") {
			document
				.getElementById(path.section + "-" + path.item)
				?.scrollIntoView({ behavior: "smooth", block: "center" });
		} else if (path.tag === "field") {
			document
				.getElementById(path.section + "-" + path.item + "-" + path.field)
				?.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}

	if (action.type === "load") {
		newState = action.value;
	}

	if (action.type === "create-new-resume") {
		newState = Resume.resume(action.resumeName, "SingleColumnSchema", []);
		path = { tag: "none" };
	}

	if (action.type === "switch-resume") {
		path = { tag: "none" };
		storage.load_resume(action.resumeName).then((state) => {
			newState = state;
		});
	}

	if (action.type === "field-update") {
		newState.sections = state.resume.sections.map((section) => {
			const newSection = { ...section };
			if (section.section_name === action.section) {
				if (action.item !== -1) {
					const item = newSection.items[action.item];
					if (!undoing) {
						editHistory.push({
							type: "field-update",
							section: section.section_name,
							item: action.item,
							field: action.field,
							value: item.fields[action.field],
						});
					}
					item.fields[action.field] = action.value;
				} else {
					if (!undoing) {
						editHistory.push({
							type: "field-update",
							section: section.section_name,
							item: action.item,
							field: action.field,
							value: newSection.data.fields[action.field],
						});
					}
					newSection.data.fields[action.field] = action.value;
				}
			}
			return newSection;
		});
	}

	if (action.type === "delete-item") {
		newState.sections = newState.sections.map((section) => {
			const newSection = { ...section };
			if (section.section_name === action.section) {
				newSection.items = section.items.filter(
					(item, index) => index !== action.item,
				);
				if (!undoing) {
					editHistory.push({
						type: "add-item",
						section: section.section_name,
						item: section.items[action.item],
						index: action.item,
					});
				}
			}
			return newSection;
		});
	}

	if (action.type === "add-item") {
		newState.sections = newState.sections.map((section) => {
			const newSection = { ...section };
			if (section.section_name === action.section) {
				if (action.index === undefined) {
					newSection.items.push(action.item);
					path = {
						tag: "item",
						section: section.section_name,
						item: newSection.items.length - 1,
					};
				} else {
					newSection.items.splice(action.index, 0, action.item);
					path = {
						tag: "item",
						section: section.section_name,
						item: action.index,
					};
				}

				document.getElementById(`${action.section}-${action.index}`)?.scrollIntoView();

				if (!undoing) {
					editHistory.push({
						type: "delete-item",
						section: section.section_name,
						item: newSection.items.length - 1,
					});
				}
			}
			return newSection;
		});
	}

	if (action.type === "copy-item") {
		newState.sections = newState.sections.map((section) => {
			const newSection = { ...section };
			if (section.section_name === action.section) {
				const fields = section.items[action.item].fields;
				const id = Utils.randomString();
				newSection.items.push({ id, fields });
				if (!undoing) {
					editHistory.push({
						type: "delete-item",
						section: section.section_name,
						item: newSection.items.length - 1,
					});
				}
			}
			return newSection;
		});
	}

	if (action.type === "move-item") {
		newState.sections = newState.sections.map((section) => {
			const newSection = { ...section };
			if (section.section_name === action.section) {
				if (
					(action.item <= 0 && action.direction === "up") ||
					(action.item >= newSection.items.length - 1 &&
						action.direction === "down")
				) {
					return newSection;
				}

				const swapPosition =
					action.direction === "up" ? action.item - 1 : action.item + 1;

				const item = newSection.items[action.item];

				const temp = newSection.items[swapPosition];
				newSection.items[swapPosition] = item;
				newSection.items[action.item] = temp;

				if (!undoing) {
					editHistory.push({
						type: "move-item",
						section: section.section_name,
						item: swapPosition,
						direction: action.direction === "up" ? "down" : "up",
					});
				}
			}
			return newSection;
		});
	}

	if (action.type === "add-empty-item") {
		newState.sections = newState.sections.map((section) => {
			const newSection = { ...section };
			if (section.section_name === action.section) {
				const storage = new LocalStorage();
				storage.load_data_schema(section.data_schema).then((data_schema) => {
					const item: Item = {
						id: Utils.randomString(),
						fields: {},
					};

					data_schema.item_schema.forEach((field) => {
						item.fields[field.name] = ItemContent.none();
					});

					newSection.items.push(item);
					path = {
						tag: "item",
						section: section.section_name,
						item: newSection.items.length - 1,
					};
					setTimeout(() => {
						document
							.getElementById(`${action.section}-${newSection.items.length - 1}`)
							?.scrollIntoView({ behavior: "smooth", block: "center" });
					}, 200);
					if (!undoing) {
						editHistory.push({
							type: "delete-item",
							section: section.section_name,
							item: newSection.items.length - 1,
						});
					}
				});
			}
			return newSection;
		});
	}

	if (action.type === "add-section") {
		if (action.index === undefined) {
			newState.sections.push(action.section);
		} else {
			newState.sections.splice(action.index, 0, action.section);
		}

		if (!undoing) {
			editHistory.push({
				type: "delete-section",
				section_name: action.section.section_name,
			});
		}
	}

	if (action.type === "add-empty-section") {
		storage.load_layout_schema(action.layout_schema).then((layout_schema) => {
			newState.sections.push(ResumeSection.resumeSection(
				action.section_name,
				layout_schema.data_schema_name,
				action.layout_schema,
				{
					id: Utils.randomString(),
					fields: {},
				},
				[]
			));

			if (!undoing) {
				editHistory.push({
					type: "delete-section",
					section_name: action.section_name,
				});
			}
		});
	}

	if (action.type === "delete-section") {
		newState.sections = newState.sections.filter(
			(section) => section.section_name !== action.section_name,
		);
		if (!undoing) {
			editHistory.push({
				type: "add-section",
				index: newState.sections.findIndex(
					(section) => section.section_name === action.section_name,
				),
				section: newState.sections.find(
					(section) => section.section_name === action.section_name,
				)!,
			});
		}
	}

	if (action.type === "section-layout-update") {
		newState.sections = newState.sections.map((section) => {
			const newSection = { ...section };
			if (section.section_name === action.section_name) {
				newSection.layout_schema = action.layout_schema_name;
				if (!undoing) {
					editHistory.push({
						type: "section-layout-update",
						section_name: action.section_name,
						layout_schema_name: section.layout_schema,
					});
				}
			}
			return newSection;
		});
	}

	storage.save_resume(newState.name, newState);
	return {
		resume: newState,
		dataSchemas: state.dataSchemas,
		layoutSchemas: state.layoutSchemas,
		editorPath: path,
		editHistory: editHistory,
	};
};
