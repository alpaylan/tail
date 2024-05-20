extern crate directories;

use std::{
    io::Write,
    path::{Path, PathBuf},
};

use directories::ProjectDirs;

use crate::{
    data_schema::DataSchema, layout_schema::LayoutSchema, resume_data::ResumeData,
    resume_layout::ResumeLayout,
};

/// This module provides the abstractions for interacting with persistent storage.
/// The library follows the directory structure below:
///
/// projectdir/com.cvdl.cvdl/
/// ├── data/
///        ├── resumes
///             ├── resume1.json
///             ├── resume2.json
///        ├── data-schemas.json
///        ├── layout-schemas.json
///        |── resume-layouts.json
///
/// The resume.json files contain the resume information, as well as references to the
/// schema names.
///
/// This module provides 3 types of functionalities for all 4 data types:
///     1. List
///     2. Load
///     3. Save

// Initiation Function

pub struct LocalStorage {
    dir: String,
}

impl LocalStorage {
    pub fn new() -> LocalStorage {
        let project_dirs = ProjectDirs::from("com", "cvdl", "cvdl").unwrap();
        let dir = project_dirs
            .data_dir()
            .as_os_str()
            .to_str()
            .unwrap()
            .to_string();
        LocalStorage { dir }
    }

    pub fn custom_dir(dir: &str) -> LocalStorage {
        LocalStorage {
            dir: dir.to_string(),
        }
    }
}

impl LocalStorage {
    pub fn initiate_local_storage(&self) {
        let data_dir = Path::new(self.dir.as_str());
        // Create data_dir/resumes if it does not exist
        std::fs::create_dir_all(data_dir.join("resumes")).unwrap();
        // Create data_dir/data-schemas.json if it does not exist
        if let Ok(mut data_schemas_file) =
            std::fs::File::create_new(data_dir.join("data-schemas.json"))
        {
            data_schemas_file.write_all("[]".as_bytes()).unwrap();
        }
        // Create data_dir/layout-schemas.json if it does not exist
        if let Ok(mut layout_schemas_file) =
            std::fs::File::create_new(data_dir.join("layout-schemas.json"))
        {
            layout_schemas_file.write_all("[]".as_bytes()).unwrap();
        }
        // Create data_dir/resume-layouts.json if it does not exist
        if let Ok(mut resume_layouts_file) =
            std::fs::File::create_new(data_dir.join("resume-layouts.json"))
        {
            resume_layouts_file.write_all("[]".as_bytes()).unwrap();
        }
    }
}

// Listing Functions

impl LocalStorage {
    pub fn list_resumes(&self) -> Vec<String> {
        let data_dir = Path::new(self.dir.as_str()).join("resumes");
        let mut resumes = Vec::new();
        if let Ok(entries) = std::fs::read_dir(data_dir) {
            for entry in entries.flatten() {
                if let Some(extension) = entry.path().extension() {
                    if extension == "json" {
                        if let Some(file_name) = entry.path().file_stem() {
                            resumes.push(file_name.to_str().unwrap().to_string());
                        }
                    }
                }
            }
        }
        resumes
    }

    pub fn list_data_schemas(&self) -> Vec<String> {
        let data_dir = Path::new(self.dir.as_str());
        let file = std::fs::File::open(data_dir.join("data-schemas.json")).unwrap();
        let data_schemas: Vec<DataSchema> = serde_json::from_reader(file).unwrap();
        data_schemas
            .iter()
            .map(|schema| schema.schema_name.to_string())
            .collect()
    }

    pub fn list_layout_schemas(&self) -> Vec<String> {
        let data_dir = Path::new(self.dir.as_str());
        let file = std::fs::File::open(data_dir.join("layout-schemas.json")).unwrap();
        let data_schemas: Vec<LayoutSchema> = serde_json::from_reader(file).unwrap();
        data_schemas
            .iter()
            .map(|schema| schema.schema_name.to_string())
            .collect()
    }

    pub fn list_resume_layouts(&self) -> Vec<String> {
        let data_dir = Path::new(self.dir.as_str());
        let file = std::fs::File::open(data_dir.join("resume-layouts.json")).unwrap();
        let data_schemas: Vec<ResumeLayout> = serde_json::from_reader(file).unwrap();
        data_schemas
            .iter()
            .map(|schema| schema.schema_name.to_string())
            .collect()
    }
}

// Loading Functions

impl LocalStorage {
    pub fn load_resume(&self, resume_name: &str) -> ResumeData {
        let data_dir = Path::new(self.dir.as_str()).join("resumes");
        let file = std::fs::File::open(data_dir.join(format!("{}.json", resume_name))).unwrap();
        let resume_data: ResumeData = serde_json::from_reader(file).unwrap();
        resume_data
    }

    pub fn load_data_schema(&self, schema_name: &str) -> DataSchema {
        let data_dir = Path::new(self.dir.as_str());
        println!("{:?}", data_dir);
        let file = std::fs::File::open(data_dir.join("data-schemas.json")).unwrap();
        let data_schemas: Vec<DataSchema> = serde_json::from_reader(file).unwrap();
        data_schemas
            .into_iter()
            .find(|schema| schema.schema_name == schema_name)
            .unwrap()
    }

    pub fn load_layout_schema(&self, schema_name: &str) -> LayoutSchema {
        let data_dir = Path::new(self.dir.as_str());
        let file = std::fs::File::open(data_dir.join("layout-schemas.json")).unwrap();
        let layout_schemas: Vec<LayoutSchema> = serde_json::from_reader(file).unwrap();
        layout_schemas
            .into_iter()
            .find(|schema| schema.schema_name == schema_name)
            .unwrap()
    }

    pub fn load_resume_layout(&self, schema_name: &str) -> ResumeLayout {
        let data_dir = Path::new(self.dir.as_str());
        let file = std::fs::File::open(data_dir.join("resume-layouts.json")).unwrap();
        let resume_layout: Vec<ResumeLayout> = serde_json::from_reader(file).unwrap();
        resume_layout
            .into_iter()
            .find(|schema| schema.schema_name == schema_name)
            .unwrap()
    }
}

// Saving Functions

impl LocalStorage {
    pub fn save_resume(&self, resume_name: &str, resume_data: &ResumeData) {
        let data_dir = Path::new(self.dir.as_str()).join("resumes");
        let file = std::fs::File::create(data_dir.join(format!("{}.json", resume_name))).unwrap();
        serde_json::to_writer_pretty(file, resume_data).unwrap();
    }

    pub fn save_data_schema(&self, data_schema: &DataSchema) {
        let data_dir = Path::new(self.dir.as_str());
        let file = std::fs::File::open(data_dir.join("data-schemas.json")).unwrap();
        let mut data_schemas: Vec<DataSchema> = serde_json::from_reader(file).unwrap();
        if let Some(index) = data_schemas
            .iter()
            .position(|schema| schema.schema_name == data_schema.schema_name)
        {
            data_schemas[index] = data_schema.clone();
        } else {
            data_schemas.push(data_schema.clone());
        }
        let file = std::fs::File::create(data_dir.join("data-schemas.json")).unwrap();
        serde_json::to_writer_pretty(file, &data_schemas).unwrap();
    }

    pub fn save_layout_schema(&self, layout_schema: &LayoutSchema) {
        let data_dir = Path::new(self.dir.as_str());
        let file = std::fs::File::open(data_dir.join("layout-schemas.json")).unwrap();
        let mut layout_schemas: Vec<LayoutSchema> = serde_json::from_reader(file).unwrap();
        if let Some(index) = layout_schemas
            .iter()
            .position(|schema| schema.schema_name == layout_schema.schema_name)
        {
            layout_schemas[index] = layout_schema.clone();
        } else {
            layout_schemas.push(layout_schema.clone());
        }
        let file = std::fs::File::create(data_dir.join("layout-schemas.json")).unwrap();
        serde_json::to_writer_pretty(file, &layout_schemas).unwrap();
    }

    pub fn save_resume_layout(&self, resume_layout: &ResumeLayout) {
        let data_dir = Path::new(self.dir.as_str());
        let file = std::fs::File::open(data_dir.join("resume-layouts.json")).unwrap();
        let mut resume_layouts: Vec<ResumeLayout> = serde_json::from_reader(file).unwrap();
        if let Some(index) = resume_layouts
            .iter()
            .position(|schema| schema.schema_name == resume_layout.schema_name)
        {
            resume_layouts[index] = resume_layout.clone();
        } else {
            resume_layouts.push(resume_layout.clone());
        }
        let file = std::fs::File::create(data_dir.join("resume-layouts.json")).unwrap();
        serde_json::to_writer_pretty(file, &resume_layouts).unwrap();
    }
}
