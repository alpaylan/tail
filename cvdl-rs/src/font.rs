use std::{
    collections::HashMap,
    fs::{self, File},
    io::Read,
};

use font_kit::{
    family_name::FamilyName,
    properties::{Properties, Stretch, Style, Weight},
    source::SystemSource,
};
use rusttype::{point, Scale};
use serde::{Deserialize, Serialize};

use crate::layout_schema::LayoutSchema;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Font {
    #[serde(default = "Font::default_name")]
    pub name: String,
    #[serde(default = "Font::default_size")]
    pub size: f32,
    #[serde(default = "FontWeight::default")]
    pub weight: FontWeight,
    #[serde(default = "FontStyle::default")]
    pub style: FontStyle,
    #[serde(default = "FontSource::default")]
    pub source: FontSource,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub enum FontSource {
    Local,
    #[default]
    System,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub enum FontWeight {
    Light,
    #[default]
    Medium,
    Bold,
}

impl ToString for FontWeight {
    fn to_string(&self) -> String {
        match self {
            FontWeight::Light => "Light".to_string(),
            FontWeight::Medium => "Medium".to_string(),
            FontWeight::Bold => "Bold".to_string(),
        }
    }
}

impl From<FontWeight> for Weight {
    fn from(val: FontWeight) -> Self {
        match val {
            FontWeight::Light => Weight::LIGHT,
            FontWeight::Medium => Weight::MEDIUM,
            FontWeight::Bold => Weight::BOLD,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub enum FontStyle {
    #[default]
    Normal,
    Italic,
}

impl ToString for FontStyle {
    fn to_string(&self) -> String {
        match self {
            FontStyle::Normal => "".to_string(),
            FontStyle::Italic => "Italic".to_string(),
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

impl Default for Font {
    fn default() -> Font {
        Font {
            name: Font::default_name(),
            size: Font::default_size(),
            weight: FontWeight::default(),
            style: FontStyle::default(),
            source: FontSource::default(),
        }
    }
}

impl Font {
    pub fn default_name() -> String {
        "Arial".to_string()
    }

    pub fn default_size() -> f32 {
        12.0
    }
}

pub enum FontLoadSource {
    Local(String),
    System(font_kit::loaders::core_text::Font),
}
pub struct LoadedFont {
    pub source: FontLoadSource,
    pub rusttype_font: rusttype::Font<'static>,
}

pub type FontDict = HashMap<String, LoadedFont>;

pub trait FontLoader {
    fn load_font_from_path(&mut self, name: String, path: String);
    fn load_fonts_from_schema(&mut self, layout_schema: &LayoutSchema);
    fn load_font(&mut self, font: &Font);
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

impl Font {
    pub fn full_name(&self) -> String {
        self.name.clone() + "-" + self.weight.to_string().as_str() + self.style.to_string().as_str()
    }

    pub fn get_width(&self, text: &str, font_dict: &FontDict) -> f32 {
        let text = text.trim();
        
        if text.len() == 0 {
            return 0.0;
        }
        
        // The font size to use
        let scale = Scale::uniform(self.size);
        let font = &font_dict
            .get(&self.full_name())
            .unwrap_or_else(|| font_dict.get(&Font::default().full_name()).unwrap())
            .rusttype_font;

        // The text to render
        let v_metrics = font.v_metrics(scale);

        // layout the glyphs in a line with 20 pixels padding
        let glyphs: Vec<_> = font
            .layout(text.trim(), scale, point(0_f32, v_metrics.ascent))
            .collect();

        let glyphs_width = {
            let min_x = glyphs
                .first()
                .map(|g| g.pixel_bounding_box().unwrap().min.x)
                .unwrap();
            let max_x = glyphs
                .last()
                .map(|g| g.pixel_bounding_box().unwrap().max.x)
                .unwrap();
            (max_x - min_x) as f32
        };

        glyphs_width
    }

    pub fn get_height(&self, font_dict: &FontDict) -> f32 {
        // The font size to use
        let scale = Scale::uniform(self.size);
        let font = &font_dict
            .get(&self.full_name())
            .unwrap_or_else(|| font_dict.get(&Font::default().full_name()).unwrap())
            .rusttype_font;

        // The text to render
        let v_metrics = font.v_metrics(scale);

        // work out the layout size
        v_metrics.ascent - v_metrics.descent
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
}
