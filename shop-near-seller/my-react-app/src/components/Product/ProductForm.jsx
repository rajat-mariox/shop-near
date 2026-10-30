import React, { useState, useEffect } from "react";
import {
  createSellerProduct,
  updateSellerProduct,
  getSellerProductDetail,
  getSellerBrands,
} from "../../api/sellerApi";

import icChevronDown from "../../assets/figma/ic-chevron-down.svg";
import { fitImageToSquare } from "../../utils/fitImage";

const FONT = "'Plus Jakarta Sans', sans-serif";

const labelStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#323130",
  lineHeight: 1.5,
  display: "block",
  marginBottom: 6,
};

const fieldStyle = {
  width: "100%",
  height: 52,
  padding: 16,
  border: "1.6px solid #D1D1D1",
  borderRadius: 12,
  fontSize: 14,
  fontFamily: FONT,
  color: "#454545",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

const selectWrapStyle = { position: "relative", width: "100%" };

const chevronStyle = {
  width: 14,
  height: 8,
  position: "absolute",
  right: 16,
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
};

const cardStyle = {
  background: "#fff",
  border: "1px solid #E7E7E7",
  borderRadius: 24,
  padding: 24,
};

const Field = ({ label, children }) => (
  <div style={{ width: "100%" }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

// Backend MAX_PRODUCT_IMAGES ke barabar
const MAX_IMAGES = 10;
// Upload se pehle har photo is size ke square me fit hoti hai
const IMAGE_SIZE = 1500;

const thumbBtn = {
  width: 24,
  height: 24,
  borderRadius: 12,
  border: "none",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  fontSize: 14,
  lineHeight: "24px",
  padding: 0,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const ImageIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6051" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <circle cx="9" cy="9" r="1.6" />
    <path d="M20 15.5l-4.2-4.2L6.5 20" />
  </svg>
);

/**
 * Category ka admin-defined field (Category.attributes) -> input.
 * text/number: input, select: dropdown, multiselect: checkbox chips, boolean: Yes/No.
 */
const DynamicField = ({ attr, value, onChange }) => {
  const label = attr.label + (attr.unit ? ` (${attr.unit})` : "") + (attr.required ? " *" : "");
  if (attr.type === "select" || attr.type === "boolean") {
    const options =
      attr.type === "boolean"
        ? [
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ]
        : (attr.options || []).map((o) => ({ value: o, label: o }));
    const current = value === undefined || value === null ? "" : String(value);
    return (
      <Field label={label}>
        <div style={selectWrapStyle}>
          <select
            value={current}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...fieldStyle, appearance: "none", color: current ? "#454545" : "#737373", cursor: "pointer" }}
          >
            <option value="">Select {attr.label.toLowerCase()}</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <img src={icChevronDown} alt="" style={chevronStyle} />
        </div>
      </Field>
    );
  }
  if (attr.type === "multiselect") {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (opt) =>
      onChange(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt]);
    return (
      <Field label={label}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(attr.options || []).map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                type="button"
                key={opt}
                onClick={() => toggle(opt)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: on ? "1.6px solid #FF6051" : "1.6px solid #D1D1D1",
                  background: on ? "#FFF1EF" : "#fff",
                  color: on ? "#FF6051" : "#454545",
                  fontFamily: FONT,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </Field>
    );
  }
  return (
    <Field label={label}>
      <input
        type={attr.type === "number" ? "number" : "text"}
        value={value === undefined || value === null ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Input " + attr.label.toLowerCase()}
        style={fieldStyle}
      />
    </Field>
  );
};

const ProductForm = ({ productId, categories, onClose, onSaved }) => {
  const isEdit = Boolean(productId);
  const [brands, setBrands] = useState([]);
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  // Category-specific field values: { [attr.key]: value }
  const [attrValues, setAttrValues] = useState({});
  // Ordered photo list: { key, url } (pehle se uploaded) ya { key, file, preview } (nayi).
  // Pehli photo cover hai (app listing me wahi dikhti hai)
  const [images, setImages] = useState([]);
  const [processingImages, setProcessingImages] = useState(false);

  const [form, setForm] = useState({
    productName: "",
    brand: "",
    description: "",
    categoryId: "",
    price: "",
    discountPrice: "",
    stock: "",
    isActive: "true",
  });

  useEffect(() => {
    getSellerBrands()
      .then((r) => {
        const d = r.data?.data || r.data;
        setBrands(d.brands || d || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getSellerProductDetail(productId)
      .then((r) => {
        const p = r.data?.data || r.data;
        setForm({
          productName: p.productName || "",
          brand: p.brand || "",
          description: p.description || "",
          categoryId:
            typeof p.categoryId === "object"
              ? p.categoryId?._id
              : p.categoryId || "",
          price: p.price || "",
          discountPrice: p.discountPrice || "",
          stock: p.stock ?? "",
          isActive: String(p.isActive ?? true),
        });
        setImages(
          (p.productImages || [])
            .map((i) => i.url || i)
            .filter(Boolean)
            .map((url, i) => ({ key: `old-${i}-${url}`, url })),
        );
        setAttrValues(
          Object.fromEntries((p.attributes || []).map((a) => [a.key, a.value])),
        );
      })
      .catch(() => alert("Failed to load product"))
      .finally(() => setLoading(false));
  }, [productId, isEdit]);

  useEffect(() => {
    if (loading || !form.brand || brands.length === 0) return;
    if (!brands.some((b) => b.brand === form.brand)) setShowCustomBrand(true);
  }, [brands, loading, form.brand]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Category badli to uske fields alag honge, purani values matlab ki nahi
    if (name === "categoryId") setAttrValues({});
  };

  // Selected category ke admin-defined fields (backend /seller/categories se aate hain)
  const selectedCategory = categories.find((c) => c._id === form.categoryId);
  const categoryAttrs = selectedCategory?.attributes || [];
  const setAttr = (key, value) => setAttrValues((prev) => ({ ...prev, [key]: value }));

  // Seller kaisi bhi image daale - square mein fit (bina crop, white padding).
  // Ek saath kai photos select ho sakti hain, MAX_IMAGES tak.
  const handleAddImages = async (fileList) => {
    const room = MAX_IMAGES - images.length;
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (files.length > room) {
      alert(`You can add up to ${MAX_IMAGES} photos. Only the first ${room} will be added.`);
    }
    setProcessingImages(true);
    try {
      const added = [];
      for (const file of files.slice(0, room)) {
        // 1500px: app me zoom karne par bhi detail saaf dikhe (pehle 1000px tha)
        const fitted = await fitImageToSquare(file, IMAGE_SIZE);
        added.push({
          key: `new-${Date.now()}-${Math.random()}`,
          file: fitted,
          preview: URL.createObjectURL(fitted),
        });
      }
      setImages((prev) => [...prev, ...added].slice(0, MAX_IMAGES));
    } catch (err) {
      alert(err.message || "Could not process image");
    } finally {
      setProcessingImages(false);
    }
  };

  const removeImage = (key) =>
    setImages((prev) => {
      const img = prev.find((i) => i.key === key);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.key !== key);
    });

  // Photo ko ek jagah aage/peeche karo (dir -1 / +1); index 0 = cover
  const moveImage = (idx, dir) =>
    setImages((prev) => {
      const to = idx + dir;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName || !form.categoryId || !form.price) {
      alert("Please fill in Product Name, Category and Price");
      return;
    }
    const isEmpty = (v) =>
      v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
    const missing = categoryAttrs.find((a) => a.required && isEmpty(attrValues[a.key]));
    if (missing) {
      alert(`Please fill in ${missing.label}`);
      return;
    }
    const fd = new FormData();
    fd.append("productName", form.productName);
    fd.append("brand", form.brand);
    fd.append("description", form.description);
    fd.append("categoryId", form.categoryId);
    fd.append("price", form.price);
    if (form.discountPrice) fd.append("discountPrice", form.discountPrice);
    fd.append("stock", form.stock || 0);
    fd.append("isActive", form.isActive);
    // Sirf current category ke fields bhejo (backend validate karta hai)
    const attrPayload = {};
    categoryAttrs.forEach((a) => {
      if (!isEmpty(attrValues[a.key])) attrPayload[a.key] = attrValues[a.key];
    });
    fd.append("attributes", JSON.stringify(attrPayload));
    // Backend ko final order: purani photo ka url ya "new" (files isi order me)
    fd.append("imageOrder", JSON.stringify(images.map((i) => (i.file ? "new" : i.url))));
    images.forEach((i) => {
      if (i.file) fd.append("productImages", i.file);
    });
    setSaving(true);
    try {
      if (isEdit) {
        await updateSellerProduct(productId, fd);
      } else {
        await createSellerProduct(fd);
      }
      onSaved?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ ...cardStyle, marginBottom: 22, textAlign: "center", color: "#888", fontFamily: FONT }}>
        Loading product...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: 22,
        alignItems: "flex-start",
        flexWrap: "wrap",
        marginBottom: 22,
        fontFamily: FONT,
      }}
    >
      {/* Product Information card */}
      <div
        style={{
          ...cardStyle,
          flex: "1 1 420px",
          maxWidth: 600,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#454545", lineHeight: 1.3 }}>
            Product Information
          </div>
          <div style={{ fontSize: 14, color: "#B0B0B0", lineHeight: 1.5, marginTop: 8 }}>
            {isEdit ? "Update the product details below." : "Fill in the product details below."}
          </div>
        </div>

        <Field label="Product Name">
          <input
            type="text"
            name="productName"
            value={form.productName}
            onChange={handleChange}
            placeholder="Input product name"
            style={fieldStyle}
          />
        </Field>

        <Field label="Brand">
          {showCustomBrand ? (
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Input brand name"
              style={fieldStyle}
              autoFocus
            />
          ) : (
            <div style={selectWrapStyle}>
              <select
                value={form.brand}
                onChange={(e) => {
                  if (e.target.value === "__other__") {
                    setShowCustomBrand(true);
                    setForm((prev) => ({ ...prev, brand: "" }));
                  } else {
                    setForm((prev) => ({ ...prev, brand: e.target.value }));
                  }
                }}
                style={{ ...fieldStyle, appearance: "none", color: form.brand ? "#454545" : "#737373", cursor: "pointer" }}
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b.brand}>{b.brand}</option>
                ))}
                <option value="__other__">Other (not listed)</option>
              </select>
              <img src={icChevronDown} alt="" style={chevronStyle} />
            </div>
          )}
        </Field>

        <div style={{ display: "flex", gap: 16, width: "100%" }}>
          <Field label="Product Category">
            <div style={selectWrapStyle}>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                style={{ ...fieldStyle, appearance: "none", color: form.categoryId ? "#454545" : "#737373", cursor: "pointer" }}
              >
                <option value="">Select product category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.categoryName || c.name}
                  </option>
                ))}
              </select>
              <img src={icChevronDown} alt="" style={chevronStyle} />
            </div>
          </Field>
          <Field label="Price (₹)">
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Input price"
              style={fieldStyle}
            />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 16, width: "100%" }}>
          <Field label="Discount Price (₹)">
            <input
              type="number"
              name="discountPrice"
              value={form.discountPrice}
              onChange={handleChange}
              placeholder="Selling price"
              style={fieldStyle}
            />
          </Field>
          <Field label="Quantity">
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Input stock"
              style={fieldStyle}
            />
          </Field>
        </div>

        <Field label="Status Product">
          <div style={selectWrapStyle}>
            <select
              name="isActive"
              value={form.isActive}
              onChange={handleChange}
              style={{ ...fieldStyle, appearance: "none", cursor: "pointer" }}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <img src={icChevronDown} alt="" style={chevronStyle} />
          </div>
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Product description"
            rows={3}
            style={{ ...fieldStyle, height: "auto", minHeight: 79, resize: "vertical" }}
          />
        </Field>

        {/* Category-specific fields: admin ne category par define kiye */}
        {categoryAttrs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
            <div style={{ borderTop: "1px solid #E7E7E7", paddingTop: 16 }}>
              <div style={{ ...labelStyle, fontSize: 15, marginBottom: 2 }}>
                {selectedCategory?.categoryName || selectedCategory?.name || "Category"} Details
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                Is category ke liye admin ke set kiye fields
              </div>
            </div>
            {categoryAttrs.map((attr) => (
              <DynamicField
                key={attr.key}
                attr={attr}
                value={attrValues[attr.key]}
                onChange={(v) => setAttr(attr.key, v)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Image upload + CTA */}
      <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#454545", lineHeight: 1.3 }}>
              Image Product
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.4, marginTop: 8, color: "#454545" }}>
              <span style={{ fontWeight: 700, color: "#FF6051" }}>Note :</span>
              {" "}Format photos SVG, PNG, or JPG. Add up to {MAX_IMAGES} photos from different
              angles. Images are auto-fitted to a square (nothing gets cropped). The first photo is
              the cover.
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
              gap: 12,
            }}
          >
            {images.map((img, idx) => (
              <div
                key={img.key}
                style={{
                  position: "relative",
                  borderRadius: 8,
                  overflow: "hidden",
                  aspectRatio: "1 / 1",
                  border: idx === 0 ? "2px solid #FF6051" : "1px solid #E7E7E7",
                  background: "#fff",
                }}
              >
                <img
                  src={img.preview || img.url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
                {idx === 0 && (
                  <span
                    style={{
                      position: "absolute",
                      left: 4,
                      top: 4,
                      background: "#FF6051",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 4,
                      padding: "1px 6px",
                    }}
                  >
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  title="Remove photo"
                  onClick={() => removeImage(img.key)}
                  style={{ ...thumbBtn, position: "absolute", right: 4, top: 4 }}
                >
                  ×
                </button>
                <div
                  style={{
                    position: "absolute",
                    left: 4,
                    right: 4,
                    bottom: 4,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    type="button"
                    title="Move left"
                    disabled={idx === 0}
                    onClick={() => moveImage(idx, -1)}
                    style={{ ...thumbBtn, visibility: idx === 0 ? "hidden" : "visible" }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    title="Move right"
                    disabled={idx === images.length - 1}
                    onClick={() => moveImage(idx, 1)}
                    style={{
                      ...thumbBtn,
                      visibility: idx === images.length - 1 ? "hidden" : "visible",
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label
                style={{
                  background: "#FFF2F0",
                  border: "1px dashed #FF6051",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  cursor: processingImages ? "wait" : "pointer",
                  aspectRatio: "1 / 1",
                  textAlign: "center",
                }}
              >
                <input
                  type="file"
                  multiple
                  accept=".svg,.png,.jpg,.jpeg"
                  style={{ display: "none" }}
                  disabled={processingImages}
                  onChange={(e) => {
                    handleAddImages(e.target.files);
                    e.target.value = "";
                  }}
                />
                <ImageIcon />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#737373", lineHeight: 1.3 }}>
                  {processingImages ? "Processing..." : "Add photos"}
                </span>
                <span style={{ fontSize: 11, color: "#999" }}>
                  {images.length}/{MAX_IMAGES}
                </span>
              </label>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#fff",
              color: "#454545",
              border: "1px solid #B0B0B0",
              borderRadius: 12,
              padding: "12px 24px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "#FF6051",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 24px",
              fontWeight: 700,
              fontSize: 14,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              fontFamily: FONT,
            }}
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
