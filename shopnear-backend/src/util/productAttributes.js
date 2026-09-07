/**
 * Category-wise dynamic product fields.
 * Admin category par fields define karta hai (Category.attributes), seller product
 * banate waqt unki values bharta hai (Product.attributes). Yahan dono ka
 * normalize + validate hota hai.
 */
const Category = require("../models/Catagory");
const Product = require("../models/Product");

const ATTR_TYPES = ["text", "number", "select", "multiselect", "boolean"];
const OPTION_TYPES = ["select", "multiselect"];

const slugify = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const parseMaybeJson = (input) => {
  if (typeof input !== "string") return input;
  try {
    return JSON.parse(input);
  } catch (e) {
    throw new Error("attributes must be valid JSON");
  }
};

/**
 * Admin category form se aaya attributes list (JSON string ya array) saaf karo.
 * Har field: { key, label, type, options[], required, unit }
 */
const normalizeCategoryAttributes = (input) => {
  const list = parseMaybeJson(input);
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.map((a, i) => {
    const label = String(a.label || "").trim();
    if (!label) throw new Error("Field " + (i + 1) + ": label is required");
    const type = ATTR_TYPES.includes(a.type) ? a.type : "text";
    let key = slugify(a.key || label) || "field_" + (i + 1);
    while (seen.has(key)) key = key + "_" + (i + 1);
    seen.add(key);
    const rawOptions = Array.isArray(a.options)
      ? a.options
      : String(a.options || "").split(",");
    const options = OPTION_TYPES.includes(type)
      ? rawOptions.map((o) => String(o).trim()).filter(Boolean)
      : [];
    if (OPTION_TYPES.includes(type) && options.length === 0) {
      throw new Error('Field "' + label + '": add at least one option');
    }
    return {
      key,
      label,
      type,
      options,
      required: a.required === true || a.required === "true",
      unit: String(a.unit || "").trim(),
    };
  });
};

/**
 * Seller product form se aaye values ko category ke attributes ke against
 * validate karke store-ready list banao: [{ key, label, type, unit, value }]
 * Input: { key: value } object ya [{ key, value }] array (JSON string bhi chalega).
 */
const buildProductAttributes = (categoryAttrs, input) => {
  let values = parseMaybeJson(input);
  if (Array.isArray(values)) {
    values = Object.fromEntries(values.map((v) => [v.key, v.value]));
  }
  if (!values || typeof values !== "object") values = {};

  const out = [];
  for (const attr of categoryAttrs || []) {
    let v = values[attr.key];
    const empty =
      v === undefined ||
      v === null ||
      v === "" ||
      (Array.isArray(v) && v.length === 0);
    if (empty) {
      if (attr.required) throw new Error(attr.label + " is required");
      continue;
    }
    switch (attr.type) {
      case "number":
        v = Number(v);
        if (Number.isNaN(v)) throw new Error(attr.label + " must be a number");
        break;
      case "boolean":
        v = v === true || v === "true" || v === 1 || v === "1";
        break;
      case "select":
        v = String(v);
        if (!attr.options.includes(v)) {
          throw new Error(attr.label + ': invalid option "' + v + '"');
        }
        break;
      case "multiselect": {
        v = (Array.isArray(v) ? v : String(v).split(","))
          .map((x) => String(x).trim())
          .filter(Boolean);
        const bad = v.find((x) => !attr.options.includes(x));
        if (bad) throw new Error(attr.label + ': invalid option "' + bad + '"');
        break;
      }
      default:
        v = String(v).trim();
    }
    out.push({
      key: attr.key,
      label: attr.label,
      type: attr.type,
      unit: attr.unit || "",
      value: v,
    });
  }
  return out;
};

/**
 * Controller helper: categoryId (ya productId se purani category) uthao aur
 * seller ke bheje attributes validate karo.
 */
const resolveProductAttributes = async ({ categoryId, productId, input }) => {
  let catId = categoryId;
  if (!catId && productId) {
    const existing = await Product.findById(productId).select("categoryId");
    catId = existing && existing.categoryId;
  }
  if (!catId) return [];
  const category = await Category.findById(catId).select("attributes");
  return buildProductAttributes((category && category.attributes) || [], input);
};

module.exports = {
  ATTR_TYPES,
  normalizeCategoryAttributes,
  buildProductAttributes,
  resolveProductAttributes,
};
