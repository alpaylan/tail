use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, Copy, Default)]
pub enum Alignment {
    #[default]
    Left,
    Center,
    Right,
    Justified,
}
