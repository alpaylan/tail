use serde::{Deserialize, Serialize};

use crate::element::Element;

#[derive(Serialize, Deserialize)]
pub struct BasicLayout {
    pub rows: Vec<Row>,
}

#[derive(Serialize, Deserialize)]
pub struct Row {
    pub blocks: Vec<Block>,
}

#[derive(Serialize, Deserialize)]
pub struct Block {
    inner: Vec<Element>,
    start: f32,
    end: f32,
}
