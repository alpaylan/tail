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

    let container = document.getElementById("pdf-container")!;
    container.innerHTML = "";

    start_time = Date.now();

    const layouts = await
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
        path: null,
        height: 0,
        state,
        dispatch,
        resume_layout,
        fontDict,
    }

    // Add rulers to the document at every 10 pixels
    // for (let i = 0; i < resume_layout.height; i += 10) {
    //     const ruler = document.createElement("div");
    //     ruler.style.cssText = `
    //         position: absolute;
    //         left: 0;
    //         top: ${i}px;
    //         width: 100%;
    //         height: 1px;
    //         background-color: grey;
    //     `;
    //     tracker.pageContainer.appendChild(ruler);
    // }


    // for (let i = 0; i < resume_layout.width; i += 10) {
    //     const ruler = document.createElement("div");
    //     ruler.style.cssText = `
    //         position: absolute;
    //         left: ${i}px;
    //         top: 0;
    //         width: 1px;
    //         height: 100%;
    //         background-color: grey;
    //     `;
    //     tracker.pageContainer.appendChild(ruler);
    // }



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
    path: ElementPath | null,
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


export const mergeSpans = (spans: Elem.Span[]): Elem.Span[] => {
    const merged_spans: Elem.Span[] = [];
    let currentSpan = spans[0];
    for (let i = 1; i < spans.length; i++) {
        if (currentSpan.bbox!.top_left.y === spans[i].bbox!.top_left.y
            && currentSpan.font === spans[i].font
            && currentSpan.is_code === spans[i].is_code
            && currentSpan.is_bold === spans[i].is_bold
            && currentSpan.is_italic === spans[i].is_italic
        ) {
            currentSpan.text += spans[i].text;
            currentSpan.bbox!.bottom_right = spans[i].bbox!.bottom_right;
        } else {
            merged_spans.push(currentSpan);
            currentSpan = spans[i];
        }
    }
    merged_spans.push(currentSpan);
    return merged_spans;
}


export const renderSectionLayout = (layout: Layout.RenderedLayout, tracker: Tracker) => {
    switch (layout.tag) {
        case "Stack": {
            const stack = layout as Layout.RenderedStack;
            for (const elem of stack.elements) {
                renderSectionLayout(elem, { ...tracker, path: layout.path ?? tracker.path });
            }
            break;
        }
        case "Row": {
            const row = layout as Layout.RenderedRow;

            for (const elem of row.elements) {
                renderSectionLayout(elem, { ...tracker, path: layout.path ?? tracker.path });
            }
            break;
        }
        case "Elem": {
            const element = layout as Elem.t;
            if (!layout.bounding_box) {
                return;
            }

            mergeSpans(element.spans!).forEach((span) => {

                if (span.text === "") {
                    return;
                }

                const spanElem = document.createElement("span");
                spanElem.innerText = span.text;
                spanElem.style.cssText = `
                    position: absolute;
                    left: ${layout.bounding_box.top_left.x + tracker.resume_layout.margin.left + span.bbox!.top_left.x}px;
                    top: ${layout.bounding_box.top_left.y + tracker.resume_layout.margin.top + tracker.height + span.bbox!.top_left.y}px;
                    width: ${span.bbox!.width()}px;
                    height: ${span.bbox!.height()}px;
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

                // console.error("Setting Click Path for", span.text, "to", tracker.path);
                spanElem.addEventListener("click", () => {
                    const path = layout.path ?? tracker.path ?? { tag: "none" };

                    if (path.tag === "section") {
                        console.error("Setting path to section", { ...path, tag: "field", field: element.item });
                        tracker.dispatch({
                            type: "set-editor-path",
                            path: { ...path }
                        });
                        return;
                    } else if (path.tag === "item") {
                        console.error("Setting path to field", { ...path, tag: "field", field: element.item });
                        tracker.dispatch({
                            type: "set-editor-path",
                            path: { ...path, tag: "field", field: element.item }
                        });
                    } else {
                        console.error("Cannot path to item", tracker.path, element.item);
                    }
                });

                if (span.is_code) {
                //     // Add a rounded rectangle around the code
                //     spanElem.style.borderRadius = "5px";
                //     spanElem.style.border = "1px solid black";
                //     spanElem.style.padding = `0 ${span.font?.size! / 5}px`;
                //     spanElem.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
                    spanElem.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
                }
                tracker.pageContainer.appendChild(spanElem);
            });
            // tracker.pageContainer.appendChild(domElem);
            break;
        }
    }
}
