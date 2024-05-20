import SectionItemField from './SectionItemField';
import { useContext, useState } from 'react';
import { DocumentDispatchContext, EditorContext } from "@/components/State"

export type FieldProps = {
    name: string;
    value: string;
    isActive: boolean;
}

export type ItemProps = FieldProps[];
export type SectionProps = ItemProps[];


const ItemHeader = ({ itemContent, showAll, section, item, moveUp, moveDown, copy }: {
    itemContent: ItemProps,
    showAll: () => void,
    section: string,
    item: number,
    moveUp: () => void,
    moveDown: () => void,
    copy: () => void,
}) => {
    // Pick the first two fields, and render them as the header. The first is normal, the second is italic.
    const dispatch = useContext(DocumentDispatchContext);

    if (itemContent.length < 2) {
        console.log(itemContent);
        console.warn("Section content is too short");
        return <></>
    }

    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} onClick={showAll}>
            <div style={{ display: "flex", flexDirection: "row" }}>
                {itemContent[0].isActive && <span>{itemContent[0].value}</span>}
                ,&nbsp;
                {itemContent[1].isActive && <span style={{ fontStyle: "italic" }}>{itemContent[1].value}</span>}
            </div>
            <div>
                <button className='bordered' onClick={(e) => { dispatch!({ type: 'delete-item', section: section, item: item }); e.stopPropagation() }} >&#x232B;</button>
                <button className='bordered' onClick={(e) => { moveUp(); e.stopPropagation() }}>↑</button>
                <button className='bordered' onClick={(e) => { moveDown(); e.stopPropagation() }}>↓</button>
                <button className='bordered' onClick={(e) => { copy(); e.stopPropagation() }}>&#x2398;</button>
            </div>
        </div>
    )
}


const SectionItem = ({ section, item, itemContent }: { section: string, item: number, itemContent: ItemProps }) => {
    const [fields, setFields] = useState<ItemProps>(itemContent);
    const state = useContext(EditorContext);
    const dispatch = useContext(DocumentDispatchContext);
    const editorPath = state?.editorPath;
    const showAll = editorPath?.tag === "item" && editorPath.section === section && editorPath.item === item;
    const toggleShowAll = () => {
        if (showAll) {
            dispatch!({ type: "set-editor-path", path: { tag: "section", section: section } });
        } else {
            dispatch!({ type: "set-editor-path", path: { tag: "item", section: section, item: item } });
        }
    }

    return (
        <div
            id={state?.resume.sections.find((s) => s.section_name === section)?.items[item].id ?? undefined}
            className={`bordered-full ${!showAll ? 'clickable' : ''}`}
            style={{
                display: "flex",
                flexDirection: "column",
                padding: "10px",
            }}
        >

            {
                showAll ?
                    (
                        <>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <div style={{ display: "flex", flexDirection: "column", width: "80%" }}>
                                    {
                                        fields.map((field, index) => {
                                            if (!field.isActive) {
                                                return <></>
                                            };
                                            return (
                                                <SectionItemField key={index} section={section} item={item} field={field} />
                                            )
                                        })
                                    }
                                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginTop: "5px" }}>
                                        {
                                            fields.filter((ic) => !ic.isActive).map((field, index) => {
                                                return (
                                                    <div key={index} >
                                                        <button className='bordered'
                                                            onClick={() => { field.isActive = true; setFields([...fields]) }}
                                                        >
                                                            ⊕ {field.name}
                                                        </button>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>

                                <button className='bordered' style={{ marginRight: "0px", marginLeft: "auto", marginTop: "0px", marginBottom: "auto" }} onClick={toggleShowAll}>✗</button>
                            </div>
                        </>
                    )
                    : <ItemHeader
                        itemContent={fields}
                        section={section}
                        item={item}
                        showAll={toggleShowAll}
                        moveDown={() => dispatch!({ type: 'move-item', section: section, item: item, direction: 'down' })}
                        moveUp={() => dispatch!({ type: 'move-item', section: section, item: item, direction: 'up' })}
                        copy={() => dispatch!({ type: 'copy-item', section: section, item: item })}
                    />
            }
        </div>
    )

}

export default SectionItem;