"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSectionLayout = exports.mergeSpans = exports.render = void 0;
const blob_stream_1 = __importDefault(require("blob-stream"));
const AnyLayout_1 = require("./AnyLayout");
const pdfkit_1 = __importDefault(require("pdfkit"));
const _1 = require(".");
const render = async ({ resume_name, resume, data_schemas, layout_schemas, resume_layout, storage, fontDict }) => {
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
        fontDict = new AnyLayout_1.FontDict();
    }
    let end_time = Date.now();
    console.info(`Loading time: ${end_time - start_time}ms`);
    const doc = new pdfkit_1.default();
    // doc.pipe(fs.createWriteStream('output.pdf'));
    const stream = doc.pipe((0, blob_stream_1.default)());
    start_time = Date.now();
    const layouts = await (0, AnyLayout_1.render)({ layout_schemas, resume, data_schemas, resume_layout, storage, fontDict });
    end_time = Date.now();
    console.info(`Rendering time: ${end_time - start_time}ms`);
    console.log("Constructing printpdf font dictionary...");
    console.log("Rendering the document...");
    // doc.registerFont("Exo-Medium",
    //     "/Users/akeles/Programming/projects/cvdl/cvdl/assets/Exo/static/Exo-Medium.ttf");
    try {
        console.log("Registering fonts...");
        for (const [font_name, font] of fontDict.fonts.entries()) {
            console.log(`Registering font ${font_name}`);
            // @ts-ignore
            doc.registerFont(font_name, font.stream.buffer);
        }
    }
    catch (e) {
        console.error(e);
    }
    console.log("Rendering the document...");
    let current_height = 0;
    // Add rulers to the document at every 10 pixels
    doc.strokeColor("grey");
    for (let i = 0; i < resume_layout.height; i += 10) {
        doc.moveTo(0, i).lineTo(resume_layout.width, i).stroke();
    }
    for (let i = 0; i < resume_layout.width; i += 10) {
        doc.moveTo(i, 0).lineTo(i, resume_layout.height).stroke();
    }
    doc.strokeColor("black");
    for (const layout of layouts) {
        (0, exports.renderSectionLayout)(layout, resume_layout, current_height, doc);
        current_height += layout.bounding_box.height() + layout.margin.top + layout.margin.bottom;
    }
    console.log("Rendering is completed. Saving the document...");
    console.log("Document is saved to output.pdf");
    doc.end();
    return new Promise((resolve) => {
        stream.on("finish", () => {
            resolve({
                blob: stream.toBlob("application/pdf"),
                fontDict: fontDict,
            });
        });
    });
};
exports.render = render;
const mergeSpans = (spans) => {
    const merged_spans = [];
    let currentSpan = spans[0];
    for (let i = 1; i < spans.length; i++) {
        if (currentSpan.bbox.top_left.y === spans[i].bbox.top_left.y
            && currentSpan.font === spans[i].font
            && currentSpan.is_code === spans[i].is_code
            && currentSpan.is_bold === spans[i].is_bold
            && currentSpan.is_italic === spans[i].is_italic) {
            currentSpan.text += spans[i].text;
            currentSpan.bbox.bottom_right = spans[i].bbox.bottom_right;
        }
        else {
            merged_spans.push(currentSpan);
            currentSpan = spans[i];
        }
    }
    merged_spans.push(currentSpan);
    return merged_spans;
};
exports.mergeSpans = mergeSpans;
const renderSectionLayout = (layout, resume_layout, current_height, doc) => {
    switch (layout.tag) {
        case "Stack": {
            const stack = layout;
            for (const elem of stack.elements) {
                (0, exports.renderSectionLayout)(elem, resume_layout, current_height, doc);
            }
            break;
        }
        case "Row": {
            const row = layout;
            for (const elem of row.elements) {
                (0, exports.renderSectionLayout)(elem, resume_layout, current_height, doc);
            }
            break;
        }
        case "Elem": {
            const elem = layout;
            elem.spans.forEach((span) => {
                console.log("Rendering span:", span);
                doc.
                    font(_1.Font.full_name(span.font)).
                    fontSize(span.font.size).
                    text(span.text, layout.bounding_box.top_left.x
                    + resume_layout.margin.left
                    + span.bbox.top_left.x, layout.bounding_box.top_left.y
                    + resume_layout.margin.top
                    + current_height
                    + span.bbox.top_left.y, { lineBreak: false });
                if (span.is_code) {
                    // Add a rounded rectangle around the code
                    doc.roundedRect(layout.bounding_box.top_left.x + resume_layout.margin.left + span.bbox.top_left.x - span.font.size / 5, layout.bounding_box.top_left.y + resume_layout.margin.top + current_height + span.bbox.top_left.y, span.bbox.width() + span.font.size / 5 * 2, span.bbox.height(), 5).stroke();
                    // Add a background color to the code
                    doc.fillColor("black");
                    doc.fillOpacity(0.05);
                    doc.rect(layout.bounding_box.top_left.x + resume_layout.margin.left + span.bbox.top_left.x - span.font.size / 5, layout.bounding_box.top_left.y + resume_layout.margin.top + current_height + span.bbox.top_left.y, span.bbox.width() + span.font.size / 5 * 2, span.bbox.height()).fill();
                    doc.fillOpacity(1);
                }
            });
            // doc.
            //     font(Font.full_name(elem.font)).
            //     fontSize(elem.font.size).
            //     text(elem.item, layout.bounding_box.top_left.x + resume_layout.margin.left, layout.bounding_box.top_left.y + resume_layout.margin.top + current_height, { lineBreak: false });
            break;
        }
    }
};
exports.renderSectionLayout = renderSectionLayout;
