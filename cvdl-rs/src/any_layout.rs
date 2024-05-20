use std::io::{Error, ErrorKind};

use crate::{
    data_schema::DataSchema,
    element::Element,
    font::{FontDict, FontLoader},
    layout_schema::LayoutSchema,
    resume_data::ResumeData,
    resume_layout::{ColumnType, ResumeLayout},
    spatial_box::SpatialBox,
};

pub struct AnyLayout;

#[derive(Debug, Clone)]
pub struct ElementBox {
    pub bounding_box: SpatialBox,
    pub elements: Vec<(SpatialBox, Element)>,
}

impl ElementBox {
    pub fn move_y_by(&mut self, y: f32) -> &mut ElementBox {
        self.bounding_box = self.bounding_box.move_y_by(y);
        self.elements = self
            .elements
            .iter_mut()
            .map(|(b, e)| (b.move_y_by(y), e.clone()))
            .collect::<Vec<_>>();
        self
    }

    pub fn move_x_by(&mut self, x: f32) -> &mut ElementBox {
        self.bounding_box = self.bounding_box.move_x_by(x);
        self.elements = self
            .elements
            .iter_mut()
            .map(|(b, e)| (b.move_x_by(x), e.clone()))
            .collect::<Vec<_>>();
        self
    }
}

impl ElementBox {
    pub fn new(bounding_box: SpatialBox, elements: Vec<(SpatialBox, Element)>) -> ElementBox {
        ElementBox {
            bounding_box,
            elements,
        }
    }
}

impl AnyLayout {
    pub fn render(
        layout_schemas: &[LayoutSchema],
        resume_data: &ResumeData,
        data_schemas: &[DataSchema],
        resume_layout: &ResumeLayout,
    ) -> std::io::Result<(FontDict, Vec<Vec<ElementBox>>)> {
        // Font dictionary is used for font caching
        let mut font_dict: FontDict = FontDict::new();
        // Each box contains a set of elements(positioned by 0x0 and projected into its bounding box)
        let mut boxes: Vec<ElementBox> = Vec::new();

        // Compute the total usable width by subtracting the margins from the document width
        let width = resume_layout.width - (resume_layout.margin.left + resume_layout.margin.right);

        // If the resume is double column, then the usable width is halved
        let column_width = match resume_layout.column_type {
            ColumnType::SingleColumn => width,
            ColumnType::DoubleColumn { vertical_margin } => (width - vertical_margin) / 2.0,
        };

        for section in &resume_data.sections {
            // Render Section Header
            // 1. Find the layout schema for the section
            log::info!("Computing section: {}", section.section_name);

            let Some(layout_schema) = layout_schemas
                    .iter()
                    .find(|&s| s.schema_name == section.layout_schema)
                else {
                    return Err(Error::new(ErrorKind::Other, format!("SectionLayout not found for {}", section.layout_schema)));
                };

            font_dict.load_fonts_from_schema(layout_schema);

            // 2. Find the data schema for the section
            let _data_schema = data_schemas
                .iter()
                .find(|&s| s.schema_name == section.data_schema)
                .unwrap();
            // 3. Render the header

            let result = layout_schema
                .header_layout_schema
                .instantiate(&section.data)
                .normalize(column_width, &font_dict)
                .compute_boxes(&font_dict);

            boxes.push(result);

            // Render Section Items
            for (index, item) in section.items.iter().enumerate() {
                log::info!("Computing item {index}");
                // 1. Find the layout schema for the section
                let layout_schema = layout_schemas
                    .iter()
                    .find(|&s| s.schema_name == section.layout_schema)
                    .unwrap();

                font_dict.load_fonts_from_schema(layout_schema);

                // 2. Find the data schema for the section
                let _data_schema = data_schemas
                    .iter()
                    .find(|&s| s.schema_name == section.data_schema)
                    .unwrap();
                // 3. Render the item
                let result = layout_schema
                    .item_layout_schema
                    .instantiate(item)
                    .normalize(column_width, &font_dict)
                    .compute_boxes(&font_dict);

                boxes.push(result);
            }
        }

        let mut current_y = resume_layout.margin.top;
        let mut current_x = resume_layout.margin.left;

        let mut pages: Vec<Vec<ElementBox>> = Vec::new();
        pages.push(Vec::new());

        boxes.iter_mut().for_each(|b| {
            if current_y + b.bounding_box.height() > resume_layout.height {
                current_y = resume_layout.margin.top;
                current_x += column_width + resume_layout.column_type.vertical_margin();
                if current_x > width {
                    pages.push(Vec::new());
                    current_x = resume_layout.margin.left;
                }
            }
            pages
                .last_mut()
                .unwrap()
                .push(b.move_y_by(current_y).move_x_by(current_x).clone());
            current_y += b.bounding_box.height();
        });

        log::info!("Position calculations are completed.");

        Ok((font_dict, pages))
    }
}
