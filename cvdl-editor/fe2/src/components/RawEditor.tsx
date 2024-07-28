"use client";
import { EditorContext, DocumentDispatchContext, EditorState } from "@/components/State";
import * as Alignment from "cvdl-ts/dist/Alignment";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
import { FontStyle, FontWeight } from "cvdl-ts/dist/Font";
import { Color, ColorMap } from "cvdl-ts/dist/Layout";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { LocalStorage } from "cvdl-ts/dist/LocalStorage";
import { useContext, useEffect, useState } from "react";
import { match } from "ts-pattern";
import { CustomNodeDefinition, CustomNodeProps, JsonData, JsonEditor as LibEditor } from 'json-edit-react'
import { convert, convertBack, JsonResume } from "@/logic/JsonResume";

const storage = new LocalStorage();

type tab = "Resume" | "JsonResume" | "Layouts" | "Schemas";

const tabs: tab[] = ["Resume", "JsonResume", "Layouts", "Schemas"];

const Tabs = (props: { currentTab: tab, setCurrentTab: (n: tab) => void }) => {

	return (<div style={{ display: "flex", flexDirection: "row" }}>
		{
			tabs.map((tab) =>
				<button
					className={`bordered sharp ${props.currentTab === tab ? "selected" : ""}`}
					onClick={() => props.setCurrentTab(tab)}
				>{tab}</button>
			)
		}
	</div>);
}

const getTab = (state: EditorState, t: tab) => {
	return match(t)
		.returnType<JsonData>()
		.with("Resume", () => state.resume)
		.with("JsonResume", () => convertBack(state.resume))
		.with("Layouts", () => state.layoutSchemas)
		.with("Schemas", () => state.dataSchemas)
		.exhaustive()
}

// The function definition
const itemCountReplacement= ({ value }: {value: unknown}) => {
	// This returns "Steve Rogers (Marvel)" for the node summary
	if (value instanceof Object && 'name' in value && value.name instanceof String)
		return `${value.name}`

	if (value instanceof Object && 'section_name' in value)
		return `${value.section_name}`

	return null
}


export const IdNode: React.FC<CustomNodeProps> = ({ children }) => {
	return null
}

const idNodeDefinition: CustomNodeDefinition = {
	// Condition is a regex to match ISO strings
	condition: ({ key }) => key == "id",
	element: IdNode,
	showOnView: false,
	showOnEdit: false,
	showEditTools: false,
}

const JsonEditor = (props: { currentTab: tab }) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);
	const [value, setValue] = useState(getTab(state!, props.currentTab));

	useEffect(() => {
		setValue(getTab(state!, props.currentTab));
	}, [props.currentTab, state?.resume.name]);


	return <LibEditor
		data={value}
		setData={(d: JsonData) => {
			match(props.currentTab)
				.returnType<void>()
				.with("Resume", () => dispatch!({ type: "load", value: d }))
				.with("JsonResume", () => dispatch!({ type: "load", value: convert(d as JsonResume) }))
				.with("Layouts", () => dispatch!({ type: "load-layout-schemas", value: d }))
				.with("Schemas", () => dispatch!({ type: "load-data-schemas", value: d }))
				.exhaustive()
			setValue(d)
		}} // optional
		minWidth="100%"
		rootName={"Resume"}
		collapse={2}
		collapseAnimationTime={0}
		indent={8}
		customText={{
			ITEM_SINGLE: itemCountReplacement,
			ITEMS_MULTIPLE: itemCountReplacement,
		}}
		customNodeDefinitions={[idNodeDefinition]}
	/>
}


const RawEditor = () => {
	const [currentTab, setCurrentTab] = useState<tab>("Resume");
	return (
		<div>
			<Tabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
			<JsonEditor currentTab={currentTab} />
		</div>
	)
};

export default RawEditor;
