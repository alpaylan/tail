import * as Font from "./Font";
import * as Alignment from "./Alignment";
import * as Margin from "./Margin";
import * as Width from "./Width";
import { Binding, Color, PreBindingElem } from "./Layout";
import { FontDict } from "./AnyLayout";
import { ItemContent } from "./Resume";
import * as marked from "marked";
import { match, P } from "ts-pattern";
import { Field } from "./DataSchema";
import { Optional, with_ } from "./Utils";
import { Box } from "./Box";
import * as Resume from "./Resume";

type SpanProps = {
	is_italic: boolean;
	is_bold: boolean;
	is_code: boolean;
	is_link: boolean;
};

function defaultSpanProps(): SpanProps {
	return {
		is_italic: false,
		is_bold: false,
		is_code: false,
		is_link: false,
	};
}

export type Span = {
	is_italic: boolean;
	is_bold: boolean;
	is_code: boolean;
	is_emoji?: boolean;
	emoji_url?: string;
	text: string;
	link: string | null;
	font?: Font.t;
	width?: number;
	line?: number;
	bbox?: Box;
};

export type t = {
	tag: "Elem";
	item: string;
	text: string;
	spans?: Span[];
	url: string | null;
	is_ref: boolean;
	is_fill: boolean;
	is_markdown: boolean;
	text_width: Width.t;
	font: Font.t;
	margin: Margin.t;
	alignment: Alignment.t;
	width: Width.t;
	background_color: Color;
};

type Elem = t;

export function elem(
	item: string,
	url: string | null,
	is_ref: boolean,
	is_fill: boolean,
	is_markdown: boolean,
	text_width: Width.t,
	font: Font.t,
	margin: Margin.t,
	alignment: Alignment.t,
	width: Width.t,
	background_color: Color,
): Elem {
	return {
		tag: "Elem",
		item,
		text: item,
		url,
		is_ref,
		is_fill,
		is_markdown,
		text_width,
		font,
		margin,
		alignment,
		width,
		background_color,
	};
}

export function copy(e: Elem) {
	return { ...e };
}

export function default_(): Elem {
	return {
		tag: "Elem",
		item: "",
		text: "",
		url: null,
		is_ref: false,
		is_fill: false,
		is_markdown: false,
		text_width: Width.default_(),
		font: Font.default_(),
		margin: Margin.default_(),
		alignment: Alignment.default_(),
		width: Width.default_(),
		background_color: "Transparent",
	};
}

export function from(w: Optional<Elem>): Elem {
	return { ...default_(), ...w, text: w.item };
}

export function withItem(e: Elem, item: string): Elem {
	return { ...e, item };
}

export function withUrl(e: Elem, url: string | null): Elem {
	return { ...e, url };
}

export function withIsRef(e: Elem, is_ref: boolean): Elem {
	return { ...e, is_ref };
}

export function asRef(e: Elem): Elem {
	return withIsRef(e, true);
}

export function withIsFill(e: Elem, is_fill: boolean): Elem {
	return { ...e, is_fill };
}

export function withTextWidth(e: Elem, text_width: Width.t): Elem {
	return { ...e, text_width };
}

export function withFont(e: Elem, font: Font.t): Elem {
	return { ...e, font };
}

export function withMargin(e: Elem, margin: Margin.t): Elem {
	return { ...e, margin };
}

export function withAlignment(e: Elem, alignment: Alignment.t): Elem {
	return { ...e, alignment };
}

export function withWidth(e: Elem, width: Width.t): Elem {
	return { ...e, width };
}

export function withBackgroundColor(e: Elem, background_color: Color): Elem {
	return { ...e, background_color };
}

export function scaleWidth(e: Elem, scale: number): Elem {
	return withWidth(e, Width.scale(e.width, scale));
}

type EmojiResolution =
	| { type: "unicode"; value: string }
	| { type: "image"; url: string };

const EMOJI_MAP: Record<string, EmojiResolution> = {
	smile: { type: "unicode", value: "😄" },
	thumbsup: { type: "unicode", value: "👍" },
	party: { type: "unicode", value: "🥳" },
	// If you host custom images:
	geyik: { type: "image", url: "geyik.png" },
};

function resolveEmoji(name: string): EmojiResolution | undefined {
	return EMOJI_MAP[name.toLowerCase()];
}

function escapeHtml(s: string) {
	return s.replace(/[&<>"']/g, (ch) =>
		({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!)
	);
}


const emojiExtension: marked.MarkedExtension = {
	extensions: [
		{
			name: "emoji",
			level: "inline", // inline tokenizer
			start(src: string) {
				// small perf hint for marked: where to start looking
				const i = src.indexOf(":");
				return i < 0 ? undefined : i;
			},
			tokenizer(src: string) {
				// Match :emoji_name:
				const match = /^:([a-z0-9_+\-]+):/i.exec(src);
				if (!match) return;

				const name = match[1];
				const resolved = resolveEmoji(name);

				// If we don't know this emoji, return nothing so marked keeps parsing normally
				console.log(`Found emoji syntax :${name}:, resolved: ${resolved ? "yes" : "no"}`);
				if (!resolved) return;

				// Create a custom token
				const token: marked.Tokens.Generic = {
					type: "emoji",
					raw: match[0],
					name, // custom field
				} as any;

				return token;
			},
			renderer(token: any) {
				const res = resolveEmoji(token.name);
				if (!res) return token.raw; // fallback

				if (res.type === "unicode") {
					// Return the unicode directly—keeps copy/paste and accessibility nice
					return res.value;
				}

				// Image fallback: accessible <img>, no extra styling assumptions
				// alt uses :name: to mimic GitHub-style emoji labels
				console.log(`Rendering custom emoji image for :${token.name}:`);
				return `<img class="emoji" alt=":${escapeHtml(token.name)}:" draggable="false" loading="lazy" decoding="async" src="${res.url}">`;
			},
		},
	],
};

function flatten(ts: marked.Token[], sp: SpanProps): Span[] {
	const spans: Span[] = [];
	for (const t of ts) {
		spans.push(...flattenToken(t, sp));
	}
	return spans;
}

function flattenToken(t: marked.Token, sp: SpanProps): Span[] {
	return match(t)
		.returnType<Span[]>()
		.with({ type: "paragraph", tokens: P.select("tokens") }, ({ tokens }) => {
			return flatten(tokens, sp);
		})
		.with({ type: "strong", tokens: P.select("tokens") }, ({ tokens }) => {
			return flatten(tokens, { ...sp, is_bold: true });
		})
		.with({ type: "em", tokens: P.select("tokens") }, ({ tokens }) => {
			return flatten(tokens, { ...sp, is_italic: true });
		})
		.with({ type: "codespan", text: P.select("text") }, ({ text }) => {
			return [{ ...sp, is_code: true, text, link: null }];
		})
		.with(
			{ type: "text", tokens: P.select("tokens") },
			({ tokens }: { tokens: marked.Token[] }) => {
				return flatten(tokens, sp);
			},
		)
		.with({ type: "text", text: P.select("text") }, ({ text }) => {
			const result: Span[] = [];

			if (text.startsWith(" ")) {
				result.push({ ...sp, text: " ", link: null });
			}

			result.push({ ...sp, text: text.trim(), link: null });

			if (text.endsWith(" ")) {
				result.push({ ...sp, text: " ", link: null });
			} else if (text.endsWith("\n")) {
				result.push({ ...sp, text: "\n", link: null });
			}

			return result;
		})
		.with({ type: "emoji", name: P.select("name") }, ({ name }: { name: string }) => {
			const res = resolveEmoji(name);

			// Graceful fallback (shouldn't happen because tokenizer filters unknowns)
			if (!res) return [{ ...sp, text: `:${name}:`, link: null }];

			if (res.type === "unicode") {
				// simplest: just emit the unicode as plain text
				return [{ ...sp, text: res.value, link: null }];
			} else {
				// If you want image-based emojis, choose how your Span should represent images.
				// extend your Span model (recommended) to support inline images/emojis.
				// Example if you add fields: { is_emoji: true, emoji_url?: string }
				return [{ ...sp, text: "WTF", link: null, is_emoji: true, emoji_url: res.url } as any];
			}
		})
		.otherwise((e: marked.Token) => {
			// console.log(`Unknown token type: ${JSON.stringify(e)}`);
			return [{ ...defaultSpanProps(), text: e.raw, link: null }];
		});
}
export function parseMarkdownItem(item: string): Span[] {
	const spans: Span[] = [];

	marked.use(emojiExtension);

	for (const token of marked.lexer(item)) {
		spans.push(...flatten([token], defaultSpanProps()));
	}

	return spans;
}

export function fillFonts(e: Elem, fonts: FontDict): Elem {
	const simpleSpans = e.is_markdown
		? parseMarkdownItem(e.text)
		: [{ ...defaultSpanProps(), text: e.text, font: e.font, link: null }];
	const spans: Span[] = [];
	for (const span of simpleSpans) {
		if (span.is_emoji) {
			// For simplicity, we use a fixed width for emojis if we have an image URL.
			const widthText = span.emoji_url ? "😀" : span.text;
			const emojiWidth = Font.get_width(e.font, widthText, fonts);
			spans.push({ ...span, font: e.font, width: emojiWidth });
			continue;
		}

		const font = e.is_markdown
			? with_(e.font, {
				style: span.is_italic ? "Italic" : e.font.style,
				weight: span.is_bold ? "Bold" : e.font.weight,
				name: span.is_code ? "SourceCodePro" : e.font.name,
			})
			: e.font;

		if (span.text === " ") {
			const width = Font.get_width(font, " ", fonts);
			spans.push({ ...span, font, width });
			continue;
		}

		if (span.text === "\n\n") {
			spans.push({ ...span, font, width: 0 });
			continue;
		}

		const words = span.text.split(/\s+/);
		words.forEach((word, index) => {
			// Fix html escape characters
			word = word.replace(/&amp;/g, "&");
			word = word.replace(/&lt;/g, "<");
			word = word.replace(/&gt;/g, ">");
			word = word.replace(/&quot;/g, '"');
			word = word.replace(/&apos;/g, "'");
			word = word.replace(/&#39;/g, "'");

			const width = Font.get_width(font, word, fonts);
			spans.push({ ...span, text: word, font, width });
			if (index < words.length - 1) {
				spans.push({
					...span,
					text: " ",
					font,
					width: Font.get_width(font, " ", fonts),
				});
			}
		});
	}

	const text_width = spans.reduce((acc, span) => acc + span.width, 0);

	if (e.is_fill) {
		return with_(e, {
			width: Width.absolute(
				Math.min(Width.get_fixed_unchecked(e.width), text_width),
			),
			text_width: Width.absolute(text_width),
			spans,
		});
	} else {
		return with_(e, { text_width: Width.absolute(text_width), spans });
	}
}

export function boundWidth(e: Elem, width: number): Elem {
	if (!Width.is_fill(e.width)) {
		return withIsFill(
			withWidth(
				e,
				Width.absolute(Math.min(Width.get_fixed_unchecked(e.width), width)),
			),
			false,
		);
	} else {
		return withIsFill(withWidth(e, Width.absolute(width)), true);
	}
}

type WithBinding<T> = {
	[P in keyof T]: WithBinding<T[P]> | Binding;
};

export function bind<T>(t: WithBinding<T>, bindings: Map<string, unknown>): T {
	const result: any = {};
	for (const [key, value] of Object.entries(t)) {
		if (
			value instanceof Object &&
			"binding" in value &&
			typeof value.binding === "string"
		) {
			const bound = bindings.get(value.binding);
			if (bound === undefined) {
				throw new Error(`Binding ${value.binding} not found`);
			}
			result[key] = bound;
		} else if (value instanceof Object) {
			result[key] = bind(value, bindings);
		} else {
			result[key] = value;
		}
	}
	return result;
}

export function instantiate(
	e: PreBindingElem,
	section: Resume.Item,
	fields: Field[],
	bindings: Map<string, unknown>,
): Elem {
	e = bind(e, bindings) as Elem;

	if (!e.is_ref) {
		return e;
	}

	const itemType = fields.find((f) => f.name === e.item);
	if (itemType?.type?.tag === "MarkdownString") {
		e.is_markdown = true;
	}

	const text = section.fields[e.item];

	if (text === undefined) {
		return with_(e, { is_ref: false, text: "" });
	} else {
		if (text.tag === "Url") {
			return with_(e, {
				is_ref: false,
				text: text.value.text,
				url: text.value.url,
			});
		} else {
			return with_(e, { is_ref: false, text: ItemContent.toString(text) });
		}
	}
}
