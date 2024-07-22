"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
Object.defineProperty(exports, "__esModule", { value: true });
exports.copy = copy;
exports.default_ = default_;
exports.percent = percent;
exports.absolute = absolute;
exports.fill = fill;
exports.is_fill = is_fill;
exports.get_fixed_unchecked = get_fixed_unchecked;
exports.scale = scale;
exports.fromJson = fromJson;
exports.toJson = toJson;
function copy(width) {
    if (width.tag === "Fill") {
        return fill();
    }
    return {
        tag: width.tag,
        value: width.value,
    };
}
function default_() {
    return fill();
}
function percent(value) {
    return { tag: "Percent", value: value };
}
function absolute(value) {
    return { tag: "Absolute", value: value };
}
function fill() {
    return { tag: "Fill" };
}
function is_fill(self) {
    return self.tag === "Fill";
}
function get_fixed_unchecked(self) {
    switch (self.tag) {
        case "Percent":
        case "Absolute":
            return self.value;
        case "Fill":
            throw "Width.get_fixed_unchecked() called on Width.Fill";
    }
}
function scale(self, scale) {
    switch (self.tag) {
        case "Percent":
            return absolute((self.value * scale) / 100);
        case "Absolute":
            return self;
        case "Fill":
            return fill();
    }
}
function fromJson(json) {
    if (json === undefined) {
        return default_();
    }
    else if (typeof json === "string") {
        if (json.endsWith("%")) {
            return percent(parseFloat(json.slice(0, -1)));
        }
        else if (json.endsWith("px")) {
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
