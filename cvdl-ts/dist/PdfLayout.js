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
const render = async ({ resume_name, resume, data_schemas, layout_schemas, resume_layout, storage, fontDict, }) => {
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
        layout_schemas = await Promise.all(resume
            .layout_schemas()
            .map((schema) => storage.load_layout_schema(schema)));
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
    const stream = doc.pipe((0, blob_stream_1.default)());
    start_time = Date.now();
    const layouts = await (0, AnyLayout_1.render)({
        layout_schemas,
        resume,
        data_schemas,
        resume_layout,
        storage,
        fontDict,
    });
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
    const tracker = {
        page: 0,
        pageContainer: doc,
        height: 0,
        layout: resume_layout,
        fontDict: fontDict,
    };
    for (const layout of layouts) {
        (0, exports.renderSectionLayout)(layout, tracker);
        tracker.height +=
            layout.bounding_box.height() + layout.margin.top + layout.margin.bottom;
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
const getPageContainer = (page, tracker) => {
    if (page > tracker.page) {
        tracker.page = page;
        tracker.pageContainer.addPage({
            size: [tracker.layout.width, tracker.layout.height],
        });
    }
    return tracker.pageContainer;
};
const mergeSpans = (spans) => {
    const merged_spans = [];
    let currentSpan = spans[0];
    for (let i = 1; i < spans.length; i++) {
        if (currentSpan.bbox.top_left.y === spans[i].bbox.top_left.y &&
            currentSpan.font === spans[i].font &&
            currentSpan.is_code === spans[i].is_code &&
            currentSpan.is_bold === spans[i].is_bold &&
            currentSpan.is_italic === spans[i].is_italic) {
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
const renderSectionLayout = (layout, tracker) => {
    switch (layout.tag) {
        case "Stack": {
            const stack = layout;
            for (const elem of stack.elements) {
                (0, exports.renderSectionLayout)(elem, tracker);
            }
            break;
        }
        case "Row": {
            const row = layout;
            for (const elem of row.elements) {
                (0, exports.renderSectionLayout)(elem, tracker);
            }
            break;
        }
        case "Elem": {
            const elem = layout;
            if (!layout.bounding_box) {
                return;
            }
            const spans = elem.alignment === "Justified" ? elem.spans : (0, exports.mergeSpans)(elem.spans);
            spans.forEach((span) => {
                if (span.text === "" ||
                    span.text === " " ||
                    span.text === "\n" ||
                    span.text === "\n\n") {
                    return;
                }
                const absoluteY = layout.bounding_box.top_left.y +
                    tracker.height +
                    span.bbox.top_left.y;
                const page = Math.floor(absoluteY /
                    (tracker.layout.height -
                        tracker.layout.margin.top -
                        tracker.layout.margin.bottom));
                const currentPageY = absoluteY %
                    (tracker.layout.height -
                        tracker.layout.margin.top -
                        tracker.layout.margin.bottom);
                const y = currentPageY + tracker.layout.margin.top;
                const x = layout.bounding_box.top_left.x +
                    tracker.layout.margin.left +
                    span.bbox.top_left.x;
                tracker.pageContainer = getPageContainer(page, tracker);
                tracker.pageContainer
                    .font(_1.Font.full_name(span.font))
                    .fontSize(span.font.size)
                    .text(span.text, x, y, { lineBreak: false });
                if (span.is_code) {
                    // Add a rounded rectangle around the code
                    tracker.pageContainer
                        .roundedRect(layout.bounding_box.top_left.x +
                        tracker.layout.margin.left +
                        span.bbox.top_left.x -
                        span.font.size / 5, layout.bounding_box.top_left.y +
                        tracker.layout.margin.top +
                        tracker.height +
                        span.bbox.top_left.y, span.bbox.width() + (span.font.size / 5) * 2, span.bbox.height(), 5)
                        .stroke();
                    // Add a background color to the code
                    tracker.pageContainer.fillColor("black");
                    tracker.pageContainer.fillOpacity(0.05);
                    tracker.pageContainer
                        .rect(layout.bounding_box.top_left.x +
                        tracker.layout.margin.left +
                        span.bbox.top_left.x -
                        span.font.size / 5, layout.bounding_box.top_left.y +
                        tracker.layout.margin.top +
                        tracker.height +
                        span.bbox.top_left.y, span.bbox.width() + (span.font.size / 5) * 2, span.bbox.height())
                        .fill();
                    tracker.pageContainer.fillOpacity(1);
                }
            });
            break;
        }
    }
};
exports.renderSectionLayout = renderSectionLayout;
