use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
pub struct Margin {
    pub top: f32,
    pub bottom: f32,
    pub left: f32,
    pub right: f32,
}

impl Default for Margin {
    fn default() -> Self {
        Margin {
            top: 0.0,
            bottom: 0.0,
            left: 0.0,
            right: 0.0,
        }
    }
}

impl Margin {
    #[allow(dead_code)]
    pub fn new(top: f32, bottom: f32, left: f32, right: f32) -> Margin {
        Margin {
            top,
            bottom,
            left,
            right,
        }
    }
}

impl Margin {
    #[allow(dead_code)]
    pub fn with_top(self, top: f32) -> Margin {
        Margin { top, ..self }
    }
    #[allow(dead_code)]
    pub fn with_bottom(self, bottom: f32) -> Margin {
        Margin { bottom, ..self }
    }
    #[allow(dead_code)]
    pub fn with_left(self, left: f32) -> Margin {
        Margin { left, ..self }
    }
    #[allow(dead_code)]
    pub fn with_right(self, right: f32) -> Margin {
        Margin { right, ..self }
    }
}
