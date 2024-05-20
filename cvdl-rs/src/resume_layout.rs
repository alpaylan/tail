use serde::{Deserialize, Serialize};

use crate::{layout_schema::Named, margin::Margin};

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub enum ColumnType {
    #[default]
    SingleColumn,
    DoubleColumn {
        vertical_margin: f32,
    },
}

impl ColumnType {
    pub fn vertical_margin(&self) -> f32 {
        match self {
            ColumnType::SingleColumn => 0.0,
            ColumnType::DoubleColumn { vertical_margin } => *vertical_margin,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct ResumeLayout {
    pub schema_name: String,
    pub column_type: ColumnType,
    pub margin: Margin,
    pub width: f32,
    pub height: f32,
}

impl Named for ResumeLayout {
    fn name(&self) -> &str {
        &self.schema_name
    }
}

impl ResumeLayout {
    pub fn from_json(json: &str) -> Vec<ResumeLayout> {
        let schemas: Vec<ResumeLayout> = serde_json::from_str(json).unwrap();
        schemas
    }
}
