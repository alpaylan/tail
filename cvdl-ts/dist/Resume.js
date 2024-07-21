"use strict";
/* eslint-disable @typescript-eslint/no-namespace */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemContent = exports.Item = exports.ResumeSection = exports.Resume = void 0;
class Resume {
    constructor(layout, sections) {
        this.layout = layout;
        this.sections = sections;
    }
    static fromJson(resume) {
        if (typeof resume !== "object") {
            throw new Error("Resume must be an object");
        }
        if (resume === null) {
            throw new Error("Resume must not be null");
        }
        if (!("layout" in resume) || !("sections" in resume)) {
            throw new Error("Resume must have a layout");
        }
        return new Resume(resume.layout, resume.sections.map(section => ResumeSection.fromJson(section)));
    }
    toJson() {
        return {
            layout: this.layout,
            sections: this.sections.map(section => section.toJson()),
        };
    }
    static reducer(state, action) {
        switch (action.type) {
            case "update":
                return Resume.fromJson(action.payload);
            default:
                return state;
        }
    }
    data_schemas() {
        return this.sections.map(section => section.data_schema);
    }
    layout_schemas() {
        return this.sections.map(section => section.layout_schema);
    }
    resume_layout() {
        return this.layout;
    }
}
exports.Resume = Resume;
class ResumeSection {
    constructor() {
        this.section_name = "";
        this.data_schema = "";
        this.layout_schema = "";
        this.data = new Map();
        this.items = [];
        this.section_name = "";
        this.data_schema = "";
        this.layout_schema = "";
        this.data = new Map();
        this.items = [];
    }
    toJson() {
        console.info(this);
        return {
            section_name: this.section_name,
            data_schema: this.data_schema,
            layout_schema: this.layout_schema,
            data: Object.fromEntries(this.data),
            items: this.items.map(item => Item.toJson(item)),
        };
    }
    static fromJson(json) {
        const section = new ResumeSection();
        if (typeof json !== "object") {
            throw new Error("ResumeSection must be an object");
        }
        if (json === null) {
            throw new Error("ResumeSection must not be null");
        }
        if (!("section_name" in json) || !("data_schema" in json) || !("layout_schema" in json) || !("data" in json) || !("items" in json)) {
            throw new Error("ResumeSection must have a section_name, data_schema, layout_schema, and data");
        }
        section.section_name = json.section_name;
        section.data_schema = json.data_schema;
        section.layout_schema = json.layout_schema;
        const data = new Map(Object.entries(json.data));
        // @ts-ignore
        section.data = new Map([...data].map(([key, value]) => [key, ItemContent.fromJson(value)]));
        section.items = json.items.map(item => {
            const data = new Map(Object.entries(item.fields));
            return {
                id: item.id,
                fields: new Map([...data].map(([key, value]) => [key, ItemContent.fromJson(value)]))
            };
        });
        return section;
    }
}
exports.ResumeSection = ResumeSection;
var Item;
(function (Item) {
    function fromJson(json) {
        if (typeof json !== "object") {
            throw new Error("Item must be an object");
        }
        if (json === null) {
            throw new Error("Item must not be null");
        }
        if (!("id" in json) || !("fields" in json)) {
            throw new Error("Item must have an id and fields");
        }
        const item = {
            id: json.id,
            fields: new Map(Object.entries(json.fields))
        };
        return item;
    }
    Item.fromJson = fromJson;
    function toJson(item) {
        return {
            id: item.id,
            fields: Object.fromEntries(item.fields)
        };
    }
    Item.toJson = toJson;
})(Item || (exports.Item = Item = {}));
var ItemContent;
(function (ItemContent) {
    // @ts-ignore
    function fromJson(json) {
        if (typeof json === "undefined" || json === null) {
            return { tag: "None" };
        }
        if (typeof json === "string") {
            return { tag: "String", value: json };
        }
        if (Array.isArray(json)) {
            return { tag: "List", value: json.map(fromJson) };
        }
        if (typeof json === "object" && ("tag" in json) && json.tag === "None") {
            return { tag: "None" };
        }
        if (typeof json === "object" && ("tag" in json) && ("value" in json)) {
            switch (json.tag) {
                case "String":
                    return { tag: "String", value: json.value };
                case "List":
                    return { tag: "List", value: json.value.map(fromJson) };
                case "Url":
                    return { tag: "Url", value: { url: json.value.url, text: json.value.text } };
            }
        }
        else if (typeof json === "object" && ("url" in json) && ("text" in json)) {
            return { tag: "Url", value: { url: json.url, text: json.text } };
        }
        throw new Error(`Invalid ItemContent(${JSON.stringify(json)}): ItemContent must be a string, an array, or an object`);
    }
    ItemContent.fromJson = fromJson;
    function None() {
        return { tag: "None" };
    }
    ItemContent.None = None;
    function toString(item) {
        if (item.tag === "None") {
            return "";
        }
        else if (item.tag === "String") {
            return item.value;
        }
        else if (item.tag === "List") {
            return item.value.map(toString).join(", ");
        }
        else if (item.tag === "Url") {
            return item.value.text;
        }
        return "";
    }
    ItemContent.toString = toString;
})(ItemContent || (exports.ItemContent = ItemContent = {}));
