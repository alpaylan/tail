
export type t = "Left" | "Center" | "Right" | "Justified";

type Alignment = t;

export function default_(): Alignment {
    return "Left";
}
