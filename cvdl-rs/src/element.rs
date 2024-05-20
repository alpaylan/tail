use std::fmt::Display;

use serde::{Deserialize, Serialize};

use crate::{
    alignment::Alignment,
    font::{Font, FontDict},
    margin::Margin,
    width::Width,
};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Element {
    #[serde(skip)]
    #[serde(default = "Uuid::new_v4")]
    pub uid: Uuid,
    pub item: String,
    #[serde(default = "Margin::default")]
    pub margin: Margin,
    #[serde(default = "Alignment::default")]
    pub alignment: Alignment,
    #[serde(default = "Width::default")]
    pub width: Width,
    #[serde(default = "Width::default")]
    pub text_width: Width,
    #[serde(default = "Font::default")]
    pub font: Font,
    #[serde(skip)]
    #[serde(default = "bool::default")]
    pub is_fill: bool,
    #[serde(skip)]
    #[serde(default = "Option::default")]
    pub url: Option<String>,
}

impl Display for Element {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut s = String::new();
        if let Some(url) = &self.url {
            s.push_str(&format!("[{}]", self.item));
            s.push_str(&format!("({})", url));
        } else {
            s.push_str(self.item.as_str());
        }
        write!(f, "{}", s)
    }
}

impl Default for Element {
    fn default() -> Element {
        Element {
            item: String::new(),
            margin: Margin::default(),
            alignment: Alignment::default(),
            width: Width::default(),
            text_width: Width::default(),
            font: Font::default(),
            is_fill: false,
            url: None,
            uid: Uuid::new_v4(),
        }
    }
}

impl Element {
    pub fn with_item(&self, item: String) -> Element {
        Element {
            item,
            margin: self.margin,
            alignment: self.alignment,
            width: self.width,
            text_width: self.text_width,
            font: self.font.clone(),
            is_fill: self.is_fill,
            url: self.url.clone(),
            uid: self.uid,
        }
    }
    #[allow(dead_code)]
    pub fn with_margin(&self, margin: Margin) -> Element {
        Element {
            item: self.item.clone(),
            margin,
            alignment: self.alignment,
            width: self.width,
            text_width: self.text_width,
            font: self.font.clone(),
            is_fill: self.is_fill,
            url: self.url.clone(),
            uid: self.uid,
        }
    }
    #[allow(dead_code)]
    pub fn with_alignment(&self, alignment: Alignment) -> Element {
        Element {
            item: self.item.clone(),
            margin: self.margin,
            alignment,
            width: self.width,
            text_width: self.text_width,
            font: self.font.clone(),
            is_fill: self.is_fill,
            url: self.url.clone(),
            uid: self.uid,
        }
    }
    #[allow(dead_code)]
    pub fn with_width(&self, width: Width) -> Element {
        Element {
            item: self.item.clone(),
            margin: self.margin,
            alignment: self.alignment,
            width,
            text_width: self.text_width,
            font: self.font.clone(),
            is_fill: self.is_fill,
            url: self.url.clone(),
            uid: self.uid,
        }
    }

    pub fn with_text_width(&self, text_width: Width) -> Element {
        Element {
            item: self.item.clone(),
            margin: self.margin,
            alignment: self.alignment,
            width: self.width,
            text_width,
            font: self.font.clone(),
            is_fill: self.is_fill,
            url: self.url.clone(),
            uid: self.uid,
        }
    }

    pub fn with_url(&self, url: String) -> Element {
        Element {
            item: self.item.clone(),
            margin: self.margin,
            alignment: self.alignment,
            width: self.width,
            text_width: self.text_width,
            font: self.font.clone(),
            is_fill: self.is_fill,
            url: Some(url),
            uid: self.uid,
        }
    }

    pub fn scale_width(&self, w: f32) -> Element {
        Element {
            item: self.item.clone(),
            margin: self.margin,
            alignment: self.alignment,
            width: self.width.scale(w),
            text_width: self.text_width,
            font: self.font.clone(),
            is_fill: self.is_fill,
            url: self.url.clone(),
            uid: self.uid,
        }
    }

    pub fn fill_fonts(&self, fonts: &FontDict) -> Element {
        let text_width_with_font = self.font.get_width(&self.item, fonts);
        if self.is_fill {
            Element {
                item: self.item.clone(),
                margin: self.margin,
                alignment: self.alignment,
                width: Width::Absolute(f32::min(
                    self.width.get_fixed().unwrap(),
                    text_width_with_font,
                )),
                text_width: Width::Absolute(text_width_with_font),
                font: self.font.clone(),
                is_fill: self.is_fill,
                url: self.url.clone(),
                uid: self.uid,
            }
        } else {
            Element {
                item: self.item.clone(),
                margin: self.margin,
                alignment: self.alignment,
                width: self.width,
                text_width: Width::Absolute(text_width_with_font),
                font: self.font.clone(),
                is_fill: self.is_fill,
                url: self.url.clone(),
                uid: self.uid,
            }
        }
    }

    pub fn break_lines(&self, font_dict: &FontDict) -> Vec<Element> {
        if self.text_width.get_fixed_unchecked() <= self.width.get_fixed_unchecked() {
            return vec![self.clone()];
        }

        let mut lines: Vec<Element> = vec![];

        // todo: I'm sure this implementation is pretty buggy. Note to future me, fix
        // this.
        let words = self.item.split_whitespace().collect::<Vec<&str>>();
        let mut line = String::new();
        for word in words {
            let candidate_line = line.clone() + " " + word;
            let candidate_width: f32 = self.font.get_width(&candidate_line, font_dict);

            if candidate_width > self.width.get_fixed_unchecked() {
                line.pop();
                let line_width = self.font.get_width(&line, font_dict);
                lines.push(
                    self.with_item(line)
                        .with_text_width(Width::Absolute(line_width)),
                );
                line = String::new();
            }

            line.push_str(word);
            line.push(' ');
        }

        line.pop();
        if !line.is_empty() {
            let line_width = self.font.get_width(&line, font_dict);
            lines.push(
                self.with_item(line)
                    .with_text_width(Width::Absolute(line_width)),
            );
        }

        lines
    }

    pub fn bound_width(&self, width: f32) -> Element {
        if self.width.is_fixed() {
            Element {
                item: self.item.clone(),
                margin: self.margin,
                alignment: self.alignment,
                width: Width::Absolute(f32::min(self.width.get_fixed_unchecked(), width)),
                text_width: self.text_width,
                font: self.font.clone(),
                is_fill: false,
                url: self.url.clone(),
                uid: self.uid,
            }
        } else {
            Element {
                item: self.item.clone(),
                margin: self.margin,
                alignment: self.alignment,
                width: Width::Absolute(width),
                text_width: self.text_width,
                font: self.font.clone(),
                is_fill: true,
                url: self.url.clone(),
                uid: self.uid,
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_break_lines() {
        let mut font_dict = FontDict::new();
        let font_data = include_bytes!("../assets/Exo/static/Exo-Medium.ttf");
        // This only succeeds if collection consists of one font
        let _font =
            rusttype::Font::try_from_bytes(font_data as &[u8]).expect("Error constructing Font");
        font_dict.insert("Arial".to_string(), _font);

        let element = Element {
            item: "hello world".to_string(),
            margin: Margin::default(),
            alignment: Alignment::default(),
            width: Width::Absolute(100.0),
            text_width: Width::default(),
            font: Font::default(),
            is_fill: false,
            url: None,
            uid: Uuid::new_v4(),
        };

        let element = element.fill_fonts(&font_dict);

        let lines = element.break_lines(&font_dict);
        assert_eq!(lines.len(), 1);
        assert_eq!(lines[0].item, "hello world");

        let element = Element {
            item: "hello world".to_string(),
            margin: Margin::default(),
            alignment: Alignment::default(),
            width: Width::Absolute(22.0),
            text_width: Width::default(),
            font: Font::default(),
            is_fill: false,
            url: None,
            uid: Uuid::new_v4(),
        };

        let element = element.fill_fonts(&font_dict);

        let lines = element.break_lines(&font_dict);
        assert_eq!(lines.len(), 2);
        assert_eq!(lines[0].item, "hello");
        assert_eq!(lines[1].item, "world");
    }
}
