import React, { useState, useEffect, useRef } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory as deleteCategoryApi,
} from "../../api/adminApi";

const EMPTY_CAT = { categoryName: "", description: "", rank: 1, attributes: [] };

// Category-wise product fields: seller ke Add Product form me category select
// karte hi ye fields dikhte hain. Admin yahin define karta hai, kuch fixed nahi.
const ATTR_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown (single)" },
  { value: "multiselect", label: "Multi-select" },
  { value: "boolean", label: "Yes / No" },
];
const EMPTY_ATTR = { label: "", type: "text", options: "", required: false, unit: "" };

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  // editId null = add mode, warna us category ko edit kar rahe hain
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newCat, setNewCat] = useState(EMPTY_CAT);
  const [preview, setPreview] = useState("");
  const fileRef = useRef(null);
  const limit = 10;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories({
        page,
        limit,
        search: search || undefined,
      });
      const d = res.data?.data || res.data;
      setCategories(d.categories || d.category || d.data || []);
      setTotal(d.total || d.total_categories || 0);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchCategories();
  };

  const handleToggle = async (id) => {
    try {
      await toggleCategoryStatus(id);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategoryApi(id);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setNewCat(EMPTY_CAT);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
    setAddModal(true);
  };

  const openEdit = (c) => {
    setEditId(c._id);
    setNewCat({
      categoryName: c.categoryName || "",
      description: c.description || "",
      rank: c.rank || 1,
      // options array ko comma string me dikhate hain, save par wapas split hota hai
      attributes: (c.attributes || []).map((a) => ({
        key: a.key || "",
        label: a.label || "",
        type: a.type || "text",
        options: Array.isArray(a.options) ? a.options.join(", ") : a.options || "",
        required: !!a.required,
        unit: a.unit || "",
      })),
    });
    setPreview(c.image || "");
    if (fileRef.current) fileRef.current.value = "";
    setAddModal(true);
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSave = async () => {
    if (!newCat.categoryName || saving) return;
    setSaving(true);
    try {
      // Image ek file hai, isliye poora form multipart me jaata hai
      const fd = new FormData();
      fd.append("categoryName", newCat.categoryName);
      fd.append("description", newCat.description || "");
      fd.append("rank", newCat.rank || 1);
      // Dynamic product fields: label khali wali rows chhod do
      const attrs = (newCat.attributes || [])
        .filter((a) => a.label && a.label.trim())
        .map((a) => ({
          key: a.key || undefined,
          label: a.label.trim(),
          type: a.type || "text",
          options: (a.options || "")
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean),
          required: !!a.required,
          unit: (a.unit || "").trim(),
        }));
      fd.append("attributes", JSON.stringify(attrs));
      const file = fileRef.current?.files?.[0];
      if (file) fd.append("image", file);

      if (editId) {
        await updateCategory(editId, fd);
      } else {
        await createCategory(fd);
      }
      setAddModal(false);
      setEditId(null);
      setNewCat(EMPTY_CAT);
      setPreview("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const addAttr = () =>
    setNewCat((c) => ({ ...c, attributes: [...(c.attributes || []), { ...EMPTY_ATTR }] }));
  const updateAttr = (i, patch) =>
    setNewCat((c) => ({
      ...c,
      attributes: c.attributes.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
    }));
  const removeAttr = (i) =>
    setNewCat((c) => ({ ...c, attributes: c.attributes.filter((_, idx) => idx !== i) }));

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="page-content">
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 4,
          color: "#2A2A2A",
        }}
      >
        Categories
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <input
            className="search-input"
            placeholder="Search category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-outline btn-sm" onClick={handleSearch}>
              Search
            </button>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              + Add Category
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Rank</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                  >
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id}>
                    <td>
                      {c.image ? (
                        <img
                          src={c.image}
                          alt=""
                          style={{
                            width: 44,
                            height: 44,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #eee",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            background: "#f4f4f4",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#bbb",
                            fontSize: 11,
                          }}
                        >
                          No
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.categoryName}</td>
                    <td
                      style={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.description || "—"}
                    </td>
                    <td>{c.rank}</td>
                    <td>
                      <span
                        className={`badge ${c.isActive ? "badge-green" : "badge-grey"}`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div className="action-icons">
                        <label
                          className="toggle"
                          title={c.isActive ? "Deactivate" : "Activate"}
                        >
                          <input
                            type="checkbox"
                            checked={c.isActive}
                            onChange={() => handleToggle(c._id)}
                          />
                          <span className="slider" />
                        </label>
                        <div
                          className="action-icon"
                          title="Edit"
                          onClick={() => openEdit(c)}
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3Z"
                              stroke="#2f80ed"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div
                          className="action-icon"
                          title="Delete"
                          onClick={() => handleDelete(c._id)}
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"
                              stroke="#e74c3c"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ←
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                className={p === page ? "active" : ""}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ),
          )}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            →
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={() => setAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              {editId ? "Edit Category" : "Add Category"}
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label className="form-label">Category Name *</label>
                <input
                  className="form-input"
                  value={newCat.categoryName}
                  onChange={(e) =>
                    setNewCat({ ...newCat, categoryName: e.target.value })
                  }
                  placeholder="e.g. Electronics"
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  value={newCat.description}
                  onChange={(e) =>
                    setNewCat({ ...newCat, description: e.target.value })
                  }
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="form-label">Rank</label>
                <input
                  className="form-input"
                  type="number"
                  value={newCat.rank}
                  onChange={(e) =>
                    setNewCat({
                      ...newCat,
                      rank: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div>
                <label className="form-label">
                  Image {editId ? "(choose a file only to replace it)" : ""}
                </label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt=""
                      style={{
                        width: 56,
                        height: 56,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #eee",
                      }}
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    onChange={handlePickImage}
                  />
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                  App ke home screen par category chip me yahi image dikhti hai.
                </div>
              </div>

              {/* Product fields for this category */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Product Fields
                  </label>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addAttr}>
                    + Add Field
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
                  Seller jab is category ka product add karega to ye fields form me
                  dikhenge (jaise Size, Material, Warranty). Dropdown ke options comma
                  se alag likhein.
                </div>
                {(newCat.attributes || []).length === 0 ? (
                  <div style={{ fontSize: 13, color: "#aaa", padding: "8px 0" }}>
                    Koi extra field nahi. Sirf common fields (name, price, stock, description) dikhenge.
                  </div>
                ) : null}
                <div style={{ display: "grid", gap: 10 }}>
                  {(newCat.attributes || []).map((a, i) => {
                    const needsOptions = a.type === "select" || a.type === "multiselect";
                    return (
                      <div
                        key={i}
                        style={{
                          border: "1px solid #e7e7e7",
                          borderRadius: 10,
                          padding: 10,
                          display: "grid",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            className="form-input"
                            style={{ flex: 2 }}
                            placeholder="Field name (e.g. Size)"
                            value={a.label}
                            onChange={(e) => updateAttr(i, { label: e.target.value })}
                          />
                          <select
                            className="form-input"
                            style={{ flex: 1.4 }}
                            value={a.type}
                            onChange={(e) => updateAttr(i, { type: e.target.value })}
                          >
                            {ATTR_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Remove field"
                            onClick={() => removeAttr(i)}
                          >
                            X
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {needsOptions ? (
                            <input
                              className="form-input"
                              style={{ flex: 2 }}
                              placeholder="Options, comma separated (e.g. S, M, L, XL)"
                              value={a.options}
                              onChange={(e) => updateAttr(i, { options: e.target.value })}
                            />
                          ) : (
                            <input
                              className="form-input"
                              style={{ flex: 2 }}
                              placeholder="Unit (optional, e.g. kg, cm, months)"
                              value={a.unit}
                              onChange={(e) => updateAttr(i, { unit: e.target.value })}
                            />
                          )}
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 13,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={!!a.required}
                              onChange={(e) => updateAttr(i, { required: e.target.checked })}
                            />
                            Required
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 24,
              }}
            >
              <button
                className="btn btn-outline"
                onClick={() => setAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : editId ? "Save Changes" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
