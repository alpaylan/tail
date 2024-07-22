export type t = {
    name: string;
    layout: string;
    sections: ResumeSection.t[];
};
export declare function resume(name: string, layout: string, sections: ResumeSection.t[]): t;
export declare function dataSchemas(resume: t): string[];
export declare function layoutSchemas(resume: t): string[];
export declare namespace ResumeSection {
    type t = {
        section_name: string;
        data_schema: string;
        layout_schema: string;
        data: Item;
        items: Item[];
    };
    function resumeSection(section_name: string, data_schema: string, layout_schema: string, data: Item, items: Item[]): t;
}
export declare namespace ItemContent {
    type t = {
        tag: "None";
    } | {
        tag: "String";
        value: string;
    } | {
        tag: "List";
        value: t[];
    } | {
        tag: "Url";
        value: {
            url: string;
            text: string;
        };
    };
    function none(): t;
    function string(value: string): t;
    function list(value: t[]): t;
    function url(url: string, text: string): t;
    function toString(content: t): string;
}
export type Item = {
    id: string;
    fields: {
        [key: string]: ItemContent.t;
    };
};
