use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, Copy, PartialEq)]
pub struct Point {
    pub x: f32,
    pub y: f32,
}

impl Point {
    pub fn new(x: f32, y: f32) -> Self {
        Point { x, y }
    }

    pub fn move_x_by(&self, x: f32) -> Self {
        Point {
            x: self.x + x,
            y: self.y,
        }
    }

    pub fn move_y_by(&self, y: f32) -> Self {
        Point {
            x: self.x,
            y: self.y + y,
        }
    }
    #[allow(dead_code)]
    pub fn move_x_to(&self, x: f32) -> Self {
        Point { x, y: self.y }
    }

    pub fn move_y_to(&self, y: f32) -> Self {
        Point { x: self.x, y }
    }
}
