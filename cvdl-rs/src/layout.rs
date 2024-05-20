use std::collections::HashMap;
use std::fmt::Display;

use serde::{Deserialize, Serialize};

use crate::{
    alignment::Alignment,
    any_layout::ElementBox,
    basic_layout::BasicLayout,
    container::Container,
    element::Element,
    font::{Font, FontDict},
    margin::Margin,
    point::Point,
    resume_data::ItemContent,
    spatial_box::SpatialBox,
    width::Width,
};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum SectionLayout {
    Stack(Container),
    FrozenRow(Container),
    FlexRow(Container),
    Text(Element),
    Ref(Element),
}

// todo: use this
impl From<SectionLayout> for BasicLayout {
    fn from(value: SectionLayout) -> Self {
        match value {
            SectionLayout::Stack(_container) => todo!(),
            SectionLayout::FrozenRow(_) => unreachable!("FrozenRow should be converted to FlexRow"),
            SectionLayout::FlexRow(_container) => todo!(),
            SectionLayout::Text(_element) => todo!(),
            SectionLayout::Ref(_) => unreachable!("Ref should be converted to Text"),
        }
    }
}

impl Display for SectionLayout {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SectionLayout::Stack(container) => write!(f, "{}", container),
            SectionLayout::FrozenRow(container) => write!(f, "{}", container),
            SectionLayout::FlexRow(container) => write!(f, "{}", container),
            SectionLayout::Text(element) => write!(f, "{}", element),
            SectionLayout::Ref(element) => write!(f, "{}", element),
        }
    }
}

impl SectionLayout {
    pub fn new_stack(container: Container) -> SectionLayout {
        log::debug!("Creating new stack: {}", container.uid);
        SectionLayout::Stack(container)
    }

    pub fn new_frozen_row(container: Container) -> SectionLayout {
        log::debug!("Creating new frozen row: {}", container.uid);
        SectionLayout::FrozenRow(container)
    }

    pub fn new_flex_row(container: Container) -> SectionLayout {
        log::debug!("Creating new flex row: {}", container.uid);
        SectionLayout::FlexRow(container)
    }

    pub fn new_text(element: Element) -> SectionLayout {
        log::debug!("Creating new text element: {}", element.uid);
        SectionLayout::Text(element)
    }

    pub fn new_ref(element: Element) -> SectionLayout {
        log::debug!("Creating new ref element: {}", element.uid);
        SectionLayout::Ref(element)
    }
}

impl SectionLayout {
    #[allow(dead_code)]
    pub fn type_(&self) -> String {
        match self {
            SectionLayout::Stack(_) => "stack".to_string(),
            SectionLayout::FrozenRow(_) => "frozen_row".to_string(),
            SectionLayout::FlexRow(_) => "flex_row".to_string(),
            SectionLayout::Text(_) => "text".to_string(),
            SectionLayout::Ref(_) => "ref".to_string(),
        }
    }

    pub fn width(&self) -> Width {
        match self {
            SectionLayout::Stack(container)
            | SectionLayout::FrozenRow(container)
            | SectionLayout::FlexRow(container) => container.width,
            SectionLayout::Text(element) | SectionLayout::Ref(element) => element.width,
        }
    }
    #[allow(dead_code)]
    pub fn margin(&self) -> Margin {
        match self {
            SectionLayout::Stack(container)
            | SectionLayout::FrozenRow(container)
            | SectionLayout::FlexRow(container) => container.margin,
            SectionLayout::Text(element) | SectionLayout::Ref(element) => element.margin,
        }
    }
    #[allow(dead_code)]
    pub fn alignment(&self) -> Alignment {
        match self {
            SectionLayout::Stack(container)
            | SectionLayout::FrozenRow(container)
            | SectionLayout::FlexRow(container) => container.alignment,
            SectionLayout::Text(element) | SectionLayout::Ref(element) => element.alignment,
        }
    }

    pub fn fonts(&self) -> Vec<Font> {
        match self {
            SectionLayout::Stack(container)
            | SectionLayout::FrozenRow(container)
            | SectionLayout::FlexRow(container) => container.fonts(),
            SectionLayout::Text(element) | SectionLayout::Ref(element) => {
                vec![element.font.clone()]
            }
        }
    }
    #[allow(dead_code)]
    pub fn with_margin(&self, margin: Margin) -> SectionLayout {
        match self {
            SectionLayout::Stack(container) => {
                SectionLayout::new_stack(container.with_margin(margin))
            }
            SectionLayout::FrozenRow(container) => {
                SectionLayout::new_frozen_row(container.with_margin(margin))
            }
            SectionLayout::FlexRow(container) => {
                SectionLayout::new_flex_row(container.with_margin(margin))
            }
            SectionLayout::Text(element) => SectionLayout::new_text(element.with_margin(margin)),
            SectionLayout::Ref(element) => SectionLayout::new_ref(element.with_margin(margin)),
        }
    }
    #[allow(dead_code)]
    pub fn with_alignment(&self, alignment: Alignment) -> SectionLayout {
        match self {
            SectionLayout::Stack(container) => {
                SectionLayout::new_stack(container.with_alignment(alignment))
            }
            SectionLayout::FrozenRow(container) => {
                SectionLayout::new_frozen_row(container.with_alignment(alignment))
            }
            SectionLayout::FlexRow(container) => {
                SectionLayout::new_flex_row(container.with_alignment(alignment))
            }
            SectionLayout::Text(element) => {
                SectionLayout::new_text(element.with_alignment(alignment))
            }
            SectionLayout::Ref(element) => {
                SectionLayout::new_ref(element.with_alignment(alignment))
            }
        }
    }

    pub fn is_instantiated(&self) -> bool {
        log::debug!("Checking if {} is instantiated...", self);
        match self {
            SectionLayout::Stack(c) | SectionLayout::FrozenRow(c) | SectionLayout::FlexRow(c) => {
                c.elements.iter().all(|e| e.is_instantiated())
            }
            SectionLayout::Text(_) => true,
            SectionLayout::Ref(_) => false,
        }
    }

    pub fn instantiate(&self, section: &HashMap<String, ItemContent>) -> SectionLayout {
        match self {
            SectionLayout::Stack(c) => SectionLayout::new_stack(c.instantiate(section)),
            SectionLayout::FrozenRow(c) => SectionLayout::new_frozen_row(c.instantiate(section)),
            SectionLayout::FlexRow(c) => SectionLayout::new_flex_row(c.instantiate(section)),
            SectionLayout::Text(e) => SectionLayout::new_text(e.clone()),
            SectionLayout::Ref(e) => SectionLayout::instantiate_ref_element(e.clone(), section),
        }
    }

    pub fn instantiate_ref_element(
        element: Element,
        section: &HashMap<String, ItemContent>,
    ) -> SectionLayout {
        if let Some(text) = section.get(&element.item) {
            let mut element = element.with_item(text.to_string());

            if let ItemContent::Url { url, text: _ } = text {
                element = element.with_url(url.clone())
            }

            SectionLayout::Text(element)
        } else {
            SectionLayout::Stack(Container::empty_container())
        }
    }

    pub fn bound_width(&self, width: f32) -> SectionLayout {
        let bound = match self.width() {
            Width::Absolute(w) => f32::min(w, width),
            Width::Percentage(_) => unreachable!(
                "SectionLayout::bound_width: Cannot bounded width for non-unitized widths!"
            ),
            Width::Fill => width,
        };

        match self {
            SectionLayout::Stack(c) => SectionLayout::new_stack(c.bound_width(bound)),
            SectionLayout::FrozenRow(c) => SectionLayout::new_frozen_row(c.bound_width(bound)),
            SectionLayout::FlexRow(c) => SectionLayout::new_flex_row(c.bound_width(bound)),
            SectionLayout::Text(e) => SectionLayout::new_text(e.bound_width(bound)),
            SectionLayout::Ref(_) => {
                unreachable!("Cannot propagate widths of uninstantiated layout")
            }
        }
    }

    pub fn scale_width(&self, document_width: f32) -> SectionLayout {
        match self {
            SectionLayout::Stack(c) => SectionLayout::new_stack(c.scale_width(document_width)),
            SectionLayout::FrozenRow(c) => {
                SectionLayout::new_frozen_row(c.scale_width(document_width))
            }
            SectionLayout::FlexRow(c) => SectionLayout::new_flex_row(c.scale_width(document_width)),
            SectionLayout::Text(e) => SectionLayout::new_text(e.scale_width(document_width)),
            SectionLayout::Ref(_) => unreachable!("Cannot scale width of uninstantiated layout"),
        }
    }

    pub fn normalize(&self, width: f32, font_dict: &FontDict) -> SectionLayout {
        log::debug!(
            "Normalizing document, checking if {} is instantiated...",
            self
        );

        if !self.is_instantiated() {
            log::error!("Document is not instantiated {}", self);
            panic!("Cannot normalize uninstantiated layout");
        };

        log::debug!("Document is instantiated. Scaling widths...");

        let scaled_layout = self.scale_width(width);

        log::debug!("Widths are scaled. Bounding widths...");

        let bounded_layout = scaled_layout.bound_width(width);

        log::debug!("Widths are bounded. Filling fonts...");

        let font_filled_layout = bounded_layout.fill_fonts(font_dict);

        log::debug!("Fonts filled. Breaking lines...");

        let broken_layout = font_filled_layout.break_lines(font_dict);

        log::debug!("Lines broken.");

        broken_layout
    }

    pub fn fill_fonts(&self, font_dict: &FontDict) -> SectionLayout {
        match self {
            SectionLayout::Stack(c) => SectionLayout::new_stack(c.fill_fonts(font_dict)),
            SectionLayout::FrozenRow(c) => SectionLayout::new_frozen_row(c.fill_fonts(font_dict)),
            SectionLayout::FlexRow(c) => SectionLayout::new_flex_row(c.fill_fonts(font_dict)),
            SectionLayout::Text(e) => SectionLayout::new_text(e.fill_fonts(font_dict)),
            SectionLayout::Ref(_) => unreachable!("Cannot fill fonts of uninstantiated layout"),
        }
    }

    pub fn break_lines(&self, font_dict: &FontDict) -> SectionLayout {
        match self {
            SectionLayout::Stack(c) => {
                let new_stack = SectionLayout::new_stack(
                    c.with_elements(
                        c.elements
                            .iter()
                            .map(|e| e.break_lines(font_dict))
                            .collect(),
                    ),
                );
                new_stack
            }
            SectionLayout::FrozenRow(c) => {
                let total_width = c
                    .elements
                    .iter()
                    .map(|e| e.width().get_fixed_unchecked())
                    .sum::<f32>();
                if total_width > self.width().get_fixed_unchecked() {
                    panic!(
                        "Cannot break lines of frozen row with width {:?} and total width {}",
                        self.width(),
                        total_width
                    );
                } else {
                    SectionLayout::new_flex_row(Container {
                        uid: c.uid,
                        elements: c
                            .elements
                            .iter()
                            .map(|e| e.break_lines(font_dict))
                            .collect(),
                        margin: c.margin,
                        alignment: c.alignment,
                        width: c.width,
                    })
                }
            }
            SectionLayout::FlexRow(c) => {
                let lines: Vec<Container> = c.break_lines(font_dict);
                SectionLayout::new_stack(
                    c.with_elements(lines.into_iter().map(SectionLayout::FlexRow).collect()),
                )
            }
            SectionLayout::Text(e) => {
                let lines: Vec<Element> = e.break_lines(font_dict);
                SectionLayout::new_stack(
                    Container::empty_container()
                        .with_elements(lines.into_iter().map(SectionLayout::new_text).collect())
                        .with_alignment(e.alignment)
                        .with_margin(e.margin)
                        .with_width(e.width),
                )
            }
            SectionLayout::Ref(_) => unreachable!("Cannot break lines of uninstantiated layout"),
        }
    }
}

impl SectionLayout {
    pub fn compute_boxes(&self, font_dict: &FontDict) -> ElementBox {
        let mut textbox_positions: Vec<(SpatialBox, Element)> = Vec::new();
        let top_left: Point = Point::new(0.0, 0.0);
        let depth = self.compute_textbox_positions(&mut textbox_positions, top_left, font_dict);

        let bounding_box = SpatialBox::new(
            Point::new(0.0, 0.0),
            Point::new(self.width().get_fixed_unchecked(), depth),
        );
        ElementBox::new(bounding_box, textbox_positions)
    }

    fn compute_textbox_positions(
        &self,
        textbox_positions: &mut Vec<(SpatialBox, Element)>,
        top_left: Point,
        font_dict: &FontDict,
    ) -> f32 {
        match self {
            SectionLayout::Stack(c) => {
                let mut top_left = top_left;
                let mut depth = top_left.y;
                for element in c.elements.iter() {
                    depth =
                        element.compute_textbox_positions(textbox_positions, top_left, font_dict);
                    top_left = top_left.move_y_to(depth);
                }
                depth
            }
            SectionLayout::FlexRow(c) => {
                let (top_left, per_elem_space) = match c.alignment {
                    Alignment::Left => (top_left, 0.0),
                    Alignment::Center => (
                        top_left
                            .move_x_by((c.width.get_fixed_unchecked() - c.elements_width()) / 2.0),
                        0.0,
                    ),
                    Alignment::Right => (
                        top_left.move_x_by(c.width.get_fixed_unchecked() - c.elements_width()),
                        0.0,
                    ),
                    Alignment::Justified => (
                        top_left,
                        (c.width.get_fixed_unchecked() - c.elements_width())
                            / (c.elements.len() - 1) as f32,
                    ),
                };

                let mut top_left = top_left;
                let mut depth = top_left.y;

                for element in c.elements.iter() {
                    depth =
                        element.compute_textbox_positions(textbox_positions, top_left, font_dict);
                    top_left =
                        top_left.move_x_by(element.width().get_fixed_unchecked() + per_elem_space);
                }
                depth
            }
            SectionLayout::FrozenRow(_) => {
                unreachable!("Cannot compute textbox positions of frozen row: {:?}", self)
            }
            SectionLayout::Text(e) => {
                let width = e.text_width.get_fixed_unchecked();
                let height = e.font.get_height(font_dict);
                let textbox =
                    SpatialBox::new(top_left, top_left.move_x_by(width).move_y_by(height));
                textbox_positions.push((textbox, e.clone()));

                top_left.y + height
            }
            SectionLayout::Ref(_) => {
                todo!("Should not be able to compute textbox positions of uninstantiated layout")
            }
        }
    }
}
