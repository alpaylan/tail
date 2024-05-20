
import { FieldProps } from '@/components/SectionItem';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { DocumentDispatchContext, EditorContext } from "@/components/State"

export function debounce<T extends Function>(cb: T, wait = 200) {
    let h = 0;
    let callable = (...args: any) => {
        clearTimeout(h);
        h = setTimeout(() => cb(...args), wait) as any;
    };
    return callable as any as T;
}


const SectionItemField = ({ section, item, field }: { section: string, item: number, field: FieldProps }) => {
    const state = useContext(EditorContext);
    const dispatch = useContext(DocumentDispatchContext);
    const debouncedDispatch = debounce(dispatch!);

    return (
        <div key={field.name} style={{ display: "flex", flexDirection: "column"}} >
            <b> {field.name} </b>
            <input type="text"
                defaultValue={field.value}
                autoFocus={state?.editorPath?.tag === "field" && state.editorPath.section === section && state.editorPath.item === item && state.editorPath.field === field.name}
                onChange={(e) => {
                    const value = e.target.value;
                    debouncedDispatch({ type: "field-update", section: section, item: item, field: field.name, value: { tag: "String", value: value } });
                }}
            />
        </div>
    )
}

export default SectionItemField;