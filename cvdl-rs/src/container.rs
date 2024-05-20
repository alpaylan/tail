use std::{collections::HashMap, fmt::Display};

use serde::{Deserialize, Serialize};

use crate::{
    alignment::Alignment,
    font::{Font, FontDict},
    layout::SectionLayout,
    margin::Margin,
    resume_data::ItemContent,
    width::Width,
};

use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Container {
    #[serde(skip)]
    #[serde(default = "Uuid::new_v4")]
    pub uid: uuid::Uuid,
    pub elements: Vec<SectionLayout>,
    #[serde(default = "Margin::default")]
    pub margin: Margin,
    #[serde(default = "Alignment::default")]
    pub alignment: Alignment,
    #[serde(default = "Width::default")]
    pub width: Width,
}

impl Display for Container {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut s = String::new();
        for element in &self.elements {
            s.push_str(&format!("{}\n", element));
        }
        write!(f, "{}", s)
    }
}
impl Container {
    pub fn empty_container() -> Container {
        Container {
            uid: Uuid::new_v4(),
            elements: vec![],
            margin: Margin::default(),
            alignment: Alignment::default(),
            width: Width::default(),
        }
    }

    pub fn fonts(&self) -> Vec<Font> {
        self.elements.iter().flat_map(|e| e.fonts()).collect()
    }

    pub fn with_elements(&self, elements: Vec<SectionLayout>) -> Container {
        Container {
            uid: self.uid,
            elements,
            margin: self.margin,
            alignment: self.alignment,
            width: self.width,
        }
    }
    pub fn with_margin(&self, margin: Margin) -> Container {
        Container {
            uid: self.uid,
            elements: self.elements.clone(),
            margin,
            alignment: self.alignment,
            width: self.width,
        }
    }

    pub fn with_alignment(&self, alignment: Alignment) -> Container {
        Container {
            uid: self.uid,
            elements: self.elements.clone(),
            margin: self.margin,
            alignment,
            width: self.width,
        }
    }

    pub fn with_width(&self, width: Width) -> Container {
        Container {
            uid: self.uid,
            elements: self.elements.clone(),
            margin: self.margin,
            alignment: self.alignment,
            width,
        }
    }

    pub fn instantiate(&self, section: &HashMap<String, ItemContent>) -> Container {
        Container {
            uid: self.uid,
            elements: self
                .elements
                .iter()
                .map(|e| e.instantiate(section))
                .collect(),
            margin: self.margin,
            alignment: self.alignment,
            width: self.width,
        }
    }

    pub fn bound_width(&self, width: f32) -> Container {
        let bound = match self.width {
            Width::Absolute(w) => f32::min(w, width),
            Width::Percentage(_) => unreachable!(
                "SectionLayout::bound_width: Cannot bounded width for non-unitized widths!"
            ),
            Width::Fill => width,
        };

        Container {
            uid: self.uid,
            elements: self.elements.iter().map(|e| e.bound_width(bound)).collect(),
            margin: self.margin,
            alignment: self.alignment,
            width: Width::Absolute(bound),
        }
    }

    pub fn scale_width(&self, w: f32) -> Container {
        Container {
            uid: self.uid,
            elements: self.elements.iter().map(|e| e.scale_width(w)).collect(),
            margin: self.margin,
            alignment: self.alignment,
            width: self.width.scale(w),
        }
    }

    pub fn fill_fonts(&self, fonts: &FontDict) -> Container {
        Container {
            uid: self.uid,
            elements: self.elements.iter().map(|e| e.fill_fonts(fonts)).collect(),
            margin: self.margin,
            alignment: self.alignment,
            width: self.width,
        }
    }

    pub fn break_lines(&self, font_dict: &FontDict) -> Vec<Container> {
        let mut lines: Vec<Container> = vec![];
        let mut current_line: Vec<SectionLayout> = vec![];
        let mut current_width = 0.0;
        let elements: Vec<SectionLayout> = self
            .elements
            .iter()
            .map(|e| e.break_lines(font_dict))
            .collect();

        for element in elements {
            let element_width = element.width().get_fixed_unchecked();
            if current_width + element_width > self.width.get_fixed().unwrap() {
                lines.push(self.with_elements(current_line));
                current_line = vec![];
                current_width = 0.0;
            }
            current_line.push(element.clone());
            current_width += element_width;
        }

        if !current_line.is_empty() {
            lines.push(self.with_elements(current_line));
        }

        lines
    }

    pub fn elements_width(&self) -> f32 {
        self.elements
            .iter()
            .map(|e| e.width().get_fixed_unchecked())
            .sum()
    }
}
