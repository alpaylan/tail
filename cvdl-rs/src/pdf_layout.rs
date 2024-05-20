use std::{collections::HashMap, fs, io::BufWriter, path::Path};

use printpdf::{Color, IndirectFontRef, Line, LinkAnnotation, Mm, PdfDocument, Rect, Rgb};

use crate::{
    any_layout::{AnyLayout, ElementBox},
    data_schema::DataSchema,
    font::{Font, FontLoadSource},
    layout_schema::LayoutSchema,
    local_storage::{self, LocalStorage},
    resume_data::ResumeData,
};

pub struct PdfLayout;

impl PdfLayout {
    pub fn render(
        local_storage: LocalStorage,
        resume_data: ResumeData,
        filepath: &Path,
        debug: bool,
    ) -> std::io::Result<()> {
        let data_schemas = resume_data
            .data_schemas()
            .iter()
            .map(|schema| local_storage.load_data_schema(schema))
            .collect::<Vec<DataSchema>>();

        let layout_schemas = resume_data
            .layout_schemas()
            .iter()
            .map(|schema| local_storage.load_layout_schema(schema))
            .collect::<Vec<LayoutSchema>>();

        let resume_layout = local_storage.load_resume_layout(resume_data.layout.as_str());

        let (doc, page1, layer1) = PdfDocument::new(
            "PDF_Document_title",
            Mm(resume_layout.width as f64),
            Mm(resume_layout.height as f64),
            "Layer 1",
        );

        let (mut font_dict, pages) =
            AnyLayout::render(&layout_schemas, &resume_data, &data_schemas, &resume_layout)
                .unwrap();

        let _current_layer = doc.get_page(page1).get_layer(layer1);

        log::info!("Constructing printpdf font dictionary...");

        let printpdf_font_dict: HashMap<String, IndirectFontRef> = font_dict
            .iter_mut()
            .map(|(k, v)| {
                let pdf_font = match &v.source {
                    FontLoadSource::Local(path) => {
                        log::info!("Loading {} from {}", k, path);
                        doc.add_external_font(fs::File::open(path).unwrap())
                            .unwrap()
                    }
                    FontLoadSource::System(font) => {
                        let font_stream = font.copy_font_data().unwrap();
                        doc.add_external_font(font_stream.as_slice()).unwrap()
                    }
                };

                (k.clone(), pdf_font)
            })
            .collect();

        log::info!("Rendering the document...");
        // Render the boxes
        for (index, boxes) in pages.iter().enumerate() {
            let (curr_page, curr_layer) = if index == 0 {
                (page1, layer1)
            } else {
                let (page, layer) = doc.add_page(
                    Mm(resume_layout.width as f64),
                    Mm(resume_layout.height as f64),
                    format!("Page {}", index + 1),
                );
                (page, layer)
            };

            for element_box in boxes {
                let ElementBox {
                    bounding_box: _bounding_box,
                    elements,
                } = element_box;
                for (box_, element) in elements {
                    log::debug!(
                        "({}, {})({}, {}): {}",
                        box_.top_left.x,
                        box_.top_left.y,
                        box_.bottom_right.x,
                        box_.bottom_right.y,
                        element.item.clone()
                    );
                    let current_layer = doc.get_page(curr_page).get_layer(curr_layer);
                    if debug {
                        let points: Vec<(printpdf::Point, bool)> = vec![
                            (
                                printpdf::Point::new(
                                    Mm(box_.top_left.x.into()),
                                    Mm((resume_layout.height - box_.top_left.y).into()),
                                ),
                                false,
                            ),
                            (
                                printpdf::Point::new(
                                    Mm(box_.bottom_right.x.into()),
                                    Mm((resume_layout.height - box_.top_left.y).into()),
                                ),
                                false,
                            ),
                            (
                                printpdf::Point::new(
                                    Mm(box_.bottom_right.x.into()),
                                    Mm((resume_layout.height - box_.bottom_right.y).into()),
                                ),
                                false,
                            ),
                            (
                                printpdf::Point::new(
                                    Mm(box_.top_left.x.into()),
                                    Mm((resume_layout.height - box_.bottom_right.y).into()),
                                ),
                                false,
                            ),
                        ];
                        let line1 = Line {
                            points,
                            is_closed: true,
                            has_fill: false,
                            has_stroke: true,
                            is_clipping_path: false,
                        };
                        let outline_color = Color::Rgb(Rgb::new(0.4, 0.6, 0.2, None));
                        current_layer.set_outline_color(outline_color);
                        current_layer.add_shape(line1);
                    };

                    current_layer.use_text(
                        element.item.clone(),
                        (element.font.size * 2.0) as f64,
                        Mm(box_.top_left.x.into()),
                        Mm((resume_layout.height
                            - (box_.top_left.y + element.font.get_height(&font_dict)))
                        .into()),
                        printpdf_font_dict
                            .get(&element.font.full_name())
                            .unwrap_or_else(|| {
                                printpdf_font_dict
                                    .get(&Font::default().full_name())
                                    .unwrap()
                            }),
                    );

                    if let Some(url) = &element.url {
                        let rect = Rect::new(
                            Mm(box_.top_left.x.into()),
                            Mm((resume_layout.height - box_.bottom_right.y).into()),
                            Mm(box_.bottom_right.x.into()),
                            Mm((resume_layout.height - box_.top_left.y).into()),
                        );
                        current_layer.add_link_annotation(LinkAnnotation::new(
                            rect,
                            Some(printpdf::BorderArray::default()),
                            Some(printpdf::ColorArray::default()),
                            printpdf::Actions::uri(url.clone()),
                            Some(printpdf::HighlightingMode::Invert),
                        ));
                    }
                }
            }
        }

        log::info!("Rendering is completed. Saving the document...");

        doc.save(&mut BufWriter::new(fs::File::create(filepath).unwrap()))
            .unwrap();

        log::info!("Document is saved to {}", filepath.to_str().unwrap());

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use crate::{data_schema, font::FontDict, layout_schema, resume_data};

    use super::*;

    #[test]
    fn test_compute_blueprint() {
        let schema = fs::read_to_string("data/data-schemas.json").unwrap();
        let data_schemas = data_schema::DataSchema::from_json(&schema);

        let resume = fs::read_to_string("data/resume2.json").unwrap();
        let resume_data = resume_data::ResumeData::from_json(&resume);

        let schema = fs::read_to_string("data/layout-schemas.json").unwrap();
        let layout_schemas = layout_schema::LayoutSchema::from_json(&schema);

        let resume_layout = resume_layout::ResumeLayout::from_json(
            &fs::read_to_string("data/resume-layout.json").unwrap(),
        );

        let mut font_dict = FontDict::new();

        PdfLayout::render(
            layout_schemas,
            resume_data,
            data_schemas,
            resume_layout,
            Path::new("results/output.pdf"),
            true,
        )
        .unwrap();
    }
}
