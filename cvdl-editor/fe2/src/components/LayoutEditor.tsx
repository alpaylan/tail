"use client";
import { EditorContext, DocumentDispatchContext } from "@/components/State";
import { Alignment } from "cvdl-ts/dist/Alignment";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
import { FontStyle, FontWeight } from "cvdl-ts/dist/Font";
import { Color, ColorMap, Elem, Row, SectionLayout, Stack } from "cvdl-ts/dist/Layout";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { LocalStorage } from "cvdl-ts/dist/LocalStorage";
import { useContext, useEffect, useState } from "react";


type LensStep = {
    'attribute': string,
} | {
    'index': number,
};

type Lens = LensStep[];

const followLens = (lens: Lens, obj: any) => {
    return lens.reduce((acc, step) => {
        if ('attribute' in step) {
            return acc[step.attribute];
        } else {
            return acc.inner.elements[step.index];
        }
    }, obj);
}

type LayoutVisitorStep = 'down' | 'up' | 'next' | 'prev';
type LayoutVisitor = LayoutVisitorStep[];
const layoutFollowLens = (lens: LayoutVisitor, layout: SectionLayout) => {
    let current = layout;
    let parents = [];

    for (let step of lens) {
        switch (step) {
            case 'down': {
                if (current.inner.tag === "Elem") {
                    throw new Error("Cannot go down from Elem");
                }
                parents.push(current);
                current = current.inner.elements[0];
                break;
            }
            case 'up': {
                let parent = parents.pop();
                if (parent === undefined) {
                    throw new Error("Cannot go up from root");
                }
                current = parent;
                break;
            }
            case 'next': {
                let parent = parents.pop();
                if (parent === undefined) {
                    throw new Error("Cannot go next from root");
                }
                let index = (parent.inner as Row | Stack).elements.indexOf(current);
                if (index === -1) {
                    throw new Error("Cannot find current element in parent");
                }
                if (index === (parent.inner as Row | Stack).elements.length - 1) {
                    throw new Error("Cannot go next from last element");
                }
                current = (parent.inner as Row | Stack).elements[index + 1];
                break;
            }
            case 'prev':
                let parent = parents.pop();
                if (parent === undefined) {
                    throw new Error("Cannot go prev from root");
                }
                let index = (parent.inner as Row | Stack).elements.indexOf(current);
                if (index === -1) {
                    throw new Error("Cannot find current element in parent");
                }
                if (index === 0) {
                    throw new Error("Cannot go prev from first element");
                }
                current = (parent.inner as Row | Stack).elements[index - 1];
                break;
        }
    }
}


const ControlPanel = (props: { layout: SectionLayout, layoutSchema: LayoutSchema, setLayout: any, lens: Lens, setLens: (lens: Lens) => void }) => {
    const current = followLens(props.lens, props.layoutSchema);
    switch (current.inner.tag) {
        case "Row":
            return <ContainerControlPanel current={current} layout={props.layout} layoutSchema={props.layoutSchema} setLayout={props.setLayout} lens={props.lens} setLens={props.setLens} />;
        case "Stack":
            return <ContainerControlPanel current={current} layout={props.layout} layoutSchema={props.layoutSchema} setLayout={props.setLayout} lens={props.lens} setLens={props.setLens} />;
        case "Elem":
            return <ElemControlPanel current={current} layout={props.layout} layoutSchema={props.layoutSchema} setLayout={props.setLayout} lens={props.lens} setLens={props.setLens} />;
        default:
            return <p>Unknown tag</p>;
    }
}

const ContainerControlPanel = (props: { current: SectionLayout, layout: SectionLayout, layoutSchema: LayoutSchema, setLayout: any, lens: Lens, setLens: (lens: Lens) => void }) => {
    const [newElement, setNewElement] = useState<string>("");
    const container = props.current.inner as Stack | Row;
    // const randomKey = Math.random().toString(36).substring(7);
    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            <div className="panel" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                <div style={{ width: "100%", padding: "20px" }}>
                    <b>{container.tag}({container.elements.map((layout) =>
                        layout.inner.tag === "Elem" ? layout.inner.item : layout.inner.tag
                    ).join(" | ")})</b>
                </div>
                <div className="panel-item">
                    <label>Alignment</label>
                    <select name="alignment" value={container.alignment} onChange={(e) => {
                        container.alignment = (e.target.value as Alignment);
                        props.setLayout(props.layout)
                    }}>
                        <option value="Left">Left</option>
                        <option value="Right">Right</option>
                        <option value="Center">Center</option>
                        <option value="Justify">Justify</option>
                    </select>
                </div>
                <div className="panel-item">
                    <label>Width</label>

                    <select name="width" value={container.width.tag} onChange={(e) => {
                        container.width.tag = (e.target.value as "Fill" | "Percent" | "Absolute");
                        props.setLayout(props.layout)

                    }}>
                        <option value="Fill">Fill</option>
                        <option value="Percent">Percent(%)</option>
                        <option value="Absolute">Absolute(px)</option>
                    </select>
                    {
                        container.width.tag !== "Fill" &&
                        <input type="number" value={container.width.value} onChange={(e) => {
                            let value = parseInt(e.target.value);
                            if (value > 0) {
                                // @ts-ignore
                                container.width.value = value;
                                props.setLayout(props.layout)
                            }
                        }} />
                    }
                </div>
                <div className="panel-item">
                    <button className="bordered" onClick={() => {
                        const parent = followLens(props.lens.slice(0, -1), props.layoutSchema);
                        const index = (parent.inner as Row | Stack).elements.indexOf(props.current);
                        (parent.inner as Row | Stack).elements.splice(index, 1);
                        props.setLens(props.lens.slice(0, -1));
                        props.setLayout(props.layout);
                    }}>Delete</button>
                </div>

                <div className="panel-item-elements">
                    {container.elements.length !== 0 && <label>Elements</label>}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {
                            container.elements.map((element, index) => {
                                return (
                                    <div key={index} style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",

                                    }}>
                                        <button className="bordered" onClick={() => {
                                            props.setLayout(props.layout);
                                            props.lens.push({ 'index': index });
                                        }}>{
                                                element.inner.tag === "Elem" ? `Elem(${element.inner.item})` : element.inner.tag
                                            }</button>
                                        <div>
                                            {<button className="bordered"
                                                disabled={index === 0}
                                                style={{
                                                    color: index === 0 ? "lightgrey" : undefined,
                                                    borderColor: index === 0 ? "lightgrey" : undefined,
                                                }}
                                                onClick={() => {
                                                    const temp = container.elements[index];
                                                    container.elements[index] = container.elements[index - 1];
                                                    container.elements[index - 1] = temp;
                                                    props.setLayout(props.layout);
                                                }}>{container.tag === "Stack" ? "↑" : "←"}</button>}
                                            {<button className="bordered"
                                                disabled={index >= container.elements.length - 1}
                                                style={{
                                                    color: index >= container.elements.length - 1 ? "lightgrey" : undefined,
                                                    borderColor: index >= container.elements.length - 1 ? "lightgrey" : undefined,
                                                }}
                                                onClick={() => {
                                                    const temp = container.elements[index];
                                                    container.elements[index] = container.elements[index + 1];
                                                    container.elements[index + 1] = temp;
                                                    props.setLayout(props.layout);
                                                }}>{container.tag === "Stack" ? "↓" : "→"}</button>}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="panel-item-elements">
                    <label>Add New Text Element</label>
                    <input type="text" onChange={(e) => {
                        setNewElement(e.target.value);
                    }} />
                    <button className="bordered" onClick={() => {
                        const elem = Elem.default_();
                        elem.is_ref = false;
                        elem.item = newElement;
                        container.elements.push(new SectionLayout(elem));
                        props.setLayout(props.layout);
                    }}> Add</button>
                </div>
            </div>
        </div>
    );

}

const ElemControlPanel = (props: { current: SectionLayout, layout: SectionLayout, layoutSchema: LayoutSchema, setLayout: any, lens: Lens, setLens: (lens: Lens) => void }) => {
    const elem = props.current.inner as Elem;
    const [fontSize, setFontSize] = useState(elem.font.size);
    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            <div className="panel">
                <div style={{ width: "100%", padding: "20px" }}>
                    <b>Elem({elem.item})</b>
                </div>
                <div className="panel-item">
                    <label>Font Name</label>
                    <select name="font-name" value={elem.font.name} onChange={(e) => {
                        elem.font.name = e.target.value;
                        props.setLayout(props.layout)
                    }}>
                        <option value="Exo">Exo</option>
                    </select>
                </div>
                <div className="panel-item">
                    <label>Font Size</label>
                    <input type="number" value={fontSize} onChange={(e) => {
                        let value = parseInt(e.target.value);
                        setFontSize(value);
                        if (value > 8) {
                            elem.font.size = parseInt(e.target.value);
                            props.setLayout(props.layout)
                        }
                    }} />
                </div>
                <div className="panel-item">
                    <label>Font Weight</label>
                    <select name="font-weight" value={elem.font.weight} onChange={(e) => {
                        elem.font.weight = (e.target.value as FontWeight);
                        props.setLayout(props.layout)
                    }}>
                        <option value="Thin">Thin</option>
                        <option value="Medium">Medium</option>
                        <option value="Bold">Bold</option>
                    </select>
                </div>
                <div className="panel-item">
                    <label>Font Style</label>
                    <select name="font-style" value={elem.font.style} onChange={(e) => {
                        elem.font.style = (e.target.value as FontStyle);
                        props.setLayout(props.layout)
                    }}>
                        <option value="Italic">Italic</option>
                        <option value="Normal">Normal</option>
                        <option value="Oblique">Oblique</option>
                    </select>
                </div>
                <div className="panel-item">
                    <label>Alignment</label>
                    <select name="alignment" value={elem.alignment} onChange={(e) => {
                        elem.alignment = (e.target.value as Alignment);
                        props.setLayout(props.layout)
                    }}>
                        <option value="Left">Left</option>
                        <option value="Right">Right</option>
                        <option value="Center">Center</option>
                        <option value="Justify">Justify</option>
                    </select>
                </div>
                <div className="panel-item">
                    <label>Background</label>
                    <select name="alignment" value={elem.background_color} onChange={(e) => {
                        elem.background_color = (e.target.value as Color);
                        props.setLayout(props.layout)
                    }}>
                        {
                            Object.keys(ColorMap).map((k) => {
                                return (<option key={k} value={k}>{k}</option>)
                            })
                        }
                    </select>
                </div>
                <div className="panel-item">
                    <label>Width</label>

                    <select name="width" value={elem.width.tag} onChange={(e) => {
                        elem.width.tag = (e.target.value as "Fill" | "Percent" | "Absolute");
                        props.setLayout(props.layout)

                    }}>
                        <option value="Fill">Fill</option>
                        <option value="Percent">Percent(%)</option>
                        <option value="Absolute">Absolute(px)</option>
                    </select>
                    {
                        elem.width.tag !== "Fill" &&
                        <input type="number" value={elem.width.value} onChange={(e) => {
                            let value = parseInt(e.target.value);
                            if (value > 0) {
                                // @ts-ignore
                                elem.width.value = value;
                                props.setLayout(props.layout)
                            }
                        }} />
                    }
                </div>
                <div className="panel-item">
                    <button className="bordered" onClick={() => {
                        const parent = followLens(props.lens.slice(0, -1), props.layoutSchema);
                        const index = (parent.inner as Row | Stack).elements.indexOf(props.current);
                        (parent.inner as Row | Stack).elements.splice(index, 1);
                        props.setLens(props.lens.slice(0, -1));
                        props.setLayout(props.layout);
                    }}>Delete</button>
                </div>
                {!elem.is_ref &&
                    <div className="panel-item">
                        <label>Change Text</label>
                        <input type="text" value={elem.item} onChange={(e) => {
                            elem.item = e.target.value;
                            props.setLayout(props.layout)
                        }} />
                    </div>
                }
            </div>

        </div>
    );

}


const RowEditor = (props: { layout: any, lens: Lens, setLens: any }) => {
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
            {
                props.layout.inner.elements.map((item: any, index: number) => {
                    return <LayoutEditWindow key={index} layout={item} lens={[...props.lens, { 'index': index }]} setLens={props.setLens} />
                })
            }
        </fieldset>
    );
}

const StackEditor = (props: { layout: any, lens: Lens, setLens: any }) => {
    return (
        <fieldset
            className="layout-editor-stack"
            onClick={(e) => {
                props.setLens([...props.lens]);
                e.stopPropagation();
            }}
        >
            <legend>Stack</legend>
            {
                props.layout.inner.elements.map((item: any, index: number) => {
                    return <LayoutEditWindow key={index} layout={item} lens={[...props.lens, { 'index': index }]} setLens={props.setLens} />
                })
            }
        </fieldset>
    );
}

const ItemEditor = (props: { layout: any, lens: Lens, setLens: any }) => {
    return (
        <div
            className="layout-editor-item"
            style={{
                fontFamily: props.layout.inner.font.name + ", sans-serif",
                fontSize: props.layout.inner.font.size,
                fontWeight: props.layout.inner.font.weight,
                fontStyle: props.layout.inner.font.style,
                justifySelf: props.layout.inner.alignment,
                width: props.layout.inner.width.value + "%",
                border: "1px solid black",
                padding: "5px"
            }}
            onClick={(e) => {
                props.setLens([...props.lens]);
                e.stopPropagation();
            }}
        >{props.layout.inner.item}
        </div>
    );
}

const TagSwitch = (props: { tag: string, layout: LayoutSchema, lens: any, setLens: any }) => {
    switch (props.tag) {
        case "Row":
            return <RowEditor layout={props.layout} lens={props.lens} setLens={props.setLens} />;
        case "Stack":
            return <StackEditor layout={props.layout} lens={props.lens} setLens={props.setLens} />;
        case "Elem":
            return <ItemEditor layout={props.layout} lens={props.lens} setLens={props.setLens} />;
        default:
            return <p>Unknown tag</p>;
    }
}


const LayoutEditWindow = (props: { layout: any, lens: any, setLens: any }) => {

    return (
        <TagSwitch tag={props.layout.inner.tag} layout={props.layout} lens={props.lens} setLens={props.setLens} />
    );
}

const markUsedElements = (layout: LayoutSchema, dataSchema: DataSchema) => {
    const elements: { [key: string]: boolean } = {};

    if (dataSchema === null || layout === null) {
        return elements;
    }

    dataSchema.item_schema.forEach((item) => {
        elements[item.name] = false;
    });

    const markUsed = (layout: any) => {
        if (layout.inner.tag === "Elem") {
            if (layout.inner.is_ref) {
                elements[layout.inner.item] = true;
            }
        } else {
            layout.inner.elements.forEach((element: any) => {
                markUsed(element);
            });
        }
    }

    markUsed(layout.header_layout_schema);
    markUsed(layout.item_layout_schema);

    return elements;
}

const unusedElements = (layout: LayoutSchema, dataSchema: DataSchema) => {
    const elements = markUsedElements(layout, dataSchema);
    return Object.entries(elements).filter((entry) => !entry[1]).map((entry) => entry[0]);
}


const AddNewLayout = (props: { copy: boolean, dataSchemas: DataSchema[], layoutSchemas: LayoutSchema[] }) => {
    const dispatch = useContext(DocumentDispatchContext);
    const [addingSection, setAddingSection] = useState<boolean>(false);
    const [sectionName, setSectionName] = useState<string>("");
    const [dataSchema, setDataSchema] = useState<string>(props.dataSchemas[0].schema_name ?? "");
    const [availableLayoutSchemas, setAvailableLayoutSchemas] = useState<LayoutSchema[]>(props.layoutSchemas);
    const [layoutSchema, setLayoutSchema] = useState<string>(availableLayoutSchemas.length > 0 ? availableLayoutSchemas[0].schema_name ?? "" : "");

    return (
        <>
            {!addingSection &&
                <button className='bordered' onClick={() => {
                    setAddingSection(!addingSection);
                }}>⊕ {props.copy ? "Copy Existing Layout" : "Create New Layout from Scratch"} </button>
            }
            {addingSection &&
                <div className='panel'>
                    <div className='panel-item'>
                        <label>Layout Name</label>
                        <input type="text" value={sectionName} placeholder="Layout name" onChange={(e) => setSectionName(e.target.value)} />
                    </div>
                    <div className='panel-item'>
                        <label>Data Schema</label>
                        <select value={dataSchema} onChange={(e) => {
                            setDataSchema(e.target.value);
                            setAvailableLayoutSchemas(props.layoutSchemas.filter((schema) => schema.data_schema_name === e.target.value));
                        }}>
                            {props.dataSchemas.map((schema) => {
                                return <option key={schema.schema_name} value={schema.schema_name}>{schema.schema_name}</option>
                            })}
                        </select>
                    </div>
                    {props.copy && <div className='panel-item'>
                        <label>Layout Schema</label>
                        <select value={layoutSchema} onChange={(e) => {
                            setLayoutSchema(e.target.value);
                        }}>
                            {availableLayoutSchemas.map((schema) => {
                                return <option key={schema.schema_name} value={schema.schema_name}>{schema.schema_name}</option>
                            })}
                        </select>
                    </div>}
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        <div className='panel-item'>
                            <button className='bordered' onClick={() => {
                                setAddingSection(!addingSection);
                            }}> Cancel </button>
                        </div>
                        <div className='panel-item'>
                            <button className='bordered' onClick={() => {
                                setAddingSection(!addingSection);
                                const storage = new LocalStorage();
                                const newLayout = props.copy ?
                                    storage.load_layout_schema(layoutSchema)
                                    : new LayoutSchema(sectionName, dataSchema, new SectionLayout(Stack.default_()), new SectionLayout(Stack.default_()));
                                newLayout.data_schema_name = dataSchema;
                                newLayout.schema_name = sectionName;

                                storage.save_layout_schema(newLayout);
                                dispatch!({
                                    type: "add-layout",
                                    layout_schema: newLayout
                                });
                            }}> Add </button>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}


const LayoutEditor = () => {
    const editorContext = useContext(EditorContext);
    const resumeContext = editorContext?.resume;
    const dispatch = useContext(DocumentDispatchContext);

    const layoutSchemaNames = resumeContext?.layout_schemas();
    const [layoutSchema, setLayoutSchema] = useState<LayoutSchema | null>(null);
    const [dataSchema, setDataSchema] = useState<DataSchema | null>(null);
    const [layoutSchemaControlPanel, setLayoutSchemaControlPanel] = useState<Lens | null>(null);
    const [creatingNewLayoutSchema, setCreatingNewLayoutSchema] = useState<boolean>(false);
    const [selectedLayout, setSelectedLayout] = useState<SectionLayout | null>(null);
    const [allAvailableLayouts, setAllAvailableLayouts] = useState<string[]>([]);
    const storage = new LocalStorage();
    const dataSchemas = storage.list_data_schemas().map((name) => storage.load_data_schema(name));
    const layoutSchemas = storage.list_layout_schemas().map((name) => storage.load_layout_schema(name));

    useEffect(() => {
        const storage = new LocalStorage();
        setAllAvailableLayouts(storage.list_layout_schemas());
    }, []);

    useEffect(() => {
        if (layoutSchemaControlPanel === null || layoutSchema === null) {
            return;
        }
        const current = followLens(layoutSchemaControlPanel!, layoutSchema!);
        setSelectedLayout(current);
    }, [layoutSchema, layoutSchemaControlPanel]);
    const setLayout = (sectionLayout: SectionLayout) => {
        if (!layoutSchema) {
            return;
        }
        const storage = new LocalStorage();
        layoutSchema.item_layout_schema = sectionLayout;
        setLayoutSchema(layoutSchema);
        storage.save_layout_schema(layoutSchema);
        dispatch!({ type: "layout-update", layout: layoutSchema });
    }
    return (
        <div>
            <h1>Layout Editor</h1>

            {(layoutSchemas && dataSchemas) && <AddNewLayout copy={true} layoutSchemas={layoutSchemas} dataSchemas={dataSchemas} />}
            {(layoutSchemas && dataSchemas) && <AddNewLayout copy={false} layoutSchemas={layoutSchemas} dataSchemas={dataSchemas} />}

            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "left", width: "50%", maxHeight: "300px", overflowY: "scroll" }}>
                    {
                        (layoutSchemaNames && layoutSchemaNames.length !== 0) &&
                        <h2>Currently Used Layouts</h2>
                    }
                    {
                        [...new Set(layoutSchemaNames)].map((name, index) => {
                            return <button className="bordered" key={index} onClick={() => {
                                const storage = new LocalStorage();
                                const schema = storage.load_layout_schema(name);
                                setLayoutSchema(schema);
                                setLayoutSchemaControlPanel(null);
                                setDataSchema(storage.load_data_schema(schema.data_schema_name));
                            }}>{name}</button>
                        })
                    }
                </div>


                <div style={{ display: "flex", flexDirection: "column", justifyContent: "left", width: "50%", maxHeight: "300px", overflowY: "scroll" }}>
                    <h2>All Available Layouts</h2>
                    {
                        allAvailableLayouts.map((name, index) => {
                            if (layoutSchemaNames?.includes(name)) {
                                return null;
                            }
                            return <button className="bordered" key={index} onClick={() => {
                                const storage = new LocalStorage();
                                const schema = storage.load_layout_schema(name);
                                setLayoutSchema(schema);
                                setLayoutSchemaControlPanel(null);
                                setDataSchema(storage.load_data_schema(schema.data_schema_name));
                            }}>{name}</button>
                        })
                    }
                </div>
            </div>

            {
                layoutSchema !== null ?
                    <>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", flexDirection: "column", padding: "10px" }}>
                                <LayoutEditWindow setLens={setLayoutSchemaControlPanel} lens={[{ 'attribute': 'header_layout_schema' }]} layout={layoutSchema.header_layout_schema} />
                                <div style={{ height: "5px" }}></div>
                                <LayoutEditWindow setLens={setLayoutSchemaControlPanel} lens={[{ 'attribute': 'item_layout_schema' }]} layout={layoutSchema.item_layout_schema} />
                            </div>
                            {
                                layoutSchemaControlPanel !== null && <ControlPanel layout={layoutSchema.item_layout_schema} layoutSchema={layoutSchema} setLayout={setLayout} lens={layoutSchemaControlPanel} setLens={setLayoutSchemaControlPanel} />
                            }
                        </div>
                    </> :
                    creatingNewLayoutSchema &&
                    <div>
                        {
                            resumeContext?.data_schemas().map((name, index) => {
                                return <button key={index} onClick={() => {
                                    const storage = new LocalStorage();
                                    const schema = storage.load_data_schema(name);
                                    setDataSchema(schema);
                                }}>{name}</button>
                            })
                        }
                        <button onClick={() => setCreatingNewLayoutSchema(false)}>Cancel</button>

                    </div>
            }
            {
                (dataSchema !== null && selectedLayout && selectedLayout.inner.tag !== "Elem") &&
                <div>
                    {
                        unusedElements(layoutSchema!, dataSchema).map((used, index) => {
                            return <button
                                key={index}
                                style={{
                                    color: used[1] ? "black" : "red",
                                    border: "1px solid black",
                                    margin: "2px",
                                    padding: "2px",
                                    borderRadius: "5px"
                                }}
                                onClick={() => {
                                    const elem = Elem.default_();
                                    elem.is_ref = true;
                                    elem.item = used;
                                    (selectedLayout!.inner as Row | Stack).elements.push(new SectionLayout(elem));
                                    setLayout(selectedLayout!);
                                }}>{used} +</button>
                        })
                    }
                </div>

            }
        </div>
    );
}

export default LayoutEditor;