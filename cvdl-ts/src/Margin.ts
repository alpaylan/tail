
export class Margin {
    top: number = 0;
    bottom: number = 0;
    left: number = 0;
    right: number = 0;

    constructor(top: number, bottom: number, left: number, right: number) {
        this.top = top;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
    }

    copy() {
        return new Margin(this.top, this.bottom, this.left, this.right);
    }

    static default_() : Margin {
        return new Margin(0, 0, 0, 0);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson (json: any) : Margin {
        return new Margin(json.top, json.bottom, json.left, json.right);
    }

    toJson() {
        return {
            top: this.top,
            bottom: this.bottom,
            left: this.left,
            right: this.right,
        };
    }
}

