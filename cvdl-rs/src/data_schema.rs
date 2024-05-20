use std::str::FromStr;

use serde::{Deserialize, Serialize};
use serde_with::{serde_as, DisplayFromStr};

use crate::{layout_schema::Named, resume_data::ItemContent};

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
#[serde(untagged)]
pub enum DocumentDataType {
    Date,
    String,
    MarkdownString,
    Type(String),
    List(Box<DocumentDataType>),
    Types(Vec<DocumentDataType>),
}

impl DocumentDataType {
    #[allow(dead_code)]
    fn validate(data_type: &DocumentDataType, value: &ItemContent) -> bool {
        match value {
            ItemContent::None => unreachable!(),
            ItemContent::String(_) => match data_type {
                DocumentDataType::Date => todo!(),
                DocumentDataType::String => true,
                DocumentDataType::MarkdownString => true,
                DocumentDataType::Type(_) => true,
                DocumentDataType::List(_) => false,
                DocumentDataType::Types(t) => {
                    t.iter().any(|t| DocumentDataType::validate(t, value))
                }
            },
            ItemContent::List(items) => {
                if let DocumentDataType::List(t) = data_type {
                    items.iter().all(|i| DocumentDataType::validate(t, i))
                } else {
                    false
                }
            }
            ItemContent::Url { url: _, text: _ } => true,
        }
    }
}

impl std::fmt::Display for DocumentDataType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DocumentDataType::Type(s) => write!(f, "{}", s),
            DocumentDataType::List(l) => write!(f, "List<{}>", l),
            DocumentDataType::Types(t) => write!(
                f,
                "{}",
                t.iter()
                    .map(|ddt| ddt.to_string())
                    .collect::<Vec<String>>()
                    .join(" | ")
            ),
            DocumentDataType::Date => write!(f, "Date"),
            DocumentDataType::String => write!(f, "String"),
            DocumentDataType::MarkdownString => write!(f, "MarkdownString"),
        }
    }
}

impl FromStr for DocumentDataType {
    type Err = String;
    fn from_str(s: &str) -> Result<DocumentDataType, Self::Err> {
        Ok(match s {
            "Date" => DocumentDataType::Date,
            "String" => DocumentDataType::String,
            "MarkdownString" => DocumentDataType::MarkdownString,
            _ => {
                if s.contains('|') {
                    let types: Vec<&str> = s.split('|').collect();
                    let mut data_types: Vec<DocumentDataType> = Vec::new();
                    for t in types {
                        data_types.push(DocumentDataType::from_str(t.trim())?);
                    }
                    DocumentDataType::Types(data_types)
                } else if s.starts_with("List") {
                    let list_type = s.get(5..(s.len() - 1)).unwrap();
                    DocumentDataType::List(Box::new(DocumentDataType::from_str(list_type)?))
                } else {
                    DocumentDataType::Type(s.to_string())
                }
            }
        })
    }
}

#[serde_as]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Field {
    pub name: String,
    #[serde(rename = "type")]
    #[serde_as(as = "DisplayFromStr")]
    pub data_type: DocumentDataType,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DataSchema {
    pub schema_name: String,
    #[serde(default = "Vec::new")]
    pub header_schema: Vec<Field>,
    pub item_schema: Vec<Field>,
}

impl Named for DataSchema {
    fn name(&self) -> &str {
        &self.schema_name
    }
}

impl DataSchema {
    pub fn from_json(json: &str) -> Vec<DataSchema> {
        let schema: Vec<DataSchema> = serde_json::from_str(json).unwrap();
        schema
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
                "schema-name": "Education",
                "item-schema": [
                    { "name": "School", "type": "String" },
                    { "name": "Degree", "type": "String" },
                    { "name": "Department", "type": "String" },
                    { "name": "Date-Started", "type": "Date" },
                    { "name": "Date-Finished", "type": "Date | String" },
                    { "name": "Location", "type": "String" },
                    { "name": "Text", "type": "MarkdownString" }
                ]
            },
            {
                "schema-name": "General",
                "item-schema": [
                    { "name": "Title", "type": "String" },
                    { "name": "Subtitle", "type": "String" },
                    { "name": "Text", "type": "String" },
                    { "name": "Date-Started", "type": "Date" },
                    { "name": "Date-Finished", "type": "Date | String" },
                    { "name": "Location", "type": "String" },
                    { "name": "Text", "type": "MarkdownString" }
                ]
            },
            {
                "schema-name": "Skill",
                "item-schema": [
                    { "name": "Skill", "type": "String" },
                    { "name": "Information", "type": "String" },
                    { "name": "Level", "type": "Number" }
                ]
            },
            {
                "schema-name": "Profile",
                "item-schema": [
                    { "name": "Name", "type": "String" },
                    { "name": "Surname", "type": "String" },
                    { "name": "Linkedin", "type": "String" },
                    { "name": "Github", "type": "String" },
                    { "name": "Email", "type": "String" },
                    { "name": "Google Scholar", "type": "URLString" }
                ]
            }
        ]
        "#;
        let schema = DataSchema::from_json(json);
        assert_eq!(schema[0].name, "Education");
        assert_eq!(schema[0].item_schema[0].name, "School");
        assert_eq!(schema[0].item_schema[0].data_type, DocumentDataType::String);
        assert_eq!(schema[0].item_schema[1].name, "Degree");
        assert_eq!(schema[0].item_schema[1].data_type, DocumentDataType::String);
        assert_eq!(schema[0].item_schema[4].name, "Date-Finished");
        assert_eq!(
            schema[0].item_schema[4].data_type,
            DocumentDataType::Types(vec![DocumentDataType::Date, DocumentDataType::String])
        );

        assert_eq!(schema[3].item_schema[5].name, "Google Scholar");
        assert_eq!(
            schema[3].item_schema[5].data_type,
            DocumentDataType::Type("URLString".to_string())
        );
    }
}
