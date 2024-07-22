
import { DataSchema } from "./DataSchema";
import * as Font from "./Font";
import { LayoutSchema } from "./LayoutSchema";
import { Resume } from "./Resume";
import { ResumeLayout } from "./ResumeLayout";
import { Storage } from "./Storage";

export class IndexedDB implements Storage {
    async initiate_storage(): Promise<void> {
        const resumes = indexedDB.open("resumes", 1);

        resumes.onupgradeneeded = () => {
            const db = resumes.result;
            db.createObjectStore("resumes", { keyPath: "name" });
        };

        resumes.onsuccess = () => {
            const db = resumes.result;
            const transaction = db.transaction("resumes", "readwrite");
            const store = transaction.objectStore("resumes");

            if (!store.get("Default")) {
                fetch("https://d2bnplhbawocbk.cloudfront.net/data/resumes/resume5.json").then((response) => {
                    response.json().then((resume) => {
                        store.add({ name: "Default", data: resume });
                    });
                });
            }
        };

        const data_schemas = indexedDB.open("data_schemas", 1);

        data_schemas.onupgradeneeded = () => {
            const db = data_schemas.result;
            db.createObjectStore("data_schemas", { keyPath: "schema_name" });
        };

        data_schemas.onsuccess = () => {
            const db = data_schemas.result;
            const transaction = db.transaction("data_schemas", "readwrite");
            const store = transaction.objectStore("data_schemas");

            if (!store.get("Default")) {
                fetch("https://d2bnplhbawocbk.cloudfront.net/data/data-schemas.json").then((response) => {
                    response.json().then((data_schemas) => {
                        store.add(data_schemas);
                    });
                });
            }
        };
        
        const section_layouts = indexedDB.open("section_layouts", 1);

        section_layouts.onupgradeneeded = () => {
            const db = section_layouts.result;
            db.createObjectStore("section_layouts", { keyPath: "schema_name" });
        };

        section_layouts.onsuccess = () => {
            const db = section_layouts.result;
            const transaction = db.transaction("section_layouts", "readwrite");
            const store = transaction.objectStore("section_layouts");

            if (!store.get("Default")) {
                fetch("https://d2bnplhbawocbk.cloudfront.net/data/layout-schemas3.json").then((response) => {
                    response.json().then((section_layouts) => {
                        store.add(section_layouts);
                    });
                });
            }
        };

        const resume_layouts = indexedDB.open("resume_layouts", 1);

        resume_layouts.onupgradeneeded = () => {
            const db = resume_layouts.result;
            db.createObjectStore("resume_layouts", { keyPath: "schema_name" });
        };

        resume_layouts.onsuccess = () => {
            const db = resume_layouts.result;
            const transaction = db.transaction("resume_layouts", "readwrite");
            const store = transaction.objectStore("resume_layouts");

            if (!store.get("Default")) {
                fetch("https://d2bnplhbawocbk.cloudfront.net/data/resume-layouts.json").then((response) => {
                    response.json().then((resume_layouts) => {
                        store.add(resume_layouts);
                    });
                });
            }
        };
    }


    list_resumes(): Promise<string[]> {
        const resumes = indexedDB.open("resumes", 1);

        resumes.onsuccess = () => {
            const db = resumes.result;
            const transaction = db.transaction("resumes", "readwrite");
            const store = transaction.objectStore("resumes");

            const request = store.getAll();
            request.onsuccess = () => {
                return request.result.map((resume: any) => resume.name);
            };
        };

        return Promise.resolve([]);
    }

    list_data_schemas(): Promise<string[]> {
        const data_schemas = indexedDB.open("data_schemas", 1);

        data_schemas.onsuccess = () => {
            const db = data_schemas.result;
            const transaction = db.transaction("data_schemas", "readwrite");
            const store = transaction.objectStore("data_schemas");

            const request = store.getAll();
            request.onsuccess = () => {
                return request.result.map((schema: any) => schema.schema_name);
            };
        };

        return Promise.resolve([]);
    }

    list_layout_schemas(): Promise<string[]> {
        const section_layouts = indexedDB.open("section_layouts", 1);

        section_layouts.onsuccess = () => {
            const db = section_layouts.result;
            const transaction = db.transaction("section_layouts", "readwrite");
            const store = transaction.objectStore("section_layouts");

            const request = store.getAll();
            request.onsuccess = () => {
                return request.result.map((schema: any) => schema.schema_name);
            };
        };

        return Promise.resolve([]);
    }

    list_resume_layouts(): Promise<string[]> {
        const resume_layouts = indexedDB.open("resume_layouts", 1);

        resume_layouts.onsuccess = () => {
            const db = resume_layouts.result;
            const transaction = db.transaction("resume_layouts", "readwrite");
            const store = transaction.objectStore("resume_layouts");

            const request = store.getAll();
            request.onsuccess = () => {
                return request.result.map((schema: any) => schema.schema_name);
            };
        };

        return Promise.resolve([]);
    }

    load_resume(resume_name: string): Promise<Resume> {
        const resumes = indexedDB.open("resumes", 1);

        resumes.onsuccess = () => {
            const db = resumes.result;
            const transaction = db.transaction("resumes", "readwrite");
            const store = transaction.objectStore("resumes");

            const request = store.get(resume_name);
            request.onsuccess = () => {
                return Resume.fromJson(request.result.data);
            };
        };

        return Promise.resolve(Resume.fromJson({}));
    }

    load_data_schema(schema_name: string): Promise<DataSchema> {
        const data_schemas = indexedDB.open("data_schemas", 1);

        data_schemas.onsuccess = () => {
            const db = data_schemas.result;
            const transaction = db.transaction("data_schemas", "readwrite");
            const store = transaction.objectStore("data_schemas");

            const request = store.get(schema_name);
            request.onsuccess = () => {
                return DataSchema.fromJson(request.result);
            };
        };

        return Promise.resolve(DataSchema.fromJson({}));
    }

    load_layout_schema(schema_name: string): Promise<LayoutSchema> {
        const section_layouts = indexedDB.open("section_layouts", 1);

        section_layouts.onsuccess = () => {
            const db = section_layouts.result;
            const transaction = db.transaction("section_layouts", "readwrite");
            const store = transaction.objectStore("section_layouts");

            const request = store.get(schema_name);
            request.onsuccess = () => {
                return LayoutSchema.fromJson(request.result);
            };
        };

        return Promise.resolve(LayoutSchema.fromJson({}));
    }

    load_resume_layout(schema_name: string): Promise<ResumeLayout> {
        const resume_layouts = indexedDB.open("resume_layouts", 1);

        resume_layouts.onsuccess = () => {
            const db = resume_layouts.result;
            const transaction = db.transaction("resume_layouts", "readwrite");
            const store = transaction.objectStore("resume_layouts");

            const request = store.get(schema_name);
            request.onsuccess = () => {
                return ResumeLayout.fromJson(request.result);
            };
        };

        return Promise.resolve(ResumeLayout.fromJson({}));
    }

    save_resume(resume_name: string, resume_data: Resume): Promise<void> {
        const resumes = indexedDB.open("resumes", 1);

        resumes.onsuccess = () => {
            const db = resumes.result;
            const transaction = db.transaction("resumes", "readwrite");
            const store = transaction.objectStore("resumes");

            const request = store.put({ name: resume_name, data: resume_data.toJson() });
            request.onsuccess = () => {
                return;
            };
        };

        return Promise.resolve();
    }

    save_data_schema(data_schema: DataSchema): Promise<void> {
        const data_schemas = indexedDB.open("data_schemas", 1);

        data_schemas.onsuccess = () => {
            const db = data_schemas.result;
            const transaction = db.transaction("data_schemas", "readwrite");
            const store = transaction.objectStore("data_schemas");

            const request = store.put(data_schema);
            request.onsuccess = () => {
                return;
            };
        };

        return Promise.resolve();
    }

    save_layout_schema(layout_schema: LayoutSchema): Promise<void> {
        const section_layouts = indexedDB.open("section_layouts", 1);

        section_layouts.onsuccess = () => {
            const db = section_layouts.result;
            const transaction = db.transaction("section_layouts", "readwrite");
            const store = transaction.objectStore("section_layouts");

            const request = store.put(layout_schema);
            request.onsuccess = () => {
                return;
            };
        };

        return Promise.resolve();
    }

    save_resume_layout(resume_layout: ResumeLayout): Promise<void> {
        const resume_layouts = indexedDB.open("resume_layouts", 1);

        resume_layouts.onsuccess = () => {
            const db = resume_layouts.result;
            const transaction = db.transaction("resume_layouts", "readwrite");
            const store = transaction.objectStore("resume_layouts");

            const request = store.put(resume_layout);
            request.onsuccess = () => {
                return;
            };
        };

        return Promise.resolve();
    }

    async load_font(font: Font.t): Promise<Buffer> {
        const path = `fonts/${Font.full_name(font)}.ttf`;
        const fonts = indexedDB.open("fonts", 1);

        fonts.onsuccess = () => {
            const db = fonts.result;
            const transaction = db.transaction("fonts", "readwrite");
            const store = transaction.objectStore("fonts");

            const request = store.get(path);
            request.onsuccess = () => {
                return Buffer.from(request.result);
            };
            request.onerror = () => {
                const response = fetch(`https://d2bnplhbawocbk.cloudfront.net/data/${path}`);
                response.then((response) => {
                    response.arrayBuffer().then((font_data) => {
                        store.add(font_data, path);
                    });
                });
            }

        };

        return Promise.resolve(Buffer.from([]));
    }
}
