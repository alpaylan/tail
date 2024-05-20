"use client";
import { EditorContext } from "@/components/State";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
import { LocalStorage } from "cvdl-ts/dist/LocalStorage";
import { useContext, useState } from "react";

const DataSchemaEditor = () => {
    const editorContext = useContext(EditorContext);
    const resumeContext = editorContext?.resume;

    const layoutSchemaNames = resumeContext?.layout_schemas();
    const [dataSchema, setDataSchema] = useState<DataSchema | null>(null);
    const storage = new LocalStorage();
    const dataSchemas = storage.list_data_schemas().map((name) => storage.load_data_schema(name));
    const dataSchemaNames = dataSchemas.map((schema) => schema.schema_name);
    return (
        <div>
            <h1>Layout Editor</h1>

            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "left", width: "50%" }}>
                    {
                        (dataSchemaNames && dataSchemaNames.length !== 0) &&
                        <h2>Schemas</h2>
                    }
                    {
                        [...new Set(dataSchemaNames)].map((name, index) => {
                            return <button className="bordered" key={index} onClick={() => {
                                const storage = new LocalStorage();
                                const schema = storage.load_data_schema(name);
                                setDataSchema(schema);
                            }}>{name}</button>
                        })
                    }
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "left", width: "50%" }}>
                    {
                        dataSchema &&
                        (
                            <>
                            <h2>{dataSchema.schema_name}</h2>
                            {
                                dataSchema.header_schema.map((field, index) => {
                                    return (<span key={index}>{field.name}</span>);
                                })
                            }
                            {
                                dataSchema.item_schema.map((field, index) => {
                                    return (<span key={index}>{field.name}</span>);
                                })
                            }
                            </>

                        )

                    }
                </div>
            </div>
        </div>
    );
}

export default DataSchemaEditor;