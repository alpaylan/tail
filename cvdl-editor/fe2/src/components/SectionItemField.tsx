import { FieldProps } from "@/components/Section";
import { useContext, useState } from "react";
import { DocumentDispatchContext, EditorContext } from "@/components/State";
import { DocumentDataType, DateFormat, Field } from "cvdl-ts/dist/DataSchema";
import { match, P } from "ts-pattern";

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
}: { section: string; item: number; field: FieldProps }) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);

	return (
		<input
			id={`${section}-${item}-${field.name}`}
			type="text"
			defaultValue={field.value}
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
	field: FieldProps & { type: DocumentDataType.Date };
}) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);
	const [value, setValue] = useState(DateFormat.parse(field.value));
	const [dateFormat, setDateFormat] = useState<DateFormat.t>(field.type.format);
	return (
		<div>
			<input
				id={`${section}-${item}-${field.name}`}
				type="date"
				defaultValue={DateFormat.parse(field.value)}
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
}: { section: string; item: number; field: FieldProps }) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);

	return (
		<textarea
			id={`${section}-${item}-${field.name}`}
			defaultValue={field.value}
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
}: { section: string; item: number; field: FieldProps }) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);

	return (
		<input
			id={`${section}-${item}-${field.name}`}
			type="text"
			defaultValue={field.value}
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

const TypesEditor = ({
	section,
	item,
	field,
}: { section: string; item: number; field: FieldProps }) => {
	const state = useContext(EditorContext);
	const dispatch = useContext(DocumentDispatchContext);

	return (
		<input
			id={`${section}-${item}-${field.name}`}
			type="text"
			defaultValue={field.value}
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
					<DefaultEditor section={section} item={item} field={field} />
				))
				.with({ tag: "MarkdownString" }, () => (
					<MarkdownEditor section={section} item={item} field={field} />
				))
				.with({ tag: "Date" }, () => (
					<DefaultEditor
						section={section}
						item={item}
						field={field}
					/>
				))
				.with({ tag: "List" }, () => (
					<ListEditor section={section} item={item} field={field} />
				))
				.with({ tag: "Types" }, () => (
					<TypesEditor section={section} item={item} field={field} />
				))
				.otherwise(() => (
					<></>
				))}
		</div>
	);
};

export default SectionItemField;
