// Use DOM as a backend for the CVDL layout engine.

import { ElementPath, FontDict, render as anyRender } from "cvdl-ts/dist/AnyLayout";
import { Resume } from "cvdl-ts/dist/Resume";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { ResumeLayout } from "cvdl-ts/dist/ResumeLayout";
import { LocalStorage } from "cvdl-ts/dist/LocalStorage";
import { Dispatch } from "react";
import { EditorAction, EditorState } from "@/components/State";
import { ColorMap } from "cvdl-ts/dist/Layout";
import { Font, Layout } from "cvdl-ts";
import * as Elem from "cvdl-ts/dist/Elem";

export type RenderResult = {
    blob: Blob,
    fontDict: FontDict,
}

export type RenderProps = {
    resume_name?: string,
    resume?: Resume,
    data_schemas?: DataSchema[],
    layout_schemas?: LayoutSchema[],
    resume_layout?: ResumeLayout,
    storage: LocalStorage,
    fontDict?: FontDict,
    state: EditorState,
    dispatch: Dispatch<EditorAction>
    debug: boolean,
}

export const render = async (
    { resume_name, resume, data_schemas, layout_schemas, resume_layout, storage, fontDict, state, dispatch, debug = false }: RenderProps
) => {
    let container = document.getElementById("pdf-container")!;
    container.innerHTML = "";
    let start_time = Date.now();

    if (!resume && !resume_name) {
        throw "Rendering requires either resume_name or resume";
    }

    if (!resume) {
        if (!resume_name) {
            throw "Rendering requires resume_name";
        }
        resume = await storage.load_resume(resume_name);
    }

    if (!data_schemas) {
        data_schemas = await Promise.all(resume.data_schemas().map((schema) => storage.load_data_schema(schema)));
    }

    if (!layout_schemas) {
        layout_schemas = await Promise.all(resume.layout_schemas().map((schema) => storage.load_layout_schema(schema)));
    }

    if (!resume_layout) {
        resume_layout = await storage.load_resume_layout(resume.resume_layout());
    }

    if (!fontDict) {
        fontDict = new FontDict();
    }

    let end_time = Date.now();

    console.info(`Loading time: ${end_time - start_time}ms`);

    start_time = Date.now();
    console.error(resume);
    const [font_dict, layouts] = await
        anyRender({ layout_schemas, resume, data_schemas, resume_layout, storage, fontDict });
    end_time = Date.now();
    console.info(`Rendering time: ${end_time - start_time}ms`);

    // Add the fonts to the document(@TODO: DO NOT HARDCODE THE FONTS)
    document.fonts.add(new FontFace("Exo-Bold", "url(https://d2bnplhbawocbk.cloudfront.net/data/fonts/Exo-Bold.ttf)"));
    document.fonts.add(new FontFace("Exo-Medium", "url(https://d2bnplhbawocbk.cloudfront.net/data/fonts/Exo-Medium.ttf)"));
    document.fonts.add(new FontFace("Roboto-Bold", "url(https://d2bnplhbawocbk.cloudfront.net/data/fonts/Roboto-Bold.ttf)"));
    document.fonts.add(new FontFace("Roboto-Medium", "url(https://d2bnplhbawocbk.cloudfront.net/data/fonts/Roboto-Medium.ttf)"));

    console.log("Rendering the document...");

    // Add bounding boxes to the document
    const tracker = {
        page: 0,
        pageContainer: getPageContainer(0, resume_layout.width, resume_layout.height),
        path: { tag: 'none' } as ElementPath,
        height: 0,
        state,
        dispatch,
        resume_layout,
        fontDict,
    }
    for (const layout of layouts) {
        renderSectionLayout(layout, tracker);   
        tracker.height += layout.bounding_box!.height() + layout.margin.top + layout.margin.bottom;
    }


    console.log("Rendering is completed. Saving the document...");

    console.log("Document is saved to output.pdf");
}


type Tracker = {
    page: number,
    pageContainer: HTMLElement,
    path: ElementPath,
    height: number,
    state: EditorState,
    dispatch: Dispatch<EditorAction>,
    resume_layout: ResumeLayout,
    fontDict: FontDict,
}

const getPageContainer = (page: number, width: number, height: number) => {
    if (document.getElementById(`page-${page}`)) {
        return document.getElementById(`page-${page}`)!;
    } else {
        let pageContainer = document.createElement("div");
        pageContainer.id = `page-${page}`;
        pageContainer.style.cssText = `
            position: relative;
            width: ${width}px;
            height: ${height}px;
            border: 1px solid black;
        `;
        document.getElementById("pdf-container")!.appendChild(pageContainer);
        return pageContainer;
    }
}


export const renderSectionLayout = (layout: Layout.RenderedLayout, tracker: Tracker) => {
    switch (layout.tag) {
        case "Stack": {
            const stack = layout as Layout.RenderedStack;
            for (const elem of stack.elements) {
                const currentPath = { ...tracker.path };
                renderSectionLayout(elem, tracker);
                tracker.path = currentPath;
            }
            break;
        }
        case "Row": {
            const row = layout as Layout.RenderedRow;
            for (const elem of row.elements) {
                renderSectionLayout(elem, tracker);
            }
            break;
        }
        case "Elem": {
            const element = layout as Elem.t;
            if (!layout.bounding_box) {
                return;
            }
            const x = layout.bounding_box!.top_left.x + tracker.resume_layout.margin.left;
            let y = layout.bounding_box!.top_left.y 
                    + (tracker.resume_layout.margin.top * (tracker.page + 1)) 
                    + (tracker.resume_layout.margin.bottom * tracker.page)
                    + tracker.height 
                    - (tracker.resume_layout.height * tracker.page)
            if (y + Font.get_height(element.font, tracker.fontDict) > tracker.resume_layout.height - tracker.resume_layout.margin.bottom) {
                tracker.page++;
                y = y + tracker.resume_layout.margin.top + tracker.resume_layout.margin.bottom - tracker.resume_layout.height; 

                tracker.pageContainer = getPageContainer(tracker.page, tracker.resume_layout.width, tracker.resume_layout.height);
            }

            const domElem = document.createElement("div");

            domElem.innerText = element.item;
            domElem.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                font-family: "${Font.full_name(element.font)}", sans-serif;
                font-size: ${element.font.size}px;
                font-style: ${element.font.style};
                font-weight: ${element.font.weight};
                background-color: ${ColorMap[element.background_color]};
            `;

            // if (JSON.stringify(tracker.state.editorPath) === JSON.stringify(tracker.path)) {
            //     domElem.style.outline = "1px solid red";
            //     domElem.style.zIndex = "100";
            // }
            // domElem.addEventListener("click", () => {
            //     tracker.dispatch({ type: 'set-editor-path', path: tracker.path ?? { tag: 'none' } })
            // });
            domElem.addEventListener("mouseover", () => {
                domElem.style.backgroundColor = "lightgray";
                domElem.style.cursor = "pointer";
            });

            domElem.addEventListener("mouseout", () => {
                domElem.style.backgroundColor = ColorMap[element.background_color];
                domElem.style.animation = "none";
            });

            tracker.pageContainer.appendChild(domElem);
            break;
        }
    }
}
