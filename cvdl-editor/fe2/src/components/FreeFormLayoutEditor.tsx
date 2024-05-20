"use client"

import React, { useContext, useEffect, useState } from 'react';
import { DocumentDispatchContext, EditorContext } from './State';
import { LayoutSchema } from 'cvdl-ts/dist/LayoutSchema';
import { DataSchema } from 'cvdl-ts/dist/DataSchema';
import { LocalStorage } from 'cvdl-ts/dist/LocalStorage';
import { SectionLayout } from 'cvdl-ts/dist/Layout';

type Position = {
    x: number,
    y: number
}

type Size = {
    width: number,
    height: number
}

type ItemElement = {
    tag: 'item',
    id: string,
    value: string,
    position: Position,
    size: Size,
    // debug symbol
    droppable?: boolean
};

type RowElement = {
    tag: 'row',
    id: string,
    position: Position,
    size: Size,
    children: FormElement[],
    // debug symbol
    droppable?: boolean
};

type ColumnElement = {
    tag: 'column',
    id: string,
    position: Position,
    size: Size,
    children: FormElement[],
    // debug symbol
    droppable?: boolean
};

type ContainerElement = RowElement | ColumnElement;
type FormElement = ItemElement | ContainerElement;

type Drag = {
    element: FormElement,
    offset: Position,
    inset: Position
}

const EMPTY_ELEMENT_HEIGHT = 50;
const EMPTY_ELEMENT_WIDTH = 100;
const PADDING = 10;


const emptyElement = (element: ContainerElement): ItemElement => {
    if (element.tag === 'row') {
        return {
            tag: 'item',
            id: `empty-${element.id}`,
            value: '>',
            position: { x: element.position.x + element.children.length * EMPTY_ELEMENT_WIDTH, y: element.position.y },
            size: { width: EMPTY_ELEMENT_WIDTH, height: element.size.height }
        };
    } else {
        return {
            tag: 'item',
            id: `empty-${element.id}`,
            value: 'v',
            position: { x: element.position.x, y: element.position.y + element.children.length * EMPTY_ELEMENT_HEIGHT },
            size: { width: element.size.width, height: EMPTY_ELEMENT_HEIGHT }
        };
    }
}

const renderElement = (element: FormElement, layer: number, ghost?: boolean) => {
    console.log('rendering', element);
    if (element.tag === 'item') {
        return (
            <div
                style={{
                    position: layer === 0 ? 'absolute' : undefined,
                    top: element.position.y,
                    left: element.position.x,
                    border: ghost ? '1px solid lightgrey' : '1px solid black',
                    padding: `${PADDING}px`,
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    backgroundColor: element.droppable ? 'lightgreen' : 'white',
                    color: ghost ? 'lightgrey' : 'black',
                    textAlign: 'center',
                    zIndex: layer + 1,
                    minWidth: element.size.width,
                    width: element.size.width,
                    minHeight: element.size.height,
                    height: element.size.height,
                    display: 'flex',
                    borderRadius: "3px"
                }}
            >
                {element.value}
            </div>
        );
    } else {
        return (
            <div
                style={{
                    position: layer === 0 ? 'absolute' : undefined,
                    top: layer === 0 ? element.position.y : undefined,
                    left: element.position.x,
                    border: ghost ? '1px solid lightgrey' : '1px solid black',
                    padding: `${PADDING}px`,
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    backgroundColor: element.droppable ? 'lightgreen' : 'white',
                    color: ghost ? 'lightgrey' : 'black',
                    zIndex: layer + 1,
                    minWidth: element.size.width,
                    width: element.size.width,
                    minHeight: element.size.height,
                    height: element.size.height,
                    display: element.tag === 'row' ? 'flex' : 'block',
                    flexDirection: element.tag === 'row' ? 'row' : undefined,
                    borderRadius: "3px"
                }}
            >
                <span style={{
                    position: 'absolute',
                    top: -10,
                    left: 3,
                    color: 'grey',
                    fontSize: '10px',
                    backgroundColor: 'white',
                    padding: '2px',
                    zIndex: 1000
                }}>
                    {element.tag}</span>
                {element.children.map((child) => renderElement(child, layer + 1))}
            </div>
        );
    }
}

const findElementOnPosition: (elements: FormElement[], position: Position) => FormElement | undefined = (elements: FormElement[], position: Position) => {
    const findMostInnerElement: (element: FormElement) => FormElement | undefined = (element: FormElement) => {
        console.log('element', element);
        console.log('position', position);
        if (!(position.x >= element.position.x &&
            position.x <= element.position.x + element.size.width &&
            position.y >= element.position.y &&
            position.y <= element.position.y + element.size.height
        )) {
            console.log('returning undefined');
            return undefined;
        }

        if (element.tag === 'item') {
            console.log('returning tag==item', element);
            return element;
        }

        const inner = element.children.find((child) => {
            return (
                position.x >= child.position.x &&
                position.x <= child.position.x + child.size.width &&
                position.y >= child.position.y &&
                position.y <= child.position.y + child.size.height
            );
        });

        if (!inner) {
            console.log('returning !inner', element);
            return element;
        }

        console.log('returning inner', inner);
        return findMostInnerElement(inner);
    }


    let result: FormElement | undefined = undefined;
    elements.forEach((element) => {
        const inner = findMostInnerElement(element);
        if (inner) {
            result = inner;
        }
    });
    return result;
}

const toFreeformElements = (layoutSchema: LayoutSchema): FormElement => {
    const toFreeformElement = (section: SectionLayout): FormElement => {
        if (section.inner.tag === 'Elem') {
            return {
                tag: 'item',
                id: section.inner.item,
                value: section.inner.item,
                position: { x: 10, y: 10 },
                size: { width: EMPTY_ELEMENT_WIDTH, height: EMPTY_ELEMENT_HEIGHT }
            };
        } else {
            const children = section.inner.elements.map((section) => toFreeformElement(section));
            return {
                tag: section.inner.tag === 'Row' ? 'row' : 'column',
                id: Math.random().toString(36).substring(7),
                position: { x: 10, y: 10 },
                size: { width: EMPTY_ELEMENT_WIDTH, height: EMPTY_ELEMENT_HEIGHT },
                children: children
            };
        }
    }

    return toFreeformElement(layoutSchema.item_layout_schema);
}

const resize = (element: FormElement) => {
    if (element.tag === "column") {
        let width = PADDING * 2;
        let height = PADDING * 2;
        element.children.forEach((child) => {
            child = resize(child);
            width = Math.max(width, child.size.width + PADDING * 2);
            height += child.size.height;
        });
        // height += EMPTY_ELEMENT_HEIGHT;
        element.size.width = width > EMPTY_ELEMENT_WIDTH ? width : EMPTY_ELEMENT_WIDTH;
        element.size.height = height > EMPTY_ELEMENT_HEIGHT ? height : EMPTY_ELEMENT_HEIGHT;

    } else if (element.tag === "row") {
        let width = PADDING * 2;
        let height = PADDING * 2;
        element.children.forEach((child) => {
            child = resize(child);
            width += child.size.width;
            height = Math.max(height, child.size.height + PADDING * 2);
        });
        element.size.width = width > EMPTY_ELEMENT_WIDTH ? width : EMPTY_ELEMENT_WIDTH;
        element.size.height = height > EMPTY_ELEMENT_HEIGHT ? height : EMPTY_ELEMENT_HEIGHT;
    }
    return element;
}

const FreeFormEditor = () => {
    const editorContext = useContext(EditorContext);
    const resumeContext = editorContext?.resume;
    const dispatch = useContext(DocumentDispatchContext);

    const layoutSchemaNames = resumeContext?.layout_schemas();
    const [layoutSchema, setLayoutSchema] = useState<LayoutSchema | null>(null);
    const [dataSchema, setDataSchema] = useState<DataSchema | null>(null);

    const [dragging, setDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<Position | null>(null);
    const [drag, setDrag] = useState<Drag | null>(null);
    const canvasRef = React.useRef<HTMLDivElement>(null);
    const [longPress, setLongPress] = useState<NodeJS.Timeout | null>(null);

    const detachElement = (element: FormElement) => {
        const detachElementSingle = (host: FormElement, target: FormElement) => {
            console.log('host', host);
            if (host.tag === 'row' || host.tag === 'column') {
                host.children.forEach((child, index) => {
                    console.log('child', child);
                    console.log('target', target);
                    if (child.id === target.id) {
                        console.log('detaching', child);
                        host.children.splice(index, 1);
                    } else if (child.tag === 'row' || child.tag === 'column') {
                        detachElementSingle(child, target);
                    }
                });
            } else {
                return;
            }
        }

        elements.forEach((el, index) => {
            console.log('el', el);
            detachElementSingle(el, element);
        });

        elements.push(element);

        setElements([...elements]);
    }


    const [elements, setElements] = useState<FormElement[]>([
        {
            tag: 'item',
            id: '1',
            value: 'Item 1',
            position: { x: 10, y: 10 },
            size: { width: EMPTY_ELEMENT_WIDTH, height: EMPTY_ELEMENT_HEIGHT }
        },
        {
            tag: 'item',
            id: '2',
            value: 'Item 2',
            position: { x: 200, y: 10 },
            size: { width: EMPTY_ELEMENT_WIDTH, height: EMPTY_ELEMENT_HEIGHT }
        },
        {
            tag: 'item',
            id: '3',
            value: 'Item 3',
            position: { x: 10, y: 100 },
            size: { width: EMPTY_ELEMENT_WIDTH, height: EMPTY_ELEMENT_HEIGHT }
        },
        {
            tag: 'column',
            id: '4',
            position: { x: 200, y: 100 },
            size: { width: EMPTY_ELEMENT_WIDTH, height: EMPTY_ELEMENT_HEIGHT },
            children: []
        },
        {
            tag: 'row',
            id: '5',
            position: { x: 10, y: 200 },
            size: { width: EMPTY_ELEMENT_WIDTH, height: EMPTY_ELEMENT_HEIGHT },
            children: []
        },
        {
            tag: 'item',
            id: '6',
            value: 'Item 6',
            position: { x: 400, y: 10 },
            size: { width: EMPTY_ELEMENT_WIDTH, height: EMPTY_ELEMENT_HEIGHT }
        }
    ]);

    useEffect(() => {
        const dragAction = () => {
            // Drag the element naively
            elements.forEach((element, index) => {
                if (element.id === drag?.element!.id) {
                    elements[index] = drag.element!;
                }
            });
            setElements([...elements]);
        }

        if (!drag) {
            return;
        }

        if (dragging) {
            dragAction()
        }


    }, [drag]);

    useEffect(() => {

        // returns the element if the element is being dragged into a column or row
        const isDropping: (elements: FormElement[]) => FormElement | undefined = (elements: FormElement[]) => {
            return elements.find((element) => {
                if (element.tag === 'column' || element.tag === 'row') {
                    return (
                        drag!.inset.x + drag!.element.position.x >= element.position.x &&
                        drag!.inset.x + drag!.element.position.x <= element.position.x + element.size.width &&
                        drag!.inset.y + drag!.element.position.y >= element.position.y &&
                        drag!.inset.y + drag!.element.position.y <= element.position.y + element.size.height &&
                        drag!.element.id !== element.id
                    );
                }
            });
        };



        const deleteDraggedElement = () => {
            elements.forEach((element, index) => {
                if (element.id === drag?.element.id) {
                    elements.splice(index, 1);
                }
            });
        }

        const dropOnElement = (host: ContainerElement) => {
            console.log('host', host);
            const isDroppingOnChildren = isDropping(host.children);
            console.log('isDroppingOnChildren', isDroppingOnChildren);
            if (!isDroppingOnChildren) {
                if (host.tag === 'row') {
                    drag!.element.position.x = host.position.x + host.children.length * 100 + 10;
                    drag!.element.position.y = host.position.y + 10;
                } else if (host.tag === 'column') {
                    drag!.element.position.x = host.position.x + 10;
                    drag!.element.position.y = host.position.y + host.children.length * 50 + 10;
                }
                host.children.push(drag!.element);
            } else {
                dropOnElement(isDroppingOnChildren as ContainerElement);
            }
        }

        const dropAction = (elements: FormElement[]) => {
            const host = isDropping(elements);

            if (!host) {
                return;
            }

            dropOnElement(host as ContainerElement);
            deleteDraggedElement();
        }

        const resizeAll = (elements: FormElement[]) => {
            elements.forEach((element, index) => {
                element = resize(element);
            });
        }
        if (!drag) {
            return;
        }

        if (!dragging) {
            console.log('dropped');
            dropAction(elements);
            resizeAll(elements);
            setElements([...elements]);
        }

    }, [dragging]);


    return (
        <>
            {
                layoutSchemaNames?.map((layoutSchemaName) => {
                    return (
                        <button key={layoutSchemaName} onClick={() => {
                            const layoutSchema = new LocalStorage().load_layout_schema(layoutSchemaName);
                            if (layoutSchema) {
                                setLayoutSchema(layoutSchema);
                                const elements = toFreeformElements(layoutSchema);
                                resize(elements);
                                setElements([elements]);
                                const dataSchema = new LocalStorage().load_data_schema(layoutSchema.data_schema_name);
                                if (dataSchema) {
                                    setDataSchema(dataSchema);
                                }
                            }
                        }}>
                            {layoutSchemaName}
                        </button>
                    )
                })
            }
            <div style={{
                height: '60vh',
                width: '60vw',
                border: '1px solid black',
                marginRight: "20px",
                position: 'relative',
                userSelect: 'none'
            }}
                ref={canvasRef}
                onMouseDown={(e) => {
                    const bbox = canvasRef.current!.getBoundingClientRect();
                    const element = elements.find((element) => {
                        return (
                            e.clientX >= element.position.x + bbox.left &&
                            e.clientX <= element.position.x + bbox.left + element.size.width &&
                            e.clientY >= element.position.y + bbox.top &&
                            e.clientY <= element.position.y + bbox.top + element.size.height
                        );
                    });

                    if (!element) {
                        return;
                    }

                    const mostInnerElement = findElementOnPosition(elements, { x: e.clientX - bbox.left, y: e.clientY - bbox.top });
                    // If it's a long press, we detach the element
                    if (element.id !== mostInnerElement?.id) {
                        setLongPress(setTimeout(() => {
                            console.log('long press');
                            console.log('mostInnerElement', mostInnerElement);
                            detachElement(mostInnerElement!);
                        }, 1000));
                    }
                    console.log('inset', e.clientX - element.position.x - bbox.left, e.clientY - element.position.y - bbox.top);
                    setDragging(true);
                    setDragStart({ x: e.clientX, y: e.clientY });
                    setDrag({
                        element: element,
                        offset: {
                            x: element.position.x,
                            y: element.position.y
                        },
                        inset: {
                            x: e.clientX - element.position.x - bbox.left,
                            y: e.clientY - element.position.y - bbox.top
                        }
                    });
                }}

                onMouseUp={() => {
                    setDragging(false);
                    if (longPress) {
                        clearTimeout(longPress);
                        setLongPress(null);
                    }
                }}

                onMouseMove={(e) => {
                    if (longPress) {
                        console.log('clearing long press');
                        clearTimeout(longPress);
                        setLongPress(null);
                    }
                    if (dragging && drag) {
                        const dx = e.clientX - dragStart!.x;
                        const dy = e.clientY - dragStart!.y;
                        drag.element.position.x = drag.offset.x + dx;
                        drag.element.position.y = drag.offset.y + dy;
                        if (drag.element.tag === 'row' || drag.element.tag === 'column') {
                            drag.element.children.forEach((child) => {
                                child.position.x = drag.element.position.x + 10;
                                child.position.y = drag.element.position.y + 10;
                            });
                        }
                        setDrag({
                            element: drag.element,
                            offset: drag.offset,
                            inset: drag.inset
                        });
                    }
                    elements.forEach((element, index) => {
                        if (e.clientX - (canvasRef.current?.getBoundingClientRect().left ?? 0) > element.position.x &&
                            e.clientX - (canvasRef.current?.getBoundingClientRect().left ?? 0) < element.position.x + element.size.width &&
                            e.clientY - (canvasRef.current?.getBoundingClientRect().top ?? 0) > element.position.y &&
                            e.clientY - (canvasRef.current?.getBoundingClientRect().top ?? 0) < element.position.y + element.size.height
                        ) {
                            element.droppable = true;
                            if (element.tag === 'row' || element.tag === 'column') {
                                element.children.forEach((child) => {
                                    if (e.clientX - (canvasRef.current?.getBoundingClientRect().left ?? 0) > child.position.x &&
                                        e.clientX - (canvasRef.current?.getBoundingClientRect().left ?? 0) < child.position.x + child.size.width &&
                                        e.clientY - (canvasRef.current?.getBoundingClientRect().top ?? 0) > child.position.y &&
                                        e.clientY - (canvasRef.current?.getBoundingClientRect().top ?? 0) < child.position.y + child.size.height
                                    ) {
                                        child.droppable = true;
                                        element.droppable = false;
                                    }
                                });
                            }
                        } else {
                            element.droppable = false;
                            if (element.tag === 'row' || element.tag === 'column') {
                                element.children.forEach((child) => {
                                    child.droppable = false;
                                });
                            }
                        }
                    });
                    setElements([...elements]);
                }}
            >
                {
                    elements.map((element, index) => {
                        return (
                            // <div key={element.id} style={{
                            //     position: 'absolute',
                            //     top: element.position.y,
                            //     left: element.position.x,
                            //     width: element.size.width + 10,
                            //     height: element.size.height + 10,
                            //     border: '1px solid black',
                            //     padding: '5px',
                            //     userSelect: 'none',
                            //     backgroundColor: 'lightblue',
                            //     textAlign: 'center',
                            // }}
                            // >
                            //     {
                            renderElement(element, 0)
                            //     }
                            // </div>
                        )
                    })
                }
            </div>
            {
                // Dump element stats
                elements.map((element) => {
                    if (element.tag === 'item') {
                        return (
                            <div key={element.id}
                            >
                                {element.id} {element.value} {element.position.x} {element.position.y} {element.size.width} {element.size.height}
                            </div>
                        )
                    } else {
                        return (
                            <div key={element.id}
                            >
                                {element.id} {element.tag} {element.position.x} {element.position.y} {element.size.width} {element.size.height}
                                {
                                    element.children.map((child) => {
                                        return (
                                            <div key={child.id}
                                            >
                                                {child.id} {child.tag} {child.position.x} {child.position.y} {child.size.width} {child.size.height}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                    }
                })
            }
        </>
    );
}
const FreeFormLayoutEditor = () => {
    return (
        <div>
            <h1>Free Form Layout Editor</h1>
            <FreeFormEditor />
        </div>
    );
}


export default FreeFormLayoutEditor;