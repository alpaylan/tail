"use strict";
/* eslint-disable @typescript-eslint/no-namespace */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemContent = exports.ResumeSection = void 0;
exports.resume = resume;
exports.dataSchemas = dataSchemas;
exports.layoutSchemas = layoutSchemas;
function resume(name, layout, sections) {
    return {
        name,
        layout,
        sections,
    };
}
function dataSchemas(resume) {
    return resume.sections.map((section) => section.data_schema);
}
function layoutSchemas(resume) {
    return resume.sections.map((section) => section.layout_schema);
}
var ResumeSection;
(function (ResumeSection) {
    function resumeSection(section_name, data_schema, layout_schema, data, items) {
        return {
            section_name,
            data_schema,
            layout_schema,
            data,
            items,
        };
    }
    ResumeSection.resumeSection = resumeSection;
})(ResumeSection || (exports.ResumeSection = ResumeSection = {}));
var ItemContent;
(function (ItemContent) {
    function none() {
        return { tag: "None" };
    }
    ItemContent.none = none;
    function string(value) {
        return { tag: "String", value };
    }
    ItemContent.string = string;
    function list(value) {
        return { tag: "List", value };
    }
    ItemContent.list = list;
    function url(url, text) {
        return { tag: "Url", value: { url, text } };
    }
    ItemContent.url = url;
    function toString(content) {
        switch (content.tag) {
            case "None":
                return "";
            case "String":
                return content.value;
            case "List":
                return content.value.map(toString).join(", ");
            case "Url":
                return `[${content.value.text}](${content.value.url})`;
        }
    }
    ItemContent.toString = toString;
})(ItemContent || (exports.ItemContent = ItemContent = {}));
