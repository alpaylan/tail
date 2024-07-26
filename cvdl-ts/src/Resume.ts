/* eslint-disable @typescript-eslint/no-namespace */


export type t = {
	name: string;
	layout: string;
	sections: ResumeSection.t[];
}

export function resume(name: string, layout: string, sections: ResumeSection.t[]): t {
	return {
		name,
		layout,
		sections,
	};
}

export function dataSchemas(resume: t): string[] {
	return resume.sections.map((section) => section.data_schema);
}

export function layoutSchemas(resume: t): string[] {
	return resume.sections.map((section) => section.layout_schema);
}

export module ResumeSection {

	export type t = {
		section_name: string;
		data_schema: string;
		layout_schema: string;
		data: Item,
		items: Item[];
	}

	export function resumeSection(
		section_name: string,
		data_schema: string,
		layout_schema: string,
		data: Item,
		items: Item[],
	): t {
		return {
			section_name,
			data_schema,
			layout_schema,
			data,
			items,
		};
	}

}

export module ItemContent {
	export type PureString = {
		tag: "String";
		value: string;
	};

	export type None = {
		tag: "None";
	};

	export type List = {
		tag: "List";
		value: PureString[];
	}

	export type Url = {
		tag: "Url";
		value: {
			url: string;
			text: string;
		};
	};

	export type t = PureString | None | List | Url;

	export function none(): None {
		return { tag: "None" };
	}

	export function string(value: string): PureString {
		return { tag: "String", value };
	}

	export function list(value: PureString[]): List {
		return { tag: "List", value };
	}

	export function url(url: string, text: string): Url {
		return { tag: "Url", value: { url, text } };
	}

	export function toString(content: t): string {
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

}

export type Item = {
	id: string,
	fields: { [key: string]: ItemContent.t }
};