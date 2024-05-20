use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use std::collections::HashMap;

#[serde_as]
#[derive(Serialize, Deserialize, Debug)]
pub struct ResumeData {
    pub layout: String,
    #[serde_as(deserialize_as = "Vec<_>")]
    pub sections: Vec<ResumeSection>,
}

#[serde_as]
#[derive(Serialize, Deserialize, Debug)]
pub struct ResumeSection {
    pub section_name: String,
    pub data_schema: String,
    pub layout_schema: String,
    #[serde_as(deserialize_as = "HashMap<_, _>")]
    #[serde(default = "HashMap::new")]
    pub data: HashMap<ItemName, ItemContent>,
    #[serde_as(deserialize_as = "Vec<HashMap<_, _>>")]
    pub items: Vec<HashMap<ItemName, ItemContent>>,
}

pub type ItemName = String;

#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[serde(untagged)]
pub enum ItemContent {
    None,
    String(String),
    List(Vec<ItemContent>),
    Url { url: String, text: String },
}

impl ToString for ItemContent {
    fn to_string(&self) -> String {
        match self {
            ItemContent::None => String::new(),
            ItemContent::String(s) => s.clone(),
            ItemContent::List(l) => l
                .iter()
                .map(ItemContent::to_string)
                .collect::<Vec<String>>()
                .join(", "),
            ItemContent::Url { url: _, text } => text.clone(),
        }
    }
}

impl ResumeData {
    pub fn from_json(json: &str) -> ResumeData {
        let resume_data: ResumeData = serde_json::from_str(json).unwrap();
        resume_data
    }

    pub fn data_schemas(&self) -> Vec<String> {
        self.sections
            .iter()
            .map(|section| section.data_schema.clone())
            .collect()
    }

    pub fn layout_schemas(&self) -> Vec<String> {
        self.sections
            .iter()
            .map(|section| section.layout_schema.clone())
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_from_json() {
        let json = r#"
        [
    {
        "section-name": "Profile",
        "data-schema": "Profile",
        "layout-schema": "Profile-Compact",
        "items": [
            { 
                "Name": "Alperen",
                "Surname": "Keles",
                "Linkedin": "https://linkedin.com/in/alpkeles",
                "Github": "https://github.com/alpaylan",
                "Email": "alpkeles99@gmail.com",
                "Google Scholar": "https://scholar.google.com/citations?user=5T4PvEAAAAAJ&hl=tr" 
            }
        ]
    },
    {
        "section-name": "Education",
        "data-schema": "Education",
        "layout-schema": "Education",
        "items": [
            { 
                "School": "University of Maryland, College Park",
                "Degree": "Doctorate of Philosophy",
                "Department": "Computer Science",
                "Date-Started": "2021",
                "Date-Finished": "2026(Expected)",
                "Location": "Maryland, USA" 
            },
            { 
                "School": {"url": "http://metu.edu.tr", "text": "Middle East Technical University"},
                "Degree": "Bachelor of Engineering",
                "Department": "Computer Engineering",
                "Date-Started": "2017",
                "Date-Finished": "2021",
                "Location": "Ankara, Turkey",
                "Text": "GPA: 3.66/4.0 ***(top 5% in class of 229)***"
            }
        ]
    }
]
        "#;

        let resume_data = ResumeData::from_json(json);
        assert_eq!(resume_data.sections.len(), 2);
        assert_eq!(resume_data.sections[0].name, "Profile");
        assert_eq!(resume_data.sections[0].data_schema, "Profile");
        assert_eq!(resume_data.sections[0].items.len(), 1);
        assert_eq!(
            resume_data.sections[0].items[0]["Name"].to_string(),
            "Alperen"
        );
        assert_eq!(resume_data.sections[1].name, "Education");
        assert_eq!(resume_data.sections[1].data_schema, "Education");
        assert_eq!(resume_data.sections[1].items.len(), 2);
        assert_eq!(
            resume_data.sections[1].items[0]["School"].to_string(),
            "University of Maryland, College Park"
        );
    }
}
