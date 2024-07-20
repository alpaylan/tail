"use client";

import { DataSchema } from "cvdl-ts/dist/DataSchema";
import { useState } from "react";

const DataSchemaEditor = ({ dataSchemas }: { dataSchemas: DataSchema[] }) => {
	const [dataSchema, setDataSchema] = useState<DataSchema | null>(null);
	const dataSchemaNames = dataSchemas.map((schema) => schema.schema_name);
	return (
		<div>
			<h1>Layout Editor</h1>

			<div style={{ display: "flex", flexDirection: "row" }}>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "left",
						width: "50%",
					}}
				>
					{dataSchemaNames && dataSchemaNames.length !== 0 && <h2>Schemas</h2>}
					{[...new Set(dataSchemaNames)].map((name, index) => {
						return (
							<button
								className="bordered"
								key={index}
								onClick={() => {
									const dataSchema = dataSchemas.find(
										(schema) => schema.schema_name === name,
									)!;
									setDataSchema(dataSchema);
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
					}}
				>
					{dataSchema && (
						<>
							<h2>{dataSchema.schema_name}</h2>
							{dataSchema.header_schema.map((field, index) => {
								return <span key={index}>{field.name}</span>;
							})}
							{dataSchema.item_schema.map((field, index) => {
								return <span key={index}>{field.name}</span>;
							})}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default DataSchemaEditor;
