"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Width = void 0;
var Width;
(function (Width) {
    function copy(width) {
        if (width.tag === "Fill") {
            return fill();
        }
        return {
            tag: width.tag,
            value: width.value
        };
    }
    Width.copy = copy;
    function default_() {
        return fill();
    }
    Width.default_ = default_;
    function percent(value) {
        return { tag: "Percent", value: value };
    }
    Width.percent = percent;
    function absolute(value) {
        return { tag: "Absolute", value: value };
    }
    Width.absolute = absolute;
    function fill() {
        return { tag: "Fill" };
    }
    Width.fill = fill;
    function is_fill(self) {
        return self.tag === "Fill";
    }
    Width.is_fill = is_fill;
    function get_fixed_unchecked(self) {
        switch (self.tag) {
            case "Percent":
            case "Absolute":
                return self.value;
            case "Fill":
                throw "Width.get_fixed_unchecked() called on Width.Fill";
        }
    }
    Width.get_fixed_unchecked = get_fixed_unchecked;
    function scale(self, scale) {
        switch (self.tag) {
            case "Percent":
                return absolute(self.value * scale / 100);
            case "Absolute":
                return self;
            case "Fill":
                return fill();
        }
    }
    Width.scale = scale;
    function fromJson(json) {
        if (json === undefined) {
            return default_();
        }
        else if (typeof json === 'string') {
            if (json.endsWith('%')) {
                return percent(parseFloat(json.slice(0, -1)));
            }
            else if (json.endsWith('px')) {
                return absolute(parseFloat(json.slice(0, -2)));
            }
            else {
                return default_();
            }
        }
        else {
            return default_();
        }
    }
    Width.fromJson = fromJson;
    function toJson(self) {
        switch (self.tag) {
            case "Percent":
                return self.value + "%";
            case "Absolute":
                return self.value + "px";
            case "Fill":
                return "Fill";
        }
    }
    Width.toJson = toJson;
})(Width || (exports.Width = Width = {}));
