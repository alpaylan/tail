/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */

export type Width = Percent | Absolute | Fill;

export type Percent = {
    tag: "Percent";
    value: number;
}

export type Absolute = {
    tag: "Absolute";
    value: number;
}

export type Fill = {
    tag: "Fill";
}

export module Width {

    export function copy(width: Width): Width {
        if (width.tag === "Fill") {
            return fill();
        }

        return {
            tag: width.tag,
            value: width.value
        };

    }

    export function default_(): Width {
        return fill();
    }

    export function percent(value: number): Width {
        return { tag: "Percent", value: value };
    }

    export function absolute(value: number): Width {
        return { tag: "Absolute", value: value };
    }

    export function fill(): Width {
        return { tag: "Fill" };
    }

    export function is_fill(self: Width): boolean {
        return self.tag === "Fill";
    }

    export function get_fixed_unchecked(self: Width): number {
        switch (self.tag) {
            case "Percent":
            case "Absolute":
                return self.value;
            case "Fill":
                throw "Width.get_fixed_unchecked() called on Width.Fill";
        }
    }

    export function scale(self: Width, scale: number): Width {
        switch (self.tag) {
            case "Percent":
                return absolute(self.value * scale / 100);
            case "Absolute":
                return self;
            case "Fill":
                return fill();
        }
    }

    export function fromJson(json: any): Width {
        if (json === undefined) {
            return default_();
        } else if (typeof json === 'string') {
            if (json.endsWith('%')) {
                return percent(parseFloat(json.slice(0, -1)));
            } else if (json.endsWith('px')) {
                return absolute(parseFloat(json.slice(0, -2)));
            } else {
                return default_();
            }
        } else {
            return default_();
        }
    }

    export function toJson(self: Width): any {
        switch (self.tag) {
            case "Percent":
                return self.value + "%";
            case "Absolute":
                return self.value + "px";
            case "Fill":
                return "Fill";
        }
    }
}



