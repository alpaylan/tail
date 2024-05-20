import { Resume } from "cvdl-ts/dist/Resume";

import { ElementPath } from "cvdl-ts/dist/AnyLayout";
import { ResumeSection, ItemContent, Item, ItemName } from "cvdl-ts/dist/Resume";
import { createContext } from "react";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { LocalStorage } from "cvdl-ts/dist/LocalStorage";



export type EditorState = {
    resume: Resume,
    editorPath: ElementPath,
    resumeName: string,
    editHistory: DocumentAction[]
  };
  
  export const EditorContext = createContext<EditorState | null>(null);
  
  // Create a global storage for ResumeData
  // export const DocumentContext = createContext<Resume | null>(null);
  export const DocumentDispatchContext = createContext<React.Dispatch<any> | null>(null);
  
  // Create a dispatch function that changes the contents of a field in the ResumeData
  
  const reId = (resume: Resume) => {
    const newResume = Resume.fromJson(resume.toJson());
    newResume.sections = newResume.sections.map((section) => {
      const newSection = ResumeSection.fromJson(section.toJson());
      newSection.items = newSection.items.map((item) => {
        const newItem = { id: Math.random().toString(36).substring(7), fields: item.fields };
        return newItem;
      });
      return newSection;
    });
    return newResume;
  }
  
  const deepCopyResume = (resume: Resume) => {
    const newResume = Resume.fromJson(resume.toJson());
    newResume.sections = newResume.sections.map((section) => {
      const newSection = ResumeSection.fromJson(section.toJson());
      newSection.items = newSection.items.map((item) => {
        const newItem = { id: item.id, fields: item.fields };
        return newItem;
      });
      return newSection;
    });
    return newResume;
  }
  
  
  type DocumentAction = {
    type: "field-update"
    section: string,
    item: number,
    field: string,
    value: ItemContent
  } | {
    type: "load"
    value: Resume
  } | {
    type: "layout-update"
    value: LayoutSchema
  } | {
    type: "delete-item"
    section: string,
    item: number
  } | {
    type: "add-empty-item",
    section: string
  } | {
    type: "copy-item",
    section: string,
    item: number
  } | {
    type: "move-item",
    section: string,
    item: number,
    direction: "up" | "down"
  } | {
    type: "add-item",
    section: string
    item: Item
    index?: number
  } | {
    type: "add-section",
    index?: number,
    section: ResumeSection
  } | {
    type: "add-empty-section",
    section_name: string,
    data_schema: string,
    layout_schema: string
  } | {
    type: "delete-section",
    section_name: string
  } | {
    type: "section-layout-update",
    section_name: string,
    layout_schema_name: string
  } | {
    type: "add-layout",
    layout: LayoutSchema
  } | {
    type: "create-new-resume",
    resumeName: string
  } | {
    type: "switch-resume",
    resumeName: string
  } | {
    type: "undo"
  };
  
  export type ContentEditorAction = {
    type: "set-editor-path",
    path: ElementPath
  }
  
  export type EditorAction = DocumentAction | ContentEditorAction;
  
  const cloneEditorHistory = (history: DocumentAction[]) => {
    return history.map((action) => {
      return { ...action };
    });
  }
  
  
  export const DocumentReducer = (state: EditorState, action_: EditorAction) => {
    const resume = state.resume;
    let newState = reId(resume);
    let path = state.editorPath;
    let resumeName = state.resumeName;
    let editHistory = cloneEditorHistory(state.editHistory) as DocumentAction[];
    let undoing = false;
  
    if (action_.type === "undo" && editHistory.length > 0) {
      let lastAction = editHistory.pop();
      action_ = (lastAction!) as EditorAction;
      undoing = true;
    }
    // Learn why this is needed.
    const action = action_ as EditorAction;
  
    if (action.type === 'set-editor-path') {
      path = action.path;
      if (path.tag === "section" || path.tag === "item") {
        setTimeout(() => {
          // @ts-ignore
          document.getElementById(path.section)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      }
    }
  
    if (action.type === "load") {
      newState = action.value;
    }
  
    if (action.type === "create-new-resume") {
      newState = new Resume("SingleColumnSchema", []);
      path = { tag: 'none' };
      resumeName = action.resumeName;
    }
  
    if (action.type === "switch-resume") {
      resumeName = action.resumeName;
      path = { tag: 'none' };
      newState = new LocalStorage().load_resume(action.resumeName);
    }
  
    if (action.type === "field-update") {
      newState.sections = resume.sections.map((section) => {
        const newSection = ResumeSection.fromJson(section.toJson());
        if (section.section_name === action.section) {
          if (action.item !== -1) {
            const item = newSection.items[action.item];
            if (!undoing) {
              editHistory.push({ type: "field-update", section: section.section_name, item: action.item, field: action.field, value: item.fields.get(action.field)! });
            }
            item.fields.set(action.field, action.value);
          } else {
            if (!undoing) {
              editHistory.push({ type: "field-update", section: section.section_name, item: action.item, field: action.field, value: newSection.data.get(action.field)! });
            }
            newSection.data.set(action.field, action.value);
          }
        }
        return newSection;
      });
    }
  
    if (action.type === "delete-item") {
      newState.sections = resume.sections.map((section) => {
        const newSection = ResumeSection.fromJson(section.toJson());
        if (section.section_name === action.section) {
          newSection.items = section.items.filter((item, index) => index !== action.item);
          if (!undoing) {
            console.error(section.items[action.item]);
            editHistory.push({ type: "add-item", section: section.section_name, item: section.items[action.item], index: action.item });
          }
        }
        return newSection;
      });
    }
  
    if (action.type === "add-item") {
      newState.sections = resume.sections.map((section) => {
        const newSection = ResumeSection.fromJson(section.toJson());
        if (section.section_name === action.section) {
          if (action.index === undefined) {
            newSection.items.push(action.item);
            path = { tag: 'item', section: section.section_name, item: newSection.items.length - 1 };
          } else {
            newSection.items.splice(action.index, 0, action.item);
            path = { tag: 'item', section: section.section_name, item: action.index };
          }
  
          console.error(action.item);
          document.getElementById(action.item.id)?.scrollIntoView();
          if (!undoing) {
            editHistory.push({ type: "delete-item", section: section.section_name, item: newSection.items.length - 1 });
          }
        }
        return newSection;
      });
    }
  
    if (action.type === "copy-item") {
      newState.sections = resume.sections.map((section) => {
        const newSection = ResumeSection.fromJson(section.toJson());
        if (section.section_name === action.section) {
          const id = Math.random().toString(36).substring(7);
          const item = section.items[action.item];
          const fields = new Map<ItemName, ItemContent>();
          item.fields.forEach((value, key) => {
            fields.set(key, value);
          });
          newSection.items.push({ id, fields });
          if (!undoing) {
            editHistory.push({ type: "delete-item", section: section.section_name, item: newSection.items.length - 1 });
          }
        }
        return newSection;
      });
    }
  
    if (action.type === "move-item") {
      newState.sections = resume.sections.map((section) => {
        const newSection = ResumeSection.fromJson(section.toJson());
        if (section.section_name === action.section) {
  
          if ((action.item < 0 && action.direction === "up") ||
            (action.item >= newSection.items.length && action.direction === "down")) {
            return newSection;
          }
  
          const swapPosition = action.direction === "up" ? action.item - 1 : action.item + 1;
  
          const item = newSection.items[action.item];
  
          const temp = newSection.items[swapPosition];
          newSection.items[swapPosition] = item;
          newSection.items[action.item] = temp;
  
          if (!undoing) {
            editHistory.push({ type: "move-item", section: section.section_name, item: swapPosition, direction: action.direction === "up" ? "down" : "up" });
          }
        }
        return newSection;
      });
    }
  
    if (action.type === "add-empty-item") {
      newState.sections = resume.sections.map((section) => {
        const newSection = ResumeSection.fromJson(section.toJson());
        if (section.section_name === action.section) {
          const storage = new LocalStorage();
          const data_schema = storage.load_data_schema(section.data_schema);
          const item = new Map<ItemName, ItemContent>();
          data_schema.item_schema.forEach((field) => {
            item.set(field.name, ItemContent.None());
          });
          const id = Math.random().toString(36).substring(7);
          newSection.items.push({ id, fields: item });
          path = { tag: 'item', section: section.section_name, item: newSection.items.length - 1 };
          setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 200);
          if (!undoing) {
            editHistory.push({ type: "delete-item", section: section.section_name, item: newSection.items.length - 1 });
          }
        }
        return newSection;
      });
    }
  
    if (action.type === "add-section") {
      if (action.index === undefined) {
        newState.sections.push(action.section);
      } else {
        newState.sections.splice(action.index, 0, action.section);
      }
  
      if (!undoing) {
        editHistory.push({ type: "delete-section", section_name: action.section.section_name });
      }
    }
  
    if (action.type === "add-empty-section") {
      const newSection = new ResumeSection();
      const storage = new LocalStorage();
      const layout_schema = storage.load_layout_schema(action.layout_schema);
      newSection.data_schema = layout_schema.data_schema_name;
      newSection.section_name = action.section_name;
      newSection.layout_schema = action.layout_schema;
      newState.sections.push(newSection);
      if (!undoing) {
        editHistory.push({ type: "delete-section", section_name: action.section_name });
      }
    }
  
    if (action.type === "delete-section") {
      newState.sections = resume.sections.filter((section) => section.section_name !== action.section_name);
      if (!undoing) {
        editHistory.push({
          type: "add-section",
          index: resume.sections.findIndex((section) => section.section_name === action.section_name),
          section: resume.sections.find((section) => section.section_name === action.section_name)!
        });
      }
    }
  
    if (action.type === "section-layout-update") {
      newState.sections = resume.sections.map((section) => {
        const newSection = ResumeSection.fromJson(section.toJson());
        if (section.section_name === action.section_name) {
          newSection.layout_schema = action.layout_schema_name;
          if (!undoing) {
            editHistory.push({ type: "section-layout-update", section_name: action.section_name, layout_schema_name: section.layout_schema });
          }
        }
        return newSection;
      });
    }
  
    new LocalStorage().save_resume(resumeName, newState);
    return { resume: newState, editorPath: path, resumeName: resumeName, editHistory: editHistory };
  }