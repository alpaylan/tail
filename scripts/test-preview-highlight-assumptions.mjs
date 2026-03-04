import assert from "node:assert/strict";
import * as Elem from "../cvdl-ts/dist/Elem.js";
import * as Width from "../cvdl-ts/dist/Width.js";
import * as Font from "../cvdl-ts/dist/Font.js";
import * as Margin from "../cvdl-ts/dist/Margin.js";
import * as Resume from "../cvdl-ts/dist/Resume.js";

const refElem = Elem.elem(
	"organization",
	null,
	true,
	false,
	false,
	Width.default_(),
	Font.default_(),
	Margin.default_(),
	"Left",
	Width.default_(),
	"Transparent",
);

const item = {
	id: "item-1",
	fields: {
		organization: Resume.ItemContent.string("OpenAI"),
	},
};

const fields = [{ name: "organization", type: { tag: "String" } }];
const instantiated = Elem.instantiate(refElem, item, fields, new Map());

assert.equal(instantiated.is_ref, false);
assert.equal(instantiated.item, "organization");
assert.equal(instantiated.text, "OpenAI");

console.log("OK: instantiated elements keep `item` but clear `is_ref`.");
