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


            element.spans!.forEach((span) => {
                console.log(span)
                if (span.text === "") {
                    return;
                }

                const spanElem = document.createElement("span");
                spanElem.innerText = span.text;
                spanElem.style.cssText = `
                    position: absolute;
                    left: ${layout.bounding_box.top_left.x + tracker.resume_layout.margin.left + span.bbox!.top_left.x}px;
                    top: ${layout.bounding_box.top_left.y + tracker.resume_layout.margin.top + tracker.height + span.bbox!.top_left.y}px;
                    font-family: "${Font.full_name(span.font!)}", sans-serif;
                    font-size: ${span.font!.size}px;
                    font-style: ${span.font!.style};
                    font-weight: ${span.font!.weight};
                    background-color: ${ColorMap[element.background_color]};
                `;
                
                            
                spanElem.addEventListener("mouseover", () => {
                    spanElem.style.backgroundColor = "lightgray";
                    spanElem.style.cursor = "pointer";
                });

                spanElem.addEventListener("mouseout", () => {
                    spanElem.style.backgroundColor = ColorMap[element.background_color];
                    spanElem.style.animation = "none";
                });

                
                // if (span.is_code) {
                //     // Add a rounded rectangle around the code
                //     doc.roundedRect(
                //         layout.bounding_box.top_left.x + resume_layout.margin.left + span.bbox.top_left.x - span.font.size / 3,
                //         layout.bounding_box.top_left.y + resume_layout.margin.top + current_height + span.bbox.top_left.y,
                //         span.bbox.width() + span.font.size / 3 * 2,
                //         span.bbox.height(),
                //         5
                //     ).stroke();
                //     // Add a background color to the code
                //     doc.fillColor("black");
                //     doc.fillOpacity(0.05);
                //     doc.rect(
                //         layout.bounding_box.top_left.x + resume_layout.margin.left + span.bbox.top_left.x - span.font.size / 3,
                //         layout.bounding_box.top_left.y + resume_layout.margin.top + current_height + span.bbox.top_left.y,
                //         span.bbox.width() + span.font.size / 3 * 2,
                //         span.bbox.height()
                //     ).fill();
                //     doc.fillOpacity(1);
                // }
                tracker.pageContainer.appendChild(spanElem);
            });
            // tracker.pageContainer.appendChild(domElem);
            break;
        }
    }
}
