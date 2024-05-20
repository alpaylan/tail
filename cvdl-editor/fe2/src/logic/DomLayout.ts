// Use DOM as a backend for the CVDL layout engine.

import { ElementBox, FontDict, render as anyRender } from "cvdl-ts/dist/AnyLayout";
import { Resume } from "cvdl-ts/dist/Resume";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { ResumeLayout } from "cvdl-ts/dist/ResumeLayout";
import { LocalStorage } from "cvdl-ts/dist/LocalStorage";
import { Dispatch } from "react";
import { EditorAction, EditorState } from "@/components/State";
import { ColorMap } from "cvdl-ts/dist/Layout";

export type RenderResult = {
    blob: Blob,
    fontDict: FontDict,
    pages: ElementBox[][]
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
    const [font_dict, pages] = await
        anyRender({ layout_schemas, resume, data_schemas, resume_layout, storage, fontDict });
    end_time = Date.now();
    console.info(`Rendering time: ${end_time - start_time}ms`);
    console.log("Constructing printpdf font dictionary...");


    // Add the fonts to the document(@TODO: DO NOT HARDCODE THE FONTS)
    document.fonts.add(new FontFace("Exo-Bold", "url(https://d2bnplhbawocbk.cloudfront.net/data/fonts/Exo-Bold.ttf)"));
    document.fonts.add(new FontFace("Exo-Medium", "url(https://d2bnplhbawocbk.cloudfront.net/data/fonts/Exo-Medium.ttf)"));
    document.fonts.add(new FontFace("Roboto-Bold", "url(https://d2bnplhbawocbk.cloudfront.net/data/fonts/Roboto-Bold.ttf)"));
    document.fonts.add(new FontFace("Roboto-Medium", "url(https://d2bnplhbawocbk.cloudfront.net/data/fonts/Roboto-Medium.ttf)"));

    console.log("Rendering the document...");
    // Render the boxes
    for (const [index, boxes] of pages.entries()) {
        let pageContainer = container.appendChild(document.createElement("div"));
        pageContainer.id = `page-${index}`;
        console.log(`Rendering page ${index}`);
        console.log(`width: ${resume_layout!.width}, height: ${resume_layout!.height}`);
        pageContainer.style.cssText = `
            position: relative;
            width: ${resume_layout!.width}px;
            height: ${resume_layout!.height}px;
            border: 1px solid black;
        `;

        let doc = pageContainer.appendChild(document.createElement("div"));

        boxes.forEach((box) => {
            const elements = box.elements;
            // if (debug) {
            //     // Add an empty box to the document to show the bounding box
            //     doc.appendChild(
            //         document.createElement("div")
            //     ).style.cssText = `
            //         position: absolute;
            //         left: ${box.bounding_box.top_left.x}px;
            //         top: ${box.bounding_box.top_left.y}px;
            //         width: ${box.bounding_box.width()}px;
            //         height: ${box.bounding_box.height()}px;
            //         border: 1px solid red;
            //         box-sizing: border-box;
            //     `;
            // }
            for (const [box_, element] of elements) {
                console.log(
                    `(${box_.top_left.x}, ${box_.top_left.y})(${box_.bottom_right.x}, ${box_.bottom_right.y}): ${element.item}`
                );
                console.log(element.font.full_name());

                const elem = document.createElement("div");
                doc.appendChild(elem);

                elem.innerText = element.item;
                elem.style.cssText = `
                    position: absolute;
                    left: ${box_.top_left.x}px;
                    top: ${box_.top_left.y}px;
                    font-family: "${element.font.full_name()}", sans-serif;
                    font-size: ${element.font.size}px;
                    font-style: ${element.font.style};
                    font-weight: ${element.font.weight};
                    ${debug ? "outline: 1px solid black;" : ""}
                `;

                if (element.background_color !== "Transparent") {
                    elem.style.backgroundColor = ColorMap[element.background_color]
                }

                if (JSON.stringify(state.editorPath) === JSON.stringify(box.path)) {
                    console.error("Highlighting element");
                    elem.style.outline = "1px solid red";
                    elem.style.zIndex = "100";
                }
                elem.addEventListener("click", () => {
                    console.error("Clicked on element");
                    dispatch({ type: 'set-editor-path', path: box.path ?? { tag: 'none' } })
                });
                elem.addEventListener("mouseover", () => {
                    elem.style.backgroundColor = "lightgray";
                    elem.style.cursor = "pointer";
                });

                elem.addEventListener("mouseout", () => {
                    elem.style.backgroundColor = element.background_color === "Transparent" ? "white" : ColorMap[element.background_color];
                    elem.style.animation = "none";
                });

            }
        });
    }
    console.log("Rendering is completed. Saving the document...");

    console.log("Document is saved to output.pdf");
}
