"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Elem = exports.ColorMap = exports.Row = exports.Stack = exports.SectionLayout = void 0;
const Margin_1 = require("./Margin");
const Alignment_1 = require("./Alignment");
const Width_1 = require("./Width");
const Font_1 = require("./Font");
const Resume_1 = require("./Resume");
const Box_1 = require("./Box");
const AnyLayout_1 = require("./AnyLayout");
const Point_1 = require("./Point");
class SectionLayout {
    constructor(inner) {
        this.inner = inner;
    }
    copy() {
        return new SectionLayout(this.inner.copy());
    }
    static constrMap(tag) {
        switch (tag) {
            case "Stack": return Stack.default_();
            case "FlexRow": return Row.default_();
            case "FrozenRow": {
                const row = Row.default_();
                row.is_frozen = true;
                return row;
            }
            case "Text": return Elem.default_();
            case "Ref": {
                const elem = Elem.default_();
                elem.is_ref = true;
                return elem;
            }
        }
    }
    static empty() {
        return new SectionLayout(Stack.default_());
    }
    static fromJson(json) {
        var _a;
        const key = Object.keys(json)[0];
        switch (key) {
            case 'Stack':
            case 'FlexRow':
            case 'FrozenRow': {
                const container = SectionLayout.constrMap(key);
                container.elements = json[key].elements.map((element) => SectionLayout.fromJson(element));
                container.margin = Margin_1.Margin.fromJson(json[key].margin);
                container.alignment = json[key].alignment;
                container.width = Width_1.Width.fromJson(json[key].width);
                return new SectionLayout(container);
            }
            case 'Ref':
            case 'Text': {
                const inner = SectionLayout.constrMap(key);
                inner.item = json[key].item;
                inner.margin = Margin_1.Margin.fromJson(json[key].margin);
                inner.alignment = json[key].alignment;
                inner.width = Width_1.Width.fromJson(json[key].width);
                inner.text_width = Width_1.Width.fromJson(json[key].text_width);
                inner.font = Font_1.Font.fromJson(json[key].font);
                inner.url = json[key].url;
                inner.background_color = (_a = json[key].background_color) !== null && _a !== void 0 ? _a : "Transparent";
                return new SectionLayout(inner);
            }
        }
        throw new Error(`Invalid layout ${key}`);
    }
    toJson() {
        switch (this.type_()) {
            case "Stack":
            case "Row": {
                const container = this.inner;
                return {
                    [this.tag_()]: {
                        elements: container.elements.map(e => e.toJson()),
                        margin: container.margin.toJson(),
                        alignment: container.alignment,
                        width: Width_1.Width.toJson(container.width),
                    },
                };
            }
            case "Elem": {
                const elem = this.inner;
                console.error(elem.background_color);
                return {
                    [this.tag_()]: {
                        item: elem.item,
                        margin: elem.margin.toJson(),
                        alignment: elem.alignment,
                        width: Width_1.Width.toJson(elem.width),
                        text_width: Width_1.Width.toJson(elem.text_width),
                        font: elem.font.toJson(),
                        url: elem.url,
                        background_color: elem.background_color,
                    },
                };
            }
        }
    }
    width() {
        return this.inner.width;
    }
    is_container() {
        return this.inner.tag === "Stack" || this.inner.tag === "Row";
    }
    is_ref() {
        return this.inner.tag === "Elem" && this.inner.is_ref;
    }
    type_() {
        return this.inner.tag;
    }
    tag_() {
        switch (this.type_()) {
            case "Stack":
                return "Stack";
            case "Row":
                return this.inner.is_frozen ? "FrozenRow" : "FlexRow";
            case "Elem":
                return this.is_ref() ? "Ref" : "Text";
        }
    }
    fonts() {
        switch (this.type_()) {
            case "Stack":
                return this.inner.elements.map(e => e.fonts()).reduce((a, b) => a.concat(b), []);
            case "Row":
                return this.inner.elements.map(e => e.fonts()).reduce((a, b) => a.concat(b), []);
            case "Elem":
                return [this.inner.font];
        }
    }
    with_margin(margin) {
        this.inner = this.inner.with_margin(margin);
        return this;
    }
    with_alignment(alignment) {
        this.inner = this.inner.with_alignment(alignment);
        return this;
    }
    with_width(width) {
        this.inner = this.inner.with_width(width);
        return this;
    }
    is_instantiated() {
        if (this.is_container()) {
            return this.inner.elements.map(e => e.is_instantiated()).reduce((a, b) => a && b, true);
        }
        else {
            return !this.inner.is_ref;
        }
    }
    instantiate(section) {
        if (this.is_container()) {
            return new SectionLayout(this.inner.instantiate(section));
        }
        else if (this.inner.is_ref) {
            return SectionLayout.instantiate_ref_element(this.inner, section);
        }
        else {
            return this;
        }
    }
    static instantiate_ref_element(element, section) {
        const text = section.get(element.item);
        if (text === undefined) {
            return new SectionLayout(new Stack([], Margin_1.Margin.default_(), Alignment_1.Alignment.default_(), Width_1.Width.default_()));
        }
        else {
            // @ts-ignore
            element.item = Resume_1.ItemContent.toString(text);
            element.is_ref = false;
            if (text.tag === "Url") {
                return new SectionLayout(element.with_url(text.value.url).with_item(text.value.text));
            }
            else {
                return new SectionLayout(element);
            }
        }
    }
    bound_width(width) {
        const bound = this.inner.width.tag === "Absolute" ? Math.min(this.inner.width.value, width)
            : this.inner.width.tag === "Fill" ? width
                : null;
        if (bound === null) {
            throw new Error("Cannot bound width of non-unitized widths!");
        }
        if (this.inner.tag === "Elem" && this.inner.is_ref) {
            throw new Error("Cannot propagate widths of uninstantiated layout");
        }
        this.inner = this.inner.bound_width(bound);
        return this;
    }
    scale_width(document_width) {
        if (this.is_ref()) {
            throw new Error("Cannot scale width of uninstantiated layout");
        }
        return new SectionLayout(this.inner.scale_width(document_width));
    }
    normalize(width, font_dict) {
        console.debug(`Normalizing document, checking if document is instantiated...`);
        if (!this.is_instantiated()) {
            throw Error("Cannot normalize uninstantiated layout");
        }
        console.debug("Document is instantiated. Scaling widths...");
        const scaled_layout = this.scale_width(width);
        console.debug("Widths are scaled. Bounding widths...");
        const bounded_layout = scaled_layout.bound_width(width);
        console.debug("Widths are bounded. Filling fonts...");
        const font_filled_layout = bounded_layout.fill_fonts(font_dict);
        console.debug("Fonts filled. Breaking lines...");
        const broken_layout = font_filled_layout.break_lines(font_dict);
        console.debug("Lines broken.");
        return broken_layout;
    }
    fill_fonts(font_dict) {
        if (this.is_ref()) {
            throw new Error("Cannot fill fonts of uninstantiated layout");
        }
        switch (this.type_()) {
            case "Stack":
            case "Row":
                this.inner.elements = this.inner.elements.map(e => e.fill_fonts(font_dict));
                break;
            case "Elem":
                this.inner = this.inner.fill_fonts(font_dict);
                break;
        }
        return this;
    }
    break_lines(font_dict) {
        switch (this.type_()) {
            case "Stack": {
                const stack = this.inner;
                stack.elements = stack.elements.map(e => e.break_lines(font_dict));
                return this;
            }
            case "Row": {
                const row = this.inner;
                if (row.is_frozen) {
                    const total_width = row
                        .elements
                        .map(e => Width_1.Width.get_fixed_unchecked(e.width()))
                        .reduce((a, b) => a + b, 0.0);
                    if (total_width > Width_1.Width.get_fixed_unchecked(this.width())) {
                        throw `Cannot break lines of frozen row with width ${this.width()} and total width ${total_width}`;
                    }
                    else {
                        row.elements = row.elements.map(e => e.break_lines(font_dict));
                    }
                }
                else {
                    const lines = row.break_lines(font_dict).map(l => new SectionLayout(l));
                    return new SectionLayout(new Stack(lines, row.margin, row.alignment, row.width));
                }
                return this;
            }
            case "Elem": {
                if (this.is_ref()) {
                    throw new Error("Cannot break lines of uninstantiated layout");
                }
                const elem = this.inner;
                const lines = elem.break_lines(font_dict).map(l => new SectionLayout(l));
                return new SectionLayout(new Stack(lines, elem.margin, elem.alignment, elem.width));
            }
        }
    }
    compute_boxes(font_dict) {
        const textbox_positions = [];
        const top_left = new Point_1.Point(0.0, 0.0);
        const depth = this.compute_textbox_positions(textbox_positions, top_left, font_dict);
        const bounding_box = new Box_1.Box(new Point_1.Point(0.0, 0.0), new Point_1.Point(Width_1.Width.get_fixed_unchecked(this.width()), depth));
        return new AnyLayout_1.ElementBox(bounding_box, textbox_positions);
    }
    compute_textbox_positions(textbox_positions, top_left, font_dict) {
        let depth = top_left.y;
        switch (this.type_()) {
            case "Stack": {
                const stack = this.inner;
                for (const element of stack.elements) {
                    depth = element.compute_textbox_positions(textbox_positions, top_left, font_dict);
                    top_left = top_left.move_y_to(depth);
                }
                return depth;
            }
            case "Row": {
                const row = this.inner;
                let per_elem_space = 0.0;
                switch (row.alignment) {
                    case "Center":
                        top_left = top_left.move_x_by((Width_1.Width.get_fixed_unchecked(row.width) - row.elements_width()) / 2.0);
                        break;
                    case "Right":
                        top_left = top_left.move_x_by(Width_1.Width.get_fixed_unchecked(row.width) - row.elements_width());
                        break;
                    case "Justified":
                        per_elem_space = (Width_1.Width.get_fixed_unchecked(row.width) - row.elements_width()) / (row.elements.length - 1);
                        break;
                }
                for (const element of row.elements) {
                    depth = Math.max(depth, element.compute_textbox_positions(textbox_positions, top_left, font_dict));
                    top_left =
                        top_left.move_x_by(Width_1.Width.get_fixed_unchecked(element.width()) + per_elem_space);
                }
                return depth;
            }
            case "Elem": {
                const elem = this.inner;
                if (elem.is_ref) {
                    throw new Error("Cannot compute textbox positions of uninstantiated layout");
                }
                if (elem.item === "") {
                    return top_left.y;
                }
                const height = elem.font.get_height(font_dict);
                const width = Width_1.Width.get_fixed_unchecked(elem.text_width);
                switch (elem.alignment) {
                    case "Center":
                        top_left = top_left.move_x_by((Width_1.Width.get_fixed_unchecked(elem.width) - width) / 2.0);
                        break;
                    case "Right":
                        top_left = top_left.move_x_by(Width_1.Width.get_fixed_unchecked(elem.width) - width);
                        break;
                    case "Justified":
                        throw new Error("Cannot compute textbox positions of justified element");
                }
                const textbox = new Box_1.Box(top_left, top_left.move_x_by(width).move_y_by(height));
                textbox_positions.push([textbox, elem]);
                return top_left.y + height;
            }
        }
    }
}
exports.SectionLayout = SectionLayout;
class Stack {
    constructor(elements, margin, alignment, width) {
        this.tag = "Stack";
        this.elements = elements;
        this.margin = margin !== null && margin !== void 0 ? margin : Margin_1.Margin.default_();
        this.alignment = alignment !== null && alignment !== void 0 ? alignment : Alignment_1.Alignment.default_();
        this.width = width !== null && width !== void 0 ? width : Width_1.Width.default_();
    }
    static stack(elements, margin, alignment, width) {
        return new SectionLayout(new Stack(elements, margin, alignment, width));
    }
    copy() {
        return new Stack(this.elements.map((e) => e.copy()), this.margin.copy(), this.alignment, Width_1.Width.copy(this.width));
    }
    static default_() {
        return new Stack([]);
    }
    instantiate(section) {
        return new Stack(this.elements.map(e => e.instantiate(section)), this.margin, this.alignment, this.width);
    }
    with_elements(elements) {
        return new Stack(elements, this.margin, this.alignment, this.width);
    }
    with_margin(margin) {
        return new Stack(this.elements, margin, this.alignment, this.width);
    }
    with_alignment(alignment) {
        return new Stack(this.elements, this.margin, alignment, this.width);
    }
    with_width(width) {
        return new Stack(this.elements, this.margin, this.alignment, width);
    }
    bound_width(width) {
        const bound = this.width.tag === "Absolute" ? Math.min(this.width.value, width)
            : this.width.tag === "Fill" ? width
                : null;
        if (bound === null) {
            throw new Error("Cannot bound width of non-unitized widths!");
        }
        return new Stack(this.elements.map(e => e.bound_width(bound)), this.margin, this.alignment, Width_1.Width.absolute(bound));
    }
    scale_width(w) {
        return this.with_elements(this.elements.map(e => e.scale_width(w))).with_width(Width_1.Width.scale(this.width, w));
    }
}
exports.Stack = Stack;
class Row {
    constructor(elements, is_frozen, margin, alignment, width) {
        this.tag = "Row";
        this.elements = elements;
        this.is_frozen = is_frozen !== null && is_frozen !== void 0 ? is_frozen : false;
        this.margin = margin !== null && margin !== void 0 ? margin : Margin_1.Margin.default_();
        this.alignment = alignment !== null && alignment !== void 0 ? alignment : Alignment_1.Alignment.default_();
        this.width = width !== null && width !== void 0 ? width : Width_1.Width.default_();
    }
    static row(elements, is_frozen, margin, alignment, width) {
        return new SectionLayout(new Row(elements, is_frozen, margin, alignment, width));
    }
    copy() {
        return new Row(this.elements.map((e) => e.copy()), this.is_frozen, this.margin.copy(), this.alignment, Width_1.Width.copy(this.width));
    }
    static default_() {
        return new Row([]);
    }
    instantiate(section) {
        return new Row(this.elements.map(e => e.instantiate(section)), this.is_frozen, this.margin, this.alignment, this.width);
    }
    with_elements(elements) {
        return new Row(elements, this.is_frozen, this.margin, this.alignment, this.width);
    }
    with_margin(margin) {
        return new Row(this.elements, this.is_frozen, margin, this.alignment, this.width);
    }
    with_alignment(alignment) {
        return new Row(this.elements, this.is_frozen, this.margin, alignment, this.width);
    }
    with_width(width) {
        return new Row(this.elements, this.is_frozen, this.margin, this.alignment, width);
    }
    elements_width() {
        return this.elements.map(e => Width_1.Width.get_fixed_unchecked(e.width())).reduce((a, b) => a + b, 0.0);
    }
    bound_width(width) {
        const bound = this.width.tag === "Absolute" ? Math.min(this.width.value, width)
            : this.width.tag === "Fill" ? width
                : null;
        if (bound === null) {
            throw new Error("Cannot bound width of non-unitized widths!");
        }
        return new Row(this.elements.map(e => e.bound_width(bound)), this.is_frozen, this.margin, this.alignment, Width_1.Width.absolute(bound));
    }
    scale_width(w) {
        return this.with_elements(this.elements.map(e => e.scale_width(w))).with_width(Width_1.Width.scale(this.width, w));
    }
    break_lines(font_dict) {
        const lines = [];
        let current_line = [];
        let current_width = 0.0;
        const elements = this
            .elements
            .map(e => e.break_lines(font_dict));
        for (const element of elements) {
            const element_width = Width_1.Width.get_fixed_unchecked(element.width());
            if (current_width + element_width > Width_1.Width.get_fixed_unchecked(this.width)) {
                lines.push(this.with_elements(current_line));
                current_line = [];
                current_width = 0.0;
            }
            current_line.push(element);
            current_width += element_width;
        }
        if (current_line.length > 0) {
            lines.push(this.with_elements(current_line));
        }
        return lines;
    }
}
exports.Row = Row;
exports.ColorMap = {
    "Transparent": "Transparent",
    "Light Yellow": "#FFC96F",
    "Light Brown": "#ECB176",
    "Light Green": "#F6FAB9",
    "Light Beige": "#F6EEC9",
    "Light Blue": "#EEF7FF",
    "Blue": "#4793AF",
};
class Elem {
    constructor(item, url, is_ref, is_fill, text_width, font, margin, alignment, width, background_color) {
        this.tag = "Elem";
        this.item = item;
        this.url = url;
        this.is_ref = is_ref;
        this.is_fill = is_fill;
        this.text_width = text_width;
        this.font = font;
        this.margin = margin;
        this.alignment = alignment;
        this.width = width;
        this.background_color = background_color;
    }
    static elem(item, url, is_ref, is_fill, text_width, font, margin, alignment, width, background_color) {
        return new SectionLayout(new Elem(item, url, is_ref, is_fill, text_width, font, margin, alignment, width, background_color));
    }
    copy() {
        console.error(this.background_color);
        return new Elem(this.item, this.url, this.is_ref, this.is_fill, Width_1.Width.copy(this.text_width), this.font, this.margin.copy(), this.alignment, Width_1.Width.copy(this.width), this.background_color);
    }
    static default_() {
        return new Elem("", null, false, false, Width_1.Width.default_(), Font_1.Font.default_(), Margin_1.Margin.default_(), Alignment_1.Alignment.default_(), Width_1.Width.default_(), "Transparent");
    }
    with_item(item) {
        return new Elem(item, this.url, this.is_ref, this.is_fill, this.text_width, this.font, this.margin, this.alignment, this.width, this.background_color);
    }
    as_ref() {
        return new Elem(this.item, this.url, true, this.is_fill, this.text_width, this.font, this.margin, this.alignment, this.width, this.background_color);
    }
    with_font(font) {
        return new Elem(this.item, this.url, this.is_ref, this.is_fill, this.text_width, font, this.margin, this.alignment, this.width, this.background_color);
    }
    with_url(url) {
        return new Elem(this.item, url, this.is_ref, this.is_fill, this.text_width, this.font, this.margin, this.alignment, this.width, this.background_color);
    }
    with_margin(margin) {
        return new Elem(this.item, this.url, this.is_ref, this.is_fill, this.text_width, this.font, margin, this.alignment, this.width, this.background_color);
    }
    with_alignment(alignment) {
        return new Elem(this.item, this.url, this.is_ref, this.is_fill, this.text_width, this.font, this.margin, alignment, this.width, this.background_color);
    }
    with_width(width) {
        return new Elem(this.item, this.url, this.is_ref, this.is_fill, this.text_width, this.font, this.margin, this.alignment, width, this.background_color);
    }
    with_text_width(text_width) {
        return new Elem(this.item, this.url, this.is_ref, this.is_fill, text_width, this.font, this.margin, this.alignment, this.width, this.background_color);
    }
    with_is_fill(is_fill) {
        return new Elem(this.item, this.url, this.is_ref, is_fill, this.text_width, this.font, this.margin, this.alignment, this.width, this.background_color);
    }
    scale_width(w) {
        return this.with_width(Width_1.Width.scale(this.width, w));
    }
    fill_fonts(fonts) {
        const text_width_with_font = this.font.get_width(this.item, fonts);
        if (this.is_fill) {
            return this.with_width(Width_1.Width.absolute(Math.min(Width_1.Width.get_fixed_unchecked(this.width), text_width_with_font)))
                .with_text_width(Width_1.Width.absolute(text_width_with_font));
        }
        else {
            return this.with_text_width(Width_1.Width.absolute(text_width_with_font));
        }
    }
    justified_lines(lines, font_dict) {
        const rowLines = [];
        for (const line of lines) {
            const words = line.item.split(/\s+/);
            const row = new Row([], false, line.margin, line.alignment, line.width);
            words.forEach(word => {
                const word_width = this.font.get_width(word, font_dict);
                row.elements.push(new SectionLayout(new Elem(word, null, false, false, Width_1.Width.absolute(word_width), this.font, Margin_1.Margin.default_(), Alignment_1.Alignment.default_(), Width_1.Width.absolute(word_width), this.background_color)));
            });
            rowLines.push(row);
        }
        return rowLines;
    }
    break_lines(font_dict) {
        if (Width_1.Width.get_fixed_unchecked(this.text_width) <= Width_1.Width.get_fixed_unchecked(this.width)) {
            return [this];
        }
        const lines = [];
        // todo: I'm sure this implementation is pretty buggy. Note to future me, fix
        // this.
        const words = this.item.split(/\s+/);
        const widths = words.map((word) => this.font.get_width(word, font_dict));
        const space_width = this.font.get_width(" ", font_dict);
        let start = 0;
        let width = widths[0];
        const max_width = Width_1.Width.get_fixed_unchecked(this.width);
        for (let i = 1; i < words.length; i++) {
            const candidate_width = width + space_width + widths[i];
            if (candidate_width > max_width) {
                const line = words.slice(start, i).join(" ");
                const line_width = this.font.get_width(line, font_dict);
                lines.push(this.with_item(line)
                    .with_text_width(Width_1.Width.absolute(line_width)));
                start = i;
                width = widths[i];
            }
            else {
                width += space_width + widths[i];
            }
        }
        const line = words.slice(start).join(" ");
        const line_width = this.font.get_width(line, font_dict);
        lines.push(this.with_item(line)
            .with_text_width(Width_1.Width.absolute(line_width)));
        if (this.alignment === "Justified") {
            return this.justified_lines(lines, font_dict);
        }
        return lines;
    }
    bound_width(width) {
        if (!Width_1.Width.is_fill(this.width)) {
            return this.with_width(Width_1.Width.absolute(Math.min(Width_1.Width.get_fixed_unchecked(this.width), width))).with_is_fill(false);
        }
        else {
            return this.with_width(Width_1.Width.absolute(width)).with_is_fill(true);
        }
    }
}
exports.Elem = Elem;
