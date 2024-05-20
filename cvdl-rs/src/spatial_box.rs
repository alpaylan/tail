use crate::point::Point;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, Copy, PartialEq)]
pub struct SpatialBox {
    pub top_left: Point,
    pub bottom_right: Point,
}

impl SpatialBox {
    pub fn new(top_left: Point, bottom_right: Point) -> Self {
        SpatialBox {
            top_left,
            bottom_right,
        }
    }
    #[allow(dead_code)]
    pub fn move_x_by(&self, x: f32) -> Self {
        SpatialBox {
            top_left: self.top_left.move_x_by(x),
            bottom_right: self.bottom_right.move_x_by(x),
        }
    }
    #[allow(dead_code)]
    pub fn move_y_by(&self, y: f32) -> Self {
        SpatialBox {
            top_left: self.top_left.move_y_by(y),
            bottom_right: self.bottom_right.move_y_by(y),
        }
    }
    #[allow(dead_code)]
    pub fn width(&self) -> f32 {
        self.bottom_right.x - self.top_left.x
    }
    #[allow(dead_code)]
    pub fn height(&self) -> f32 {
        self.bottom_right.y - self.top_left.y
    }
}
