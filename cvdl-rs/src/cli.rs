#![feature(file_create_new)]

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

use std::fs;

use pdf_layout::PdfLayout;
use png_layout::PngLayout;
use std::path::Path;

use std::env;

fn main() {
    env_logger::init();

    let resume_path = env::args().nth(1).expect("No resume path provided");
    let resume = fs::read_to_string(resume_path).unwrap();
    let resume_data = resume_data::ResumeData::from_json(&resume);

    let results_path = env::args().nth(2).expect("No results path provided");

    let debug = if let Some(is_debug) = env::args().nth(3) {
        is_debug == "--debug"
    } else {
        false
    };

    let local_storage = if let Some(dir) = env::args().nth(4) {
        local_storage::LocalStorage::custom_dir(dir.as_str())
    } else {
        local_storage::LocalStorage::new()
    };

    PngLayout::render_and_save(
        local_storage,
        resume_data,
        Path::new(results_path.as_str()),
        debug,
    )
    .unwrap();
}
