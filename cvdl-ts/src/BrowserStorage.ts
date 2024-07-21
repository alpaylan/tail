import { LocalStorage } from "./LocalStorage";
import { IndexedDB } from "./IndexedDB";
import { DataSchema } from "./DataSchema";
import * as Font from "./Font";
import { LayoutSchema } from "./LayoutSchema";
import { Resume } from "./Resume";
import { ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";

export class BrowserStorage implements Storage {
	async initiate_storage(): Promise<void> {
        new LocalStorage().initiate_storage();
	}

	list_resumes(): Promise<string[]> {
		return new LocalStorage().list_resumes();
	}

	list_data_schemas(): Promise<string[]> {
		return new LocalStorage().list_data_schemas();
	}

	list_layout_schemas(): Promise<string[]> {
		return new LocalStorage().list_layout_schemas();
	}

	list_resume_layouts(): Promise<string[]> {
		return new LocalStorage().list_resume_layouts();
	}

	load_resume(resume_name: string): Promise<Resume> {
		return new LocalStorage().load_resume(resume_name);
	}

	load_data_schema(schema_name: string): Promise<DataSchema> {
        return new LocalStorage().load_data_schema(schema_name);
	}
	load_layout_schema(schema_name: string): Promise<LayoutSchema> {
		return new LocalStorage().load_layout_schema(schema_name);
	}

	load_resume_layout(schema_name: string): Promise<ResumeLayout> {
		return new LocalStorage().load_resume_layout(schema_name);
	}

	save_resume(resume_name: string, resume_data: Resume): Promise<void> {
		return new LocalStorage().save_resume(resume_name, resume_data);
	}

	save_data_schema(data_schema: DataSchema): Promise<void> {
        return new LocalStorage().save_data_schema(data_schema);
	}

	save_layout_schema(layout_schema: LayoutSchema): Promise<void> {
		return new LocalStorage().save_layout_schema(layout_schema);
	}
	
    save_resume_layout(resume_layout: ResumeLayout): Promise<void> {
        throw new Error("Method not implemented.");
    }

	async load_font(font: Font.t): Promise<Buffer> {
        return new IndexedDB().load_font(font);
    }
}
