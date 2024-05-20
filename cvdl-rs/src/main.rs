#![feature(file_create_new)]

use crate::{layout_schema::LayoutSchema, local_storage::LocalStorage};
mod alignment;
mod any_layout;
mod basic_layout;
mod container;
mod data_schema;
mod element;
mod font;
mod layout;
mod layout_schema;
mod local_storage;
mod margin;
mod pdf_layout;
mod png_layout;
mod point;
mod resume_data;
mod resume_layout;
mod spatial_box;
mod width;

fn main() {
    env_logger::init();
    let ls = LocalStorage::new();
    ls.initiate_local_storage();
    println!("{:?}", ls.list_data_schemas());
    println!("{:?}", ls.list_layout_schemas());
    println!("{:?}", ls.list_resume_layouts());
    println!("{:?}", ls.list_resumes());

    let resume_data = ls.load_resume("resume2");

    let _data_schemas = resume_data
        .data_schemas()
        .iter()
        .map(|schema| ls.load_data_schema(schema))
        .collect::<Vec<data_schema::DataSchema>>();

    let layout_schemas = resume_data
        .layout_schemas()
        .iter()
        .map(|schema| ls.load_layout_schema(schema))
        .collect::<Vec<layout_schema::LayoutSchema>>();

    let mut layout_schema: LayoutSchema = layout_schemas.get(0).unwrap().clone();

    layout_schema.schema_name = "Test2".to_string();

    ls.save_layout_schema(&layout_schema);
}
