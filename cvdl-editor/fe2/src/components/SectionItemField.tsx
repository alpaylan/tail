import { FieldProps } from "@/components/Section";
import { useContext, useState } from "react";
import { DocumentDispatchContext, EditorContext } from "@/components/State";
import { DocumentDataType, DateFormat, Field } from "cvdl-ts/dist/DataSchema";
import { match, P } from "ts-pattern";
import { ItemContent } from "cvdl-ts/dist/Resume";
import * as Utils from "cvdl-ts/dist/Utils";

export function debounce<T extends Function>(cb: T, wait = 200) {
	let h = 0;
	let callable = (...args: any) => {
		clearTimeout(h);
		h = setTimeout(() => cb(...args), wait) as any;
	};
	return callable as any as T;
}

const DefaultEditor = ({
	section,
	item,
	field,
}: {
	section: string;
	item: number;
	field: FieldProps & { value: ItemContent.PureString }
}) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);

	return (
		<input
			id={`${section}-${item}-${field.name}`}
			type="text"
			defaultValue={field.value.value}
			autoFocus={
				state?.editorPath?.tag === "field" &&
				state.editorPath.section === section &&
				state.editorPath.item === item &&
				state.editorPath.field === field.name
			}
			onChange={(e) => {
				const value = e.target.value;
				dispatch!({
					type: "field-update",
					section: section,
					item: item,
					field: field.name,
					value: { tag: "String", value: value },
				});
			}}
		/>
	);
};

const DateEditor = ({
	section,
	item,
	field,
}: {
	section: string;
	item: number;
	field: FieldProps & { type: DocumentDataType.Date, value: ItemContent.PureString };
}) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);
	const [value, setValue] = useState(DateFormat.parse(field.value.value));
	const [dateFormat, setDateFormat] = useState<DateFormat.t>(field.type.format);
	return (
		<div>
			<input
				id={`${section}-${item}-${field.name}`}
				type="date"
				defaultValue={DateFormat.parse(field.value.value)}
				autoFocus={
					state?.editorPath?.tag === "field" &&
					state.editorPath.section === section &&
					state.editorPath.item === item &&
					state.editorPath.field === field.name
				}
				onChange={(e) => {
					const value = e.target.value;
					setValue(value);
					dispatch!({
						type: "field-update",
						section: section,
						item: item,
						field: field.name,
						value: {
							tag: "String",
							value: DateFormat.print(value, dateFormat),
						},
					});
				}}
			/>
			<select
				value={dateFormat}
				defaultValue={field.type.format}
				onChange={(e) => {
					setDateFormat(e.target.value as DateFormat.t);
					dispatch!({
						type: "field-update",
						section: section,
						item: item,
						field: field.name,
						value: {
							tag: "String",
							value: DateFormat.print(value, e.target.value as DateFormat.t),
						},
					});
				}}
			>
				{DateFormat.formats.map((format) => {
					return (
						<option key={format} value={format}>
							{format}
						</option>
					);
				})}
			</select>
		</div>
	);
};

const MarkdownEditor = ({
	section,
	item,
	field,
}: { section: string; item: number; field: FieldProps & { value: ItemContent.PureString } }) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);

	return (
		<textarea
			id={`${section}-${item}-${field.name}`}
			defaultValue={field.value.value}
			style={{ width: "100%", height: "200px" }}
			autoFocus={
				state?.editorPath?.tag === "field" &&
				state.editorPath.section === section &&
				state.editorPath.item === item &&
				state.editorPath.field === field.name
			}
			onChange={(e) => {
				const value = e.target.value;
				dispatch!({
					type: "field-update",
					section: section,
					item: item,
					field: field.name,
					value: { tag: "String", value: value },
				});
			}}
		/>
	);
};

const ListEditor = ({
	section,
	item,
	field,
}: { section: string; item: number; field: FieldProps & { value: ItemContent.List } }) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);
	const [items, setItems] = useState(field.value.value);
	return (
		<div id={`${section}-${item}-${field.name}`}>
			{
				items.map((listItem, index) => {
					return (<div>
						<input
							type="text"
							// TODO: This currently only works when you have List<String>
							value={items[index].value}
							autoFocus={
								state?.editorPath?.tag === "field" &&
								state.editorPath.section === section &&
								state.editorPath.item === item &&
								state.editorPath.field === field.name
							}
							onChange={(e) => {
								const value = e.target.value;
								const newItems = [...items];
								newItems[index] = ItemContent.string(value);
								setItems(newItems);
								dispatch!({
									type: "field-update",
									section: section,
									item: item,
									field: field.name,
									value: { tag: "List", value: newItems }
								});
							}}
						/>
						<button onClick={() => {
							const newItems = [...items, items[index]];
							setItems(newItems);
							dispatch!({
								type: "field-update",
								section: section,
								item: item,
								field: field.name,
								value: { tag: "List", value: newItems }
							});
						}} className="bordered">+</button>
						<button onClick={() => {
							items.splice(index, 1);
							const newItems = [...items];
							setItems(newItems);
							dispatch!({
								type: "field-update",
								section: section,
								item: item,
								field: field.name,
								value: { tag: "List", value: newItems }
							});
						}} className="bordered">-</button>
					</div>
					)
				})
			}
			<button onClick={() => {
				const newItems = [...items, ItemContent.string("")];
				setItems(newItems);
				dispatch!({
					type: "field-update",
					section: section,
					item: item,
					field: field.name,
					value: { tag: "List", value: newItems }
				});
			}} className="bordered">+</button>
		</div>
	);
};

const UrlEditor = ({
	section,
	item,
	field,
}: { section: string; item: number; field: FieldProps & { value: ItemContent.Url } }) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);
	const [text, setText] = useState(field.value.value.text);
	const [url, setUrl] = useState(field.value.value.url);

	return (
		<div>
			<input
				id={`${section}-${item}-${field.name}`}
				type="text"
				defaultValue={field.value.value.text}
				autoFocus={
					state?.editorPath?.tag === "field" &&
					state.editorPath.section === section &&
					state.editorPath.item === item &&
					state.editorPath.field === field.name
				}
				onChange={(e) => {
					const value = e.target.value;
					setText(value);
					dispatch!({
						type: "field-update",
						section: section,
						item: item,
						field: field.name,
						value: { tag: "Url", value: { text: value, url: url } },
					});
				}}
			/>
			<input
				id={`${section}-${item}-${field.name}`}
				type="text"
				defaultValue={field.value.value.url}
				autoFocus={
					state?.editorPath?.tag === "field" &&
					state.editorPath.section === section &&
					state.editorPath.item === item &&
					state.editorPath.field === field.name
				}
				onChange={(e) => {
					const value = e.target.value;
					setUrl(value);
					dispatch!({
						type: "field-update",
						section: section,
						item: item,
						field: field.name,
						value: { tag: "Url", value: { text: text, url: value } },
					});
				}}
			/>
		</div>
	);
};



const SectionItemField = ({
	section,
	item,
	field,
}: { section: string; item: number; field: FieldProps }) => {
	return (
		<div key={field.name} style={{ display: "flex", flexDirection: "column" }}>
			<b> {field.name} </b>
			{match(field.type)
				.with({ tag: "String" }, () => (
					<DefaultEditor section={section} item={item} field={field as FieldProps & { value: ItemContent.PureString }} />
				))
				.with({ tag: "MarkdownString" }, () => (
					<MarkdownEditor section={section} item={item} field={field as FieldProps & { value: ItemContent.PureString }} />
				))
				.with({ tag: "Date" }, () => (
					<DefaultEditor
						section={section}
						item={item}
						field={field as FieldProps & { value: ItemContent.PureString }}
					/>
				))
				.with({ tag: "List" }, () => (
					<ListEditor section={section} item={item} field={field as FieldProps & { value: ItemContent.List }} />
				))
				.with({ tag: "Types" }, () => (
					<DefaultEditor section={section} item={item} field={field as FieldProps & { value: ItemContent.PureString }} />
				))
				.with({ tag: "Url" }, () => (
					<UrlEditor section={section} item={item} field={field as FieldProps & { value: ItemContent.Url }} />
				))
				.otherwise(() => (
					<></>
				))}
		</div>
	);
};

export default SectionItemField;
