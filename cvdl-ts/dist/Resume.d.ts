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
    type PureString = {
        tag: "String";
        value: string;
    };
    type None = {
        tag: "None";
    };
    type List = {
        tag: "List";
        value: PureString[];
    };
    type Url = {
        tag: "Url";
        value: {
            url: string;
            text: string;
        };
    };
    type t = PureString | None | List | Url;
    function none(): None;
    function string(value: string): PureString;
    function list(value: PureString[]): List;
    function url(url: string, text: string): Url;
    function toString(content: t): string;
}
export type Item = {
    id: string;
    fields: {
        [key: string]: ItemContent.t;
    };
};
