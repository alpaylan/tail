use std::path::Path;

use image::{DynamicImage, Rgba, Pixel};
use rusttype::{point, Scale};

use crate::{
    any_layout::AnyLayout, data_schema::DataSchema, font::Font, layout_schema::LayoutSchema,
    local_storage::LocalStorage, resume_data::ResumeData,
};

pub struct PngLayout;

impl PngLayout {
    pub fn render(
        local_storage: LocalStorage,
        resume_data: ResumeData,
    ) -> Vec<image::ImageBuffer<Rgba<u8>, Vec<u8>>> {
        let mut images: Vec<image::ImageBuffer<Rgba<u8>, Vec<u8>>> = Vec::new();
        let data_schemas = &resume_data
            .data_schemas()
            .iter()
            .map(|schema| local_storage.load_data_schema(schema))
            .collect::<Vec<DataSchema>>();

        let layout_schemas = &resume_data
            .layout_schemas()
            .iter()
            .map(|schema| local_storage.load_layout_schema(schema))
            .collect::<Vec<LayoutSchema>>();

        let resume_layout = local_storage.load_resume_layout(resume_data.layout.as_str());

        let (font_dict, pages) =
            AnyLayout::render(&layout_schemas, &resume_data, &data_schemas, &resume_layout)
                .unwrap();

        for (index, page) in pages.iter().enumerate() {
            let width = resume_layout.width as u32;
            let height = resume_layout.height as u32;
            let mut image =
                DynamicImage::new_rgba8(width, height)
                    .to_rgba8();

            for element_box in page {
                for element in &element_box.elements {
                    let text = &element.1.item;
                    let font = &element.1.font;
                    let scale = Scale::uniform(font.size);
                    let font = &font_dict
                        .get(&font.full_name())
                        .unwrap_or_else(|| font_dict.get(&Font::default().full_name()).unwrap())
                        .rusttype_font;
                    let v_metrics = font.v_metrics(scale);

                    // layout the glyphs in a line with 20 pixels padding
                    let glyphs: Vec<_> = font
                        .layout(text, scale, point(0.0, v_metrics.ascent))
                        .collect();

                    for glyph in glyphs {
                        if let Some(bounding_box) = glyph.pixel_bounding_box() {
                            // Draw the glyph into the image per-pixel by using the draw closure
                            glyph.draw(|x, y, v| {
                                if (((element.0.top_left.x as u32) + x + (bounding_box.min.x.max(0) as u32)) < width)
                                && (((element.0.top_left.y as u32) + y + (bounding_box.min.y.max(0) as u32)) < height) {
                                    image.put_pixel(
                                        // Offset the position by the glyph bounding box
                                        element.0.top_left.x as u32 + x + bounding_box.min.x.max(0) as u32,
                                        element.0.top_left.y as u32 + y + bounding_box.min.y.max(0) as u32,
                                        // Turn the coverage into an alpha value
                                        Rgba([0, 0, 0, (v * 255.0) as u8]),
                                    )
                                }
                            });
                        }
                    }
                }
            }

            images.push(image);
        }

        images
    }

    pub fn render_and_save(
        local_storage: LocalStorage,
        resume_data: ResumeData,
        _filepath: &Path,
        _debug: bool,
    ) -> std::io::Result<()> {
        let pages = PngLayout::render(local_storage, resume_data);

        for (index, image) in pages.iter().enumerate() {
            image.save(format!("output_{}.png", index)).unwrap();
            println!("{}", format!("Generated: output_{}.png", index));
        }

        Ok(())
    }

    pub fn render_and_pixelize(
        local_storage: LocalStorage,
        resume_data: ResumeData,
    ) -> Vec<Vec<[u8; 4]>> {
        let pages = PngLayout::render(local_storage, resume_data);
        let mut pixels: Vec<Vec<[u8; 4]>> = Vec::new();
        for image in pages {
            pixels.push(image.pixels().map(|p| p.to_owned().0).collect());
        }

        pixels
    }

}
