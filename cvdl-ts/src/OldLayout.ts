// import * as Margin from "./Margin";
// import * as Alignment from "./Alignment";
// import * as Width from "./Width";
// import { Font } from "./Font";
// import { ItemContent } from "./Resume";
// import { Box } from "./Box";
// import { ElementBox, FontDict } from "./AnyLayout";
// import { Point } from "./Point";

// export type ContainerType = Stack | Row;
// export type LayoutType = Stack | Row | Elem;

// export class SectionLayout {
//     inner: Stack | Row | Elem;
//     bounding_box: Box | null = null;

//     constructor(inner: Stack | Row | Elem) {
//         this.inner = inner;
//     }

//     copy(): SectionLayout {
//         return new SectionLayout(this.inner.copy());
//     }

//     static constrMap(tag: string) {
//         switch (tag) {
//             case "Stack": return Stack.default_();
//             case "FlexRow": return Row.default_();
//             case "FrozenRow": {
//                 const row = Row.default_();
//                 row.is_frozen = true;
//                 return row;
//             }
//             case "Text": return Elem.default_();
//             case "Ref": {
//                 const elem = Elem.default_();
//                 elem.is_ref = true;
//                 return elem;
//             }

//         }
//     }

//     static empty(): SectionLayout {
//         return new SectionLayout(Stack.default_());
//     }

//     static fromJson(json: unknown): SectionLayout {
//         const key = Object.keys(json)[0];
//         switch (key) {
//             case 'Stack':
//             case 'FlexRow':
//             case 'FrozenRow': {
//                 const container = SectionLayout.constrMap(key) as ContainerType;
//                 container.elements = json[key].elements.map((element: unknown) => SectionLayout.fromJson(element));
//                 container.margin = json[key].margin;
//                 container.alignment = json[key].alignment;
//                 container.width = Width.fromJson(json[key].width);
//                 return new SectionLayout(container);
//             }
//             case 'Ref':
//             case 'Text': {
//                 const inner = SectionLayout.constrMap(key) as Elem;
//                 inner.item = json[key].item;
//                 inner.margin = json[key].margin;
//                 inner.alignment = json[key].alignment;
//                 inner.width = Width.fromJson(json[key].width);
//                 inner.text_width = Width.fromJson(json[key].text_width);
//                 inner.font = Font.fromJson(json[key].font);
//                 inner.url = json[key].url;
//                 inner.background_color = json[key].background_color ?? "Transparent";
//                 return new SectionLayout(inner);
//             }

//         }
//         throw new Error(`Invalid layout ${key}`);
//     }

//     toJson() {
//         switch (this.type_()) {
//             case "Stack":
//             case "Row": {
//                 const container = this.inner as ContainerType;
//                 return {
//                     [this.tag_()]: {
//                         elements: container.elements.map(e => e.toJson()),
//                         margin: container.margin,
//                         alignment: container.alignment,
//                         width: Width.toJson(container.width),
//                     },
//                 };
//             }
//             case "Elem": {
//                 const elem = this.inner as Elem;
//                 return {
//                     [this.tag_()]: {
//                         item: elem.item,
//                         margin: elem.margin,
//                         alignment: elem.alignment,
//                         width: Width.toJson(elem.width),
//                         text_width: Width.toJson(elem.text_width),
//                         font: elem.font.toJson(),
//                         url: elem.url,
//                         background_color: elem.background_color,
//                     },
//                 };
//             }
//         }
//     }

//     width(): Width.t {
//         return this.inner.width;
//     }

//     is_container(): boolean {
//         return this.inner.tag === "Stack" || this.inner.tag === "Row";
//     }

//     is_fill(): boolean {
//         switch (this.type_()) {
//             case "Stack":
//                 return this.inner.is_fill && (this.inner as Stack).elements.map(e => e.is_fill()).reduce((a, b) => a && b, true);
//             case "Row":
//                 return this.inner.is_fill && (this.inner as Row).elements.map(e => e.is_fill()).reduce((a, b) => a && b, true);
//             case "Elem":
//                 return this.inner.is_fill
//         }
//     }

//     is_ref(): boolean {
//         return this.inner.tag === "Elem" && this.inner.is_ref;
//     }

//     type_(): "Stack" | "Row" | "Elem" {
//         return this.inner.tag;
//     }

//     tag_(): "Stack" | "FlexRow" | "FrozenRow" | "Ref" | "Text" {
//         switch (this.type_()) {
//             case "Stack":
//                 return "Stack";
//             case "Row":
//                 return (this.inner as Row).is_frozen ? "FrozenRow" : "FlexRow";
//             case "Elem":
//                 return this.is_ref() ? "Ref" : "Text";
//         }
//     }

//     fonts(): Font[] {
//         switch (this.type_()) {
//             case "Stack":
//                 return (this.inner as Stack).elements.map(e => e.fonts()).reduce((a, b) => a.concat(b), []);
//             case "Row":
//                 return (this.inner as Row).elements.map(e => e.fonts()).reduce((a, b) => a.concat(b), []);
//             case "Elem":
//                 return [(this.inner as Elem).font];
//         }
//     }

//     with_margin(margin: Margin.t): SectionLayout {
//         this.inner = this.inner.with_margin(margin);
//         return this;
//     }

//     with_alignment(alignment: Alignment.t): SectionLayout {
//         this.inner = this.inner.with_alignment(alignment);
//         return this;
//     }

//     with_width(width: Width.t): SectionLayout {
//         this.inner = this.inner.with_width(width);
//         return this;
//     }

//     total_elements_width(): number {
//         if (this.is_container()) {
//             return (this.inner as ContainerType).elements.map(e => e.total_elements_width()).reduce((a, b) => a + b, 0.0);
//         } else {
//             return Width.get_fixed_unchecked(this.width());
//         }
//     }

//     is_instantiated(): boolean {
//         if (this.is_container()) {
//             return (this.inner as ContainerType).elements.map(e => e.is_instantiated()).reduce((a, b) => a && b, true);
//         } else {
//             return !(this.inner as Elem).is_ref;
//         }
//     }

//     instantiate(section: & Map<string, ItemContent>): SectionLayout {
//         if (this.is_container()) {
//             return new SectionLayout((this.inner as ContainerType).instantiate(section));
//         } else if ((this.inner as Elem).is_ref) {
//             return SectionLayout.instantiate_ref_element(this.inner as Elem, section)
//         } else {
//             return this;
//         }
//     }

//     static instantiate_ref_element(
//         element: Elem,
//         section: & Map<string, ItemContent>,
//     ): SectionLayout {
//         const text = section.get(element.item);

//         if (text === undefined) {
//             return new SectionLayout(new Stack([], Margin.default_(), Alignment.default_(), Width.default_()));
//         } else {
//             element.item = ItemContent.toString(text);
//             element.is_ref = false;
//             if (text.tag === "Url") {
//                 return new SectionLayout(
//                     element.with_url(text.value.url).with_item(text.value.text),
//                 )
//             } else {
//                 return new SectionLayout(element)
//             }
//         }
//     }

//     bound_width(width: number): SectionLayout {
//         const bound = this.inner.width.tag === "Absolute" ? Math.min(this.inner.width.value, width)
//             : this.inner.width.tag === "Fill" ? width
//                 : null;

//         if (bound === null) {
//             throw new Error("Cannot bound width of non-unitized widths!")
//         }

//         if (this.inner.tag === "Elem" && this.inner.is_ref) {
//             throw new Error("Cannot propagate widths of uninstantiated layout")
//         }

//         this.inner = this.inner.bound_width(bound - this.inner.margin.left - this.inner.margin.right);

//         return this;
//     }

//     scale_width(document_width: number): SectionLayout {
//         if (this.is_ref()) {
//             throw new Error("Cannot scale width of uninstantiated layout")
//         }
//         return new SectionLayout(this.inner.scale_width(document_width));
//     }

//     normalize(width: number, font_dict: FontDict): SectionLayout {
//         console.debug(
//             `Normalizing document, checking if document is instantiated...`,
//         );
//         if (!this.is_instantiated()) {
//             throw Error("Cannot normalize uninstantiated layout");
//         }

//         console.debug("Document is instantiated. Scaling widths...");

//         const scaled_layout = this.scale_width(width);

//         console.debug("Widths are scaled. Bounding widths...");

//         const bounded_layout = scaled_layout.bound_width(width);

//         console.debug("Widths are bounded. Filling fonts...");

//         const font_filled_layout = bounded_layout.fill_fonts(font_dict);

//         console.debug("Fonts filled. Breaking lines...");

//         const broken_layout = font_filled_layout.break_lines(font_dict);

//         console.debug("Lines broken.");

//         return broken_layout;
//     }

//     fill_fonts(font_dict: FontDict): SectionLayout {
//         if (this.is_ref()) {
//             throw new Error("Cannot fill fonts of uninstantiated layout")
//         }

//         switch (this.type_()) {
//             case "Stack":
//             case "Row":
//                 (this.inner as ContainerType).elements = (this.inner as ContainerType).elements.map(e => e.fill_fonts(font_dict));
//                 if (this.is_fill()) {
//                     const total_width = this.total_elements_width();
//                     if (total_width <= Width.get_fixed_unchecked(this.width())) {
//                         // throw `Cannot fill fonts of row with width ${JSON.stringify(this.width())} and total width ${total_width}`
//                         this.inner = this.inner.with_width(Width.absolute(total_width));
//                     }
//                 }
//                 break;
//             case "Elem":
//                 this.inner = (this.inner as Elem).fill_fonts(font_dict);
//                 break;
//         }

//         return this;
//     }

//     break_lines(font_dict: FontDict): SectionLayout {
//         switch (this.type_()) {
//             case "Stack": {
//                 const stack = (this.inner as Stack);
//                 stack.elements = stack.elements.map(e => e.break_lines(font_dict));
//                 return this;
//             }
//             case "Row": {
//                 const row = (this.inner as Row);
//                 if (row.is_frozen) {
//                     const total_width = row
//                         .elements
//                         .map(e => Width.get_fixed_unchecked(e.width()))
//                         .reduce((a, b) => a + b, 0.0);

//                     if (total_width > Width.get_fixed_unchecked(this.width())) {
//                         throw `Cannot break lines of frozen row with width ${this.width()} and total width ${total_width}`
//                     } else {
//                         row.elements = row.elements.map(e => e.break_lines(font_dict));
//                     }
//                 } else {
//                     const lines = row.break_lines(font_dict).map(l => new SectionLayout(l));
//                     return new SectionLayout(new Stack(lines, row.margin, row.alignment, row.width));
//                 }
//                 return this;
//             }
//             case "Elem": {
//                 if (this.is_ref()) {
//                     throw new Error("Cannot break lines of uninstantiated layout")
//                 }

//                 const elem = (this.inner as Elem);
//                 const lines = elem.break_lines(font_dict).map(l => new SectionLayout(l));
//                 // Make last line left if it's justified
//                 if (lines[lines.length - 1].inner.alignment === "Justified") {
//                     lines[lines.length - 1] = lines[lines.length - 1].with_alignment("Left");
//                 }

//                 return new SectionLayout(new Stack(
//                     lines,
//                     elem.margin,
//                     elem.alignment,
//                     elem.width,
//                 ));
//             }

//         }
//     }

//     compute_boxes(font_dict: FontDict): [ElementBox, SectionLayout] {
//         const textbox_positions: [Box, Elem][] = [];
//         const top_left: Point = new Point(0.0, 0.0);
//         const depth = this.compute_textbox_positions(textbox_positions, top_left, font_dict);
//         const bounding_box = new Box(
//             new Point(0.0, 0.0),
//             new Point(Width.get_fixed_unchecked(this.width()), depth),
//         );
//         return [new ElementBox(bounding_box, textbox_positions), this];
//     }

//     compute_textbox_positions(
//         textbox_positions: [Box, Elem][], top_left: Point, font_dict: FontDict,
//     ): number {
//         let depth = top_left.y;
//         switch (this.type_()) {
//             case "Stack": {
//                 const stack = (this.inner as Stack);
//                 top_left = top_left.move_y_by(stack.margin.top).move_x_by(stack.margin.left);
//                 const originalTopLeft = top_left;
//                 for (const element of stack.elements) {
//                     depth = element.compute_textbox_positions(textbox_positions, top_left, font_dict);
//                     top_left = top_left.move_y_to(depth);
//                 }

//                 this.bounding_box = new Box(
//                     originalTopLeft,
//                     originalTopLeft.move_y_by(depth).move_x_by(Width.get_fixed_unchecked(stack.width)),
//                 );
//                 return depth;
//             }
//             case "Row": {
//                 const row = (this.inner as Row);
//                 top_left = top_left.move_y_by(row.margin.top).move_x_by(row.margin.left);
//                 const originalTopLeft = top_left;
//                 let per_elem_space: number = 0.0;
//                 switch (row.alignment) {
//                     case "Center":
//                         top_left = top_left.move_x_by((Width.get_fixed_unchecked(row.width) - row.elements_width()) / 2.0);
//                         break;
//                     case "Right":
//                         top_left = top_left.move_x_by(Width.get_fixed_unchecked(row.width) - row.elements_width());
//                         break;
//                     case "Justified":
//                         per_elem_space = (Width.get_fixed_unchecked(row.width) - row.elements_width()) / (row.elements.length - 1);
//                         break;
//                 }

//                 for (const element of row.elements) {
//                     depth = Math.max(depth,
//                         element.compute_textbox_positions(textbox_positions, top_left, font_dict));
//                     top_left =
//                         top_left.move_x_by(Width.get_fixed_unchecked(element.width()) + per_elem_space);
//                 }
//                 this.bounding_box = new Box(
//                     originalTopLeft,
//                     originalTopLeft.move_y_by(depth).move_x_by(Width.get_fixed_unchecked(row.width)),
//                 );

//                 return depth;
//             }

//             case "Elem": {
//                 const elem = (this.inner as Elem);
//                 if (elem.is_ref) {
//                     throw new Error("Cannot compute textbox positions of uninstantiated layout")
//                 }
//                 if (elem.item === "") {
//                     return top_left.y;
//                 }
//                 const height = elem.font.get_height(font_dict);
//                 const width = Width.get_fixed_unchecked(elem.text_width);
//                 top_left = top_left.move_y_by(elem.margin.top).move_x_by(elem.margin.left);

//                 switch (elem.alignment) {
//                     case "Center":
//                         top_left = top_left.move_x_by((Width.get_fixed_unchecked(elem.width) - width) / 2.0);
//                         break;
//                     case "Right":
//                         top_left = top_left.move_x_by(Width.get_fixed_unchecked(elem.width) - width);
//                         break;
//                 }

//                 const textbox = new Box(top_left, top_left.move_x_by(width).move_y_by(height));
//                 textbox_positions.push([textbox, elem]);

//                 this.bounding_box = textbox;
//                 return top_left.y + height;
//             }
//         }
//     }
// }

// export class Stack {
//     tag: "Stack";
//     elements: SectionLayout[];
//     margin: Margin.t;
//     alignment: Alignment.t;
//     width: Width.t;
//     is_fill: boolean;

//     constructor(elements: SectionLayout[], margin?: Margin.t, alignment?: Alignment.t, width?: Width.t, is_fill?: boolean) {
//         this.tag = "Stack";
//         this.elements = elements;
//         this.margin = margin ?? Margin.default_();
//         this.alignment = alignment ?? Alignment.default_();
//         this.width = width ?? Width.default_();
//         this.is_fill = is_fill ?? false;
//     }

//     static stack(elements: SectionLayout[], margin?: Margin.t, alignment?: Alignment.t, width?: Width.t, is_fill?: boolean): SectionLayout {
//         return new SectionLayout(new Stack(elements, margin, alignment, width, is_fill));
//     }

//     copy(): Stack {
//         return new Stack(
//             this.elements.map((e) => e.copy()),
//             Margin.copy(this.margin),
//             this.alignment,
//             Width.copy(this.width)
//         )
//     }

//     static default_(): Stack {
//         return new Stack([]);
//     }

//     instantiate(section: & Map<string, ItemContent>): Stack {
//         return new Stack(this.elements.map(e => e.instantiate(section)), this.margin, this.alignment, this.width, this.is_fill);
//     }

//     with_elements(elements: SectionLayout[]): Stack {
//         return new Stack(elements, this.margin, this.alignment, this.width, this.is_fill);
//     }

//     with_margin(margin: Margin.t): Stack {
//         return new Stack(this.elements, margin, this.alignment, this.width, this.is_fill);
//     }

//     with_alignment(alignment: Alignment.t): Stack {
//         return new Stack(this.elements, this.margin, alignment, this.width, this.is_fill);
//     }

//     with_width(width: Width.t): Stack {
//         return new Stack(this.elements, this.margin, this.alignment, width, this.is_fill);
//     }

//     bound_width(width: number): Stack {
//         const bound = this.width.tag === "Absolute" ? Math.min(this.width.value, width)
//             : this.width.tag === "Fill" ? width
//                 : null;
//         if (bound === null) {
//             throw new Error("Cannot bound width of non-unitized widths!")
//         }
//         return new Stack(this.elements.map(e => e.bound_width(bound)), this.margin, this.alignment, Width.absolute(bound), Width.is_fill(this.width));
//     }

//     scale_width(w: number): Stack {
//         return this.with_elements(this.elements.map(e => e.scale_width(w))).with_width(Width.scale(this.width, w));
//     }
// }

// export class Row {
//     tag: "Row";
//     elements: SectionLayout[];
//     margin: Margin.t;
//     alignment: Alignment.t;
//     width: Width.t;
//     is_frozen: boolean;
//     is_fill: boolean;

//     constructor(elements: SectionLayout[], is_frozen?: boolean, margin?: Margin.t, alignment?: Alignment.t, width?: Width.t, is_fill?: boolean) {
//         this.tag = "Row";
//         this.elements = elements;
//         this.is_frozen = is_frozen ?? false;
//         this.margin = margin ?? Margin.default_();
//         this.alignment = alignment ?? Alignment.default_();
//         this.width = width ?? Width.default_();
//         this.is_fill = is_fill ?? false;
//     }

//     static row(elements: SectionLayout[], is_frozen?: boolean, margin?: Margin.t, alignment?: Alignment.t, width?: Width.t, is_fill?: boolean): SectionLayout {
//         return new SectionLayout(new Row(elements, is_frozen, margin, alignment, width, is_fill));
//     }

//     copy() {
//         return new Row(
//             this.elements.map((e) => e.copy()),
//             this.is_frozen,
//             Margin.copy(this.margin),
//             this.alignment,
//             Width.copy(this.width),
//             this.is_fill,
//         )
//     }

//     static default_(): Row {
//         return new Row([]);
//     }

//     instantiate(section: & Map<string, ItemContent>): Row {
//         return new Row(this.elements.map(e => e.instantiate(section)), this.is_frozen, this.margin, this.alignment, this.width, this.is_fill);
//     }

//     with_elements(elements: SectionLayout[]): Row {
//         return new Row(elements, this.is_frozen, this.margin, this.alignment, this.width, this.is_fill);
//     }

//     with_margin(margin: Margin.t): Row {
//         return new Row(this.elements, this.is_frozen, margin, this.alignment, this.width, this.is_fill);
//     }

//     with_alignment(alignment: Alignment.t): Row {
//         return new Row(this.elements, this.is_frozen, this.margin, alignment, this.width, this.is_fill);
//     }

//     with_width(width: Width.t): Row {
//         return new Row(this.elements, this.is_frozen, this.margin, this.alignment, width, this.is_fill);
//     }

//     elements_width(): number {
//         return this.elements.map(e => Width.get_fixed_unchecked(e.width())).reduce((a, b) => a + b, 0.0);
//     }

//     bound_width(width: number): Row {
//         const bound = this.width.tag === "Absolute" ? Math.min(this.width.value, width)
//             : this.width.tag === "Fill" ? width
//                 : null;

//         if (bound === null) {
//             throw new Error("Cannot bound width of non-unitized widths!")
//         }

//         return new Row(this.elements.map(e => e.bound_width(bound)), this.is_frozen, this.margin, this.alignment, Width.absolute(bound), Width.is_fill(this.width));
//     }

//     scale_width(w: number): Row {
//         return this.with_elements(this.elements.map(e => e.scale_width(w))).with_width(Width.scale(this.width, w));
//     }

//     break_lines(font_dict: FontDict): Row[] {
//         const lines: Row[] = [];
//         let current_line: SectionLayout[] = [];
//         let current_width = 0.0;
//         const elements: SectionLayout[] = this
//             .elements
//             .map(e => e.break_lines(font_dict));

//         for (const element of elements) {
//             const element_width = Width.get_fixed_unchecked(element.width());
//             if (current_width + element_width > Width.get_fixed_unchecked(this.width)) {
//                 lines.push(this.with_elements(current_line));
//                 current_line = [];
//                 current_width = 0.0;
//             }
//             current_line.push(element);
//             current_width += element_width;
//         }

//         if (current_line.length > 0) {
//             lines.push(this.with_elements(current_line));
//         }

//         return lines;
//     }
// }

// export type Color =
//     "Transparent" // transparent
//     | "Light Yellow" // "#FFC96F"
//     | "Light Brown" // "#ECB176"
//     | "Light Green" // "#F6FAB9"
//     | "Light Beige" // "#F6EEC9"
//     | "Light Blue" // "#EEF7FF"
//     | "Blue" // "#4793AF"

// export const ColorMap = {
//     "Transparent": "transparent",
//     "Light Yellow": "#FFC96F",
//     "Light Brown": "#ECB176",
//     "Light Green": "#F6FAB9",
//     "Light Beige": "#F6EEC9",
//     "Light Blue": "#EEF7FF",
//     "Blue": "#4793AF",
// }

// export class Elem {
//     tag: "Elem";
//     item: string;
//     url: string | null;
//     is_ref: boolean;
//     is_fill: boolean;
//     text_width: Width.t;
//     font: Font;
//     margin: Margin.t;
//     alignment: Alignment.t;
//     width: Width.t;
//     background_color: Color;

//     constructor(item: string, url: string | null, is_ref: boolean, is_fill: boolean, text_width: Width.t, font: Font, margin: Margin.t, alignment: Alignment.t, width: Width.t, background_color: Color) {
//         this.tag = "Elem";
//         this.item = item;
//         this.url = url;
//         this.is_ref = is_ref;
//         this.is_fill = is_fill;
//         this.text_width = text_width;
//         this.font = font;
//         this.margin = margin;
//         this.alignment = alignment;
//         this.width = width;
//         this.background_color = background_color;
//     }

//     static elem(item: string, url: string | null, is_ref: boolean, is_fill: boolean, text_width: Width.t, font: Font, margin: Margin.t, alignment: Alignment.t, width: Width.t, background_color: Color) {
//         return new SectionLayout(
//             new Elem(item, url, is_ref, is_fill, text_width, font, margin, alignment, width, background_color)
//         );
//     }

//     copy() {
//         return new Elem(
//             this.item,
//             this.url,
//             this.is_ref,
//             this.is_fill,
//             Width.copy(this.text_width),
//             this.font,
//             Margin.copy(this.margin),
//             this.alignment,
//             Width.copy(this.width),
//             this.background_color,
//         )
//     }

//     static default_(): Elem {
//         return new Elem("", null, false, false, Width.default_(), Font.default_(), Margin.default_(), Alignment.default_(), Width.default_(), "Transparent");
//     }

//     with_item(item: string): Elem {
//         return new Elem(item, this.url, this.is_ref, this.is_fill, this.text_width, this.font, this.margin, this.alignment, this.width, this.background_color);
//     }

//     as_ref(): Elem {
//         return new Elem(this.item, this.url, true, this.is_fill, this.text_width, this.font, this.margin, this.alignment, this.width, this.background_color);
//     }

//     with_font(font: Font) {
//         return new Elem(this.item, this.url, this.is_ref, this.is_fill, this.text_width, font, this.margin, this.alignment, this.width, this.background_color);
//     }

//     with_url(url: string): Elem {
//         return new Elem(this.item, url, this.is_ref, this.is_fill, this.text_width, this.font, this.margin, this.alignment, this.width, this.background_color);
//     }

//     with_margin(margin: Margin.t): Elem {
//         return new Elem(this.item, this.url, this.is_ref, this.is_fill, this.text_width, this.font, margin, this.alignment, this.width, this.background_color);
//     }

//     with_alignment(alignment: Alignment.t): Elem {
//         return new Elem(this.item, this.url, this.is_ref, this.is_fill, this.text_width, this.font, this.margin, alignment, this.width, this.background_color);
//     }

//     with_width(width: Width.t): Elem {
//         return new Elem(this.item, this.url, this.is_ref, this.is_fill, this.text_width, this.font, this.margin, this.alignment, width, this.background_color);
//     }

//     with_text_width(text_width: Width.t): Elem {
//         return new Elem(this.item, this.url, this.is_ref, this.is_fill, text_width, this.font, this.margin, this.alignment, this.width, this.background_color);
//     }

//     with_is_fill(is_fill: boolean): Elem {
//         return new Elem(this.item, this.url, this.is_ref, is_fill, this.text_width, this.font, this.margin, this.alignment, this.width, this.background_color);
//     }

//     scale_width(w: number): Elem {
//         return this.with_width(Width.scale(this.width, w));
//     }

//     fill_fonts(fonts: FontDict): Elem {
//         const text_width_with_font = this.font.get_width(this.item, fonts);
//         if (this.is_fill) {
//             return this.with_width(Width.absolute(Math.min(Width.get_fixed_unchecked(this.width), text_width_with_font)))
//                 .with_text_width(Width.absolute(text_width_with_font));
//         } else {
//             return this.with_text_width(Width.absolute(text_width_with_font));
//         }
//     }

//     justified_lines(lines: Elem[], font_dict: FontDict): Row[] {
//         const rowLines = [];
//         for (const line of lines.slice(0, -1)) {
//             const words = line.item.split(/\s+/);
//             const row = new Row([], false, line.margin, line.alignment, line.width);
//             words.forEach(word => {
//                 const word_width = this.font.get_width(word, font_dict);
//                 row.elements.push(
//                     new SectionLayout(new Elem(word, null, false, false, Width.absolute(word_width), this.font, Margin.default_(), Alignment.default_(), Width.absolute(word_width), this.background_color)),
//                 );
//             });
//             rowLines.push(row);
//         }
//         rowLines.push(new Row([new SectionLayout(lines[lines.length - 1]).with_alignment("Left")], false, lines[0].margin, "Left", lines[0].width));
//         return rowLines;
//     }

//     break_lines(font_dict: FontDict): LayoutType[] {
//         if (Width.get_fixed_unchecked(this.text_width) <= Width.get_fixed_unchecked(this.width)) {
//             return [this]
//         }

//         const lines: Elem[] = [];

//         // todo: I'm sure this implementation is pretty buggy. Note to future me, fix
//         // this.
//         const words = this.item.split(/\s+/);
//         const widths = words.map((word) => this.font.get_width(word, font_dict));
//         const space_width = this.font.get_width(" ", font_dict);

//         let start = 0;
//         let width = widths[0];
//         const max_width = Width.get_fixed_unchecked(this.width);
//         for (let i = 1; i < words.length; i++) {
//             const candidate_width = width + space_width + widths[i];
//             if (candidate_width > max_width) {
//                 const line = words.slice(start, i).join(" ");
//                 const line_width = this.font.get_width(line, font_dict);
//                 lines.push(
//                     this.with_item(line)
//                         .with_text_width(Width.absolute(line_width)),
//                 );
//                 start = i;
//                 width = widths[i];
//             } else {
//                 width += space_width + widths[i];
//             }
//         }

//         const line = words.slice(start).join(" ");
//         const line_width = this.font.get_width(line, font_dict);
//         lines.push(
//             this.with_item(line)
//                 .with_text_width(Width.absolute(line_width)),
//         );

//         if (this.alignment === "Justified") {
//             return this.justified_lines(lines, font_dict);
//         }

//         return lines;
//     }

//     bound_width(width: number): Elem {
//         if (!Width.is_fill(this.width)) {
//             return this.with_width(Width.absolute(Math.min(Width.get_fixed_unchecked(this.width), width))).with_is_fill(false);
//         } else {
//             return this.with_width(Width.absolute(width)).with_is_fill(true);
//         }
//     }

// }

