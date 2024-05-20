
import { DataSchema } from 'cvdl-ts/dist/DataSchema';
import { ItemContent, ResumeSection } from 'cvdl-ts/dist/Resume';
import SectionItemField from './SectionItemField';
import { useContext, useState } from 'react';
import SectionItem from './SectionItem';
import { DocumentDispatchContext, EditorContext } from "@/components/State";
import { LayoutSchema } from 'cvdl-ts/dist/LayoutSchema';
import { ElementPath } from 'cvdl-ts/dist/AnyLayout';

export type FieldProps = {
    name: string;
    value: string;
    isActive: boolean;
}

export type ItemProps = FieldProps[];
export type SectionProps = ItemProps[];

const computeSectionContent = (section: ResumeSection, dataSchema?: DataSchema): SectionProps => {
    if (!dataSchema) {
        return [];
    }
    const sectionContent: SectionProps = [];
    section.items.forEach((item) => {
        const itemContent: ItemProps = [];
        dataSchema.item_schema.forEach((field) => {
            let name = field.name;
            let value = ItemContent.toString(item.fields.get(field.name) ?? ItemContent.None());
            let isActive = value !== "";
            itemContent.push({
                name,
                value,
                isActive
            });
        })
        sectionContent.push(itemContent);
    })
    return sectionContent;
}


const isHeader = (data_schema?: DataSchema) => {
    return data_schema && data_schema.item_schema.length === 0;
}

const Section = ({ section, dataSchemas, layoutSchemas }: { section: ResumeSection, dataSchemas: DataSchema[], layoutSchemas: LayoutSchema[] }) => {
    const dataSchema = dataSchemas.find((schema) => schema.schema_name === section.data_schema);
    const availableLayoutSchemas = layoutSchemas.filter((schema) => schema.data_schema_name === section.data_schema);
    const sectionContent = computeSectionContent(section, dataSchema);
    const state = useContext(EditorContext);
    const dispatch = useContext(DocumentDispatchContext);
    const editorPath = state?.editorPath;
    const showAll = (editorPath?.tag === "section" || editorPath?.tag === "item") && editorPath.section === section.section_name;
    const toggleShowAll = () => {
        if (showAll) {
            dispatch!({ type: "set-editor-path", path: { tag: "none" } as ElementPath });
        } else {
            dispatch!({ type: "set-editor-path", path: { tag: "section", section: section.section_name } as ElementPath });
        }
    }

    return (
        <div
            id={section.section_name}
            style={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid black",
                borderRadius: "5px",
                padding: "10px",
                marginBottom: "10px"
            }}
            className={showAll ? "" : "clickable"}
            onClick={showAll ? undefined : toggleShowAll}
        >
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "10px" }}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <h1 key={section.section_name} style={{ fontSize: "1.3em", fontWeight: "bold", marginRight: "10px" }} > {section.section_name} </h1>

                    {!isHeader(dataSchema) && <div className='bordered'>{sectionContent.length}</div>}
                </div>
                {showAll && <button className='bordered' onClick={toggleShowAll}> ✗ </button>}
            </div>
            {

                showAll &&
                <>

                    <div style={{ display: "flex", flexDirection: "row" }}>
                        {section.section_name && <button className='panel-item bordered' onClick={() => {
                            dispatch!({ type: "delete-section", section_name: section.section_name })
                        }
                        }> - Delete Section </button>}
                        {!isHeader(dataSchema) && <button className='panel-item bordered' onClick={() => {
                            dispatch!({ type: "add-empty-item", section: section.section_name })
                        }}> + Add New Item </button>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        <div className="panel-item" style={{ width: 'fit-content' }}>
                            <label>Data Schema</label>
                            <span className="bordered-full">{section.data_schema}</span>
                        </div>
                        <div className="panel-item" style={{ width: 'fit-content' }}>
                            <label>Layout Schema</label>
                            <select
                                value={section.layout_schema}
                                onChange={(e) => {
                                    dispatch!({ type: "section-layout-update", section_name: section.section_name, layout_schema_name: e.target.value });
                                }}
                            >
                                {
                                    availableLayoutSchemas.map((schema) => {
                                        return (
                                            <option key={schema.schema_name} value={schema.schema_name}>{schema.schema_name}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                    </div>
                    {
                        dataSchema?.header_schema.map((field) => {
                            return (
                                <SectionItemField key={field.name} section={section.section_name} item={-1} field={{ name: field.name, value: ItemContent.toString(section.data.get(field.name) ?? ItemContent.None()), isActive: true }} />
                            )
                        })
                    }
                    {
                        sectionContent.map((itemContent, index) => {
                            return (
                                <SectionItem key={section.items[index].id} item={index} section={section.section_name} itemContent={itemContent} />
                            )
                        })
                    }
                </>
            }
        </div>)
}

export default Section;