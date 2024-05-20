use crate::font::{Font, FontDict, FontSource, FontStyle, FontWeight};
use crate::layout_schema::LayoutSchema;
use std::fs::{self, File};
use std::io::Read;

use font_kit::{
    family_name::FamilyName,
    properties::{Properties, Stretch, Style, Weight},
    source::SystemSource,
};

impl From<FontWeight> for Weight {
    fn from(val: FontWeight) -> Self {
        match val {
            FontWeight::Light => Weight::LIGHT,
            FontWeight::Medium => Weight::MEDIUM,
            FontWeight::Bold => Weight::BOLD,
        }
    }
}

impl From<FontStyle> for Style {
    fn from(val: FontStyle) -> Self {
        match val {
            FontStyle::Normal => Style::Normal,
            FontStyle::Italic => Style::Italic,
        }
    }
}

pub trait FontLoader {
    fn load_font_from_path(&mut self, name: String, path: String);
    fn load_fonts_from_schema(&mut self, layout_schema: &LayoutSchema);
    fn load_font(&mut self, font: &Font);
}

pub enum FontLoadSource {
    Local(String),
    System(font_kit::loaders::core_text::Font),
}

pub struct LoadedFont {
    pub source: FontLoadSource,
    pub rusttype_font: rusttype::Font<'static>,
}

impl LoadedFont {
    pub fn load_font_stream(&self) -> Vec<u8> {
        match &self.source {
            FontLoadSource::Local(path) => {
                let mut file = File::open(path.clone()).unwrap();
                let mut bytes = Vec::new();
                file.read_to_end(&mut bytes).unwrap();
                bytes
            }
            FontLoadSource::System(font) => font.copy_font_data().unwrap().to_vec(),
        }
    }
}

impl FontLoader for FontDict {
    fn load_font_from_path(&mut self, name: String, path: String) {
        let mut file = File::open(path.clone()).unwrap();
        let mut bytes = Vec::new();
        file.read_to_end(&mut bytes).unwrap();

        let rusttype_font = rusttype::Font::try_from_vec(bytes.clone()).unwrap();
        self.insert(
            name,
            LoadedFont {
                source: FontLoadSource::Local(path),
                rusttype_font,
            },
        );
    }

    #[cfg(not(target_arch = "wasm32"))]
    fn load_font(&mut self, font: &Font) {
        match font.source {
            FontSource::Local => {
                self.load_font_from_path(
                    font.full_name(),
                    format!("assets/{}/static/{}.ttf", font.name, font.full_name()),
                );
            }
            FontSource::System => {
                if let Ok(best_match) = SystemSource::new().select_best_match(
                    &[FamilyName::Title(font.name.clone())],
                    &Properties {
                        style: font.style.clone().into(),
                        weight: font.weight.clone().into(),
                        stretch: Stretch::NORMAL,
                    },
                ) {
                    let font_data = best_match.load().unwrap();
                    let font_stream = font_data.copy_font_data().unwrap();
                    let rusttype_font =
                        rusttype::Font::try_from_vec((*font_stream).clone()).unwrap();

                    log::info!("{} will be used in your document", font_data.full_name());

                    self.insert(
                        font.full_name(),
                        LoadedFont {
                            source: FontLoadSource::System(font_data),
                            rusttype_font,
                        },
                    );
                } else {
                    log::info!(
                        "{} was not found in your system, will use the default font",
                        font.full_name()
                    );

                    if !self.contains_key(&Font::default_name()) {
                        let default_font = Font::default();
                        self.load_font(&default_font);
                    }
                }
            }
            FontSource::Remote => todo!(),
        }
    }

    fn load_fonts_from_schema(&mut self, layout_schema: &LayoutSchema) {
        for font in layout_schema.fonts() {
            if !self.contains_key(&font.full_name()) {
                self.load_font(&font);
            }
        }
    }
}

pub fn get_available_fonts() -> (Vec<String>, Vec<String>) {
    let ss = SystemSource::new();
    let system_fonts = ss.all_families().unwrap();

    log::info!("{} system fonts have been discovered!", system_fonts.len());

    log::info!("Discovering locally installed fonts...");

    let local_fonts: Vec<String> = fs::read_dir("assets")
        .unwrap()
        .filter_map(|t| t.ok())
        .filter(|dir_entry| dir_entry.file_type().map_or(false, |f| f.is_dir()))
        .map(|dir_entry| dir_entry.file_name().into_string())
        .filter_map(|t| t.ok())
        .collect();

    log::info!("{} local fonts have been discovered!", local_fonts.len());

    (system_fonts, local_fonts)
}
