import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
import { useContext, useEffect, useState } from "react";
import { DocumentDispatchContext, EditorContext } from "./State";


const AddNewSection = (props: { dataSchemas: DataSchema[], layoutSchemas: LayoutSchema[] }) => {
  const state = useContext(EditorContext);
  const dispatch = useContext(DocumentDispatchContext);
  const [addingSection, setAddingSection] = useState<boolean>(false);
  const [sectionName, setSectionName] = useState<string>("");
  const [dataSchema, setDataSchema] = useState<string>(props.dataSchemas[0].schema_name ?? "");
  const getAvailableLayoutSchemas = (dataSchema: string) => {
    return props.layoutSchemas.filter((schema) => schema.data_schema_name === dataSchema);
  }
  const availableLayoutSchemas = getAvailableLayoutSchemas(dataSchema);
  const [layoutSchema, setLayoutSchema] = useState<string>(availableLayoutSchemas.length > 0 ? availableLayoutSchemas[0].schema_name : "");

  const canAddSection = sectionName.length > 0
    && layoutSchema.length > 0
    && state?.resume.sections.filter((section) => section.section_name === sectionName).length === 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAddingSection(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [addingSection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canAddSection) {
        dispatch!({
          type: "add-empty-section",
          section_name: sectionName,
          layout_schema: layoutSchema
        });
        setAddingSection(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [canAddSection, sectionName, layoutSchema]);

  return (
    <>
      {!addingSection &&
        <button className='bordered' onClick={() => {
          setAddingSection(!addingSection);
        }}>⊕ Add new section </button>
      }
      {addingSection &&
        <div className='panel'>
          <div className='panel-item'>
            <label>Section Name</label>
            <input type="text" value={sectionName} placeholder="Section name" onChange={(e) => setSectionName(e.target.value)} />
          </div>
          <div className='panel-item'>
            <label>Data Schema</label>
            <select value={dataSchema} onChange={(e) => {
              setDataSchema(e.target.value);
              const availableLayoutSchemas = getAvailableLayoutSchemas(e.target.value);
              setLayoutSchema(availableLayoutSchemas.length > 0 ? availableLayoutSchemas[0].schema_name : "");
            }}>
              {props.dataSchemas.map((schema) => {
                return <option key={schema.schema_name} value={schema.schema_name}>{schema.schema_name}</option>
              })}
            </select>
          </div>
          <div className='panel-item'>
            <label>Layout Schema</label>
            <select value={layoutSchema} onChange={(e) => {
              console.error(e.target.value);
              setLayoutSchema(e.target.value);
            }}>
              {availableLayoutSchemas.map((schema) => {
                return <option key={schema.schema_name} value={schema.schema_name}>{schema.schema_name}</option>
              })}
            </select>
          </div>
          <div className='panel-item'>
            <button className='bordered' onClick={() => {
              setAddingSection(!addingSection);
            }}> Cancel </button>
          </div>
          <div className='panel-item'>
            <button className={`bordered ${canAddSection ? "" : "disabled"}`} disabled={!canAddSection} aria-disabled={!canAddSection} onClick={() => {
              setAddingSection(!addingSection);
              dispatch!({
                type: "add-empty-section",
                section_name: sectionName,
                layout_schema: layoutSchema
              });
            }}> Add </button>
          </div>
        </div>
      }
    </>
  )
}

export default AddNewSection;