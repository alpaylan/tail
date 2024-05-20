use serde::{Deserialize, Serialize};

use crate::{font::Font, layout::SectionLayout};

pub trait Named {
    fn name(&self) -> &str;
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LayoutSchema {
    pub schema_name: String,
    pub header_layout_schema: SectionLayout,
    pub item_layout_schema: SectionLayout,
}

impl Named for LayoutSchema {
    fn name(&self) -> &str {
        &self.schema_name
    }
}

impl LayoutSchema {
    pub fn from_json(json: &str) -> Vec<LayoutSchema> {
        let schema: Vec<LayoutSchema> = serde_json::from_str(json).unwrap();
        schema
    }

    pub fn fonts(&self) -> Vec<Font> {
        [
            self.item_layout_schema.fonts(),
            self.header_layout_schema.fonts(),
        ]
        .concat()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use expect_test::expect;

    #[test]
    fn test_header_from_json() {
        let json = r#"{
            "Ref": {
                "item": "Title",
                "width": "70.0%"
            }
        }
        "#;
        let layout: SectionLayout = serde_json::from_str(json).unwrap();

        let actual = format!("{}", layout);
        let expected = expect![[r#"Ref(
    Element {
        item: "Title",
        margin: Margin {
            top: 0.0,
            bottom: 0.0,
            left: 0.0,
            right: 0.0,
        },
        alignment: Left,
        width: Percentage(
            70.0,
        ),
        text_width: Fill,
        font: Font {
            name: "Arial",
            size: 12.0,
        },
        is_fill: false,
        url: None,
    },
)
"#]];
        expected.assert_debug_eq(&actual);
    }

    #[test]
    fn test_from_json() {
        let json = r#"{
            "Stack": {
                "elements":  [
                    {
                        "FrozenRow": {
                            "elements": [
                                {
                                    "Ref": {
                                        "item": "Date-Started"
                                    }
                                },
                                {
                                    "Text": {
                                        "item": "-"
                                    }
                                },
                                {
                                    "Ref": {
                                        "item": "Date-Finished"
                                    }
                                }
                            ],
                            "width": "30.0%"
                        }
                    },
                    {
                        "Ref": {
                            "item": "Position",
                            "width": "70.0%"
                        }
                    },
                    {
                        "Ref": {
                            "item": "Text",
                            "width": "70.0%"
                        }
                    },
                    {
                        "Ref": {
                            "item": "Skills",
                            "width": "70.0%"
                        }
                    }
                ]
            }
        }
    "#;
        let layout: SectionLayout = serde_json::from_str(json).unwrap();
        let actual = layout;
        let expected = expect![[r#"Stack(
    Container {
        elements: [
            FrozenRow(
                Container {
                    elements: [
                        Ref(
                            Element {
                                item: "Date-Started",
                                margin: Margin {
                                    top: 0.0,
                                    bottom: 0.0,
                                    left: 0.0,
                                    right: 0.0,
                                },
                                alignment: Left,
                                width: Fill,
                                text_width: Fill,
                                font: Font {
                                    name: "Arial",
                                    size: 12.0,
                                },
                                is_fill: false,
                                url: None,
                            },
                        ),
                        Text(
                            Element {
                                item: "-",
                                margin: Margin {
                                    top: 0.0,
                                    bottom: 0.0,
                                    left: 0.0,
                                    right: 0.0,
                                },
                                alignment: Left,
                                width: Fill,
                                text_width: Fill,
                                font: Font {
                                    name: "Arial",
                                    size: 12.0,
                                },
                                is_fill: false,
                                url: None,
                            },
                        ),
                        Ref(
                            Element {
                                item: "Date-Finished",
                                margin: Margin {
                                    top: 0.0,
                                    bottom: 0.0,
                                    left: 0.0,
                                    right: 0.0,
                                },
                                alignment: Left,
                                width: Fill,
                                text_width: Fill,
                                font: Font {
                                    name: "Arial",
                                    size: 12.0,
                                },
                                is_fill: false,
                                url: None,
                            },
                        ),
                    ],
                    margin: Margin {
                        top: 0.0,
                        bottom: 0.0,
                        left: 0.0,
                        right: 0.0,
                    },
                    alignment: Left,
                    width: Percentage(
                        30.0,
                    ),
                },
            ),
            Ref(
                Element {
                    item: "Position",
                    margin: Margin {
                        top: 0.0,
                        bottom: 0.0,
                        left: 0.0,
                        right: 0.0,
                    },
                    alignment: Left,
                    width: Percentage(
                        70.0,
                    ),
                    text_width: Fill,
                    font: Font {
                        name: "Arial",
                        size: 12.0,
                    },
                    is_fill: false,
                    url: None,
                },
            ),
            Ref(
                Element {
                    item: "Text",
                    margin: Margin {
                        top: 0.0,
                        bottom: 0.0,
                        left: 0.0,
                        right: 0.0,
                    },
                    alignment: Left,
                    width: Percentage(
                        70.0,
                    ),
                    text_width: Fill,
                    font: Font {
                        name: "Arial",
                        size: 12.0,
                    },
                    is_fill: false,
                    url: None,
                },
            ),
            Ref(
                Element {
                    item: "Skills",
                    margin: Margin {
                        top: 0.0,
                        bottom: 0.0,
                        left: 0.0,
                        right: 0.0,
                    },
                    alignment: Left,
                    width: Percentage(
                        70.0,
                    ),
                    text_width: Fill,
                    font: Font {
                        name: "Arial",
                        size: 12.0,
                    },
                    is_fill: false,
                    url: None,
                },
            ),
        ],
        margin: Margin {
            top: 0.0,
            bottom: 0.0,
            left: 0.0,
            right: 0.0,
        },
        alignment: Left,
        width: Fill,
    },
)
"#]];
        expected.assert_debug_eq(&actual);
    }
}
