import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useProductStore from "../../store/productStore";
import useCategoryStore from "../../store/categoryStore";
import ProductForm from "./ProductForm";

import icSearch from "../../assets/figma/ic-search-input.svg";
import icFilterList from "../../assets/figma/ic-filter-list.svg";
import icExport from "../../assets/figma/ic-export.svg";
import icAdd from "../../assets/figma/ic-add.svg";
import icCheckbox from "../../assets/figma/ic-checkbox.svg";
import icEye from "../../assets/figma/ic-eye.svg";
import icEdit from "../../assets/figma/ic-edit.svg";
import icDelete from "../../assets/figma/ic-delete.svg";
import icCaretUp from "../../assets/figma/caret-up.svg";
import icCaretDown from "../../assets/figma/caret-down.svg";
import icCrumbArrow from "../../assets/figma/ic-crumb-arrow.svg";
import icSelectDown from "../../assets/figma/ic-select-down.svg";
import icPageNext from "../../assets/figma/ic-page-next.svg";

const FONT = "'Plus Jakarta Sans', sans-serif";

const STOCK_OPTIONS = [
  { label: "All", value: "" },
  { label: "In Stock", value: "1" },
  { label: "Out of Stock", value: "0" },
];

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd}/${yy} at ${h}:${min} ${ampm}`;
};

const Checkbox = ({ checked, onChange }) => (
  <div
    onClick={onChange}
    style={{
      width: 24,
      height: 24,
      cursor: "pointer",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {checked ? (
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          background: "#FF6051",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
    ) : (
      <img src={icCheckbox} alt="" style={{ width: 24, height: 24 }} />
    )}
  </div>
);

const Sorter = () => (
  <span
    style={{
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
      marginLeft: 4,
      flexShrink: 0,
    }}
  >
    <img src={icCaretUp} alt="" style={{ width: 11, height: 5 }} />
    <img src={icCaretDown} alt="" style={{ width: 11, height: 5 }} />
  </span>
);

const ChipStatus = ({ inStock }) => (
  <span
    style={{
      display: "inline-block",
      padding: "6px 8px",
      borderRadius: 10,
      background: inStock ? "#B2FFB4" : "#FFDCDC",
      color: inStock ? "#04910C" : "#FF0000",
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.4,
      whiteSpace: "nowrap",
    }}
  >
    {inStock ? "In Stock" : "Out of Stock"}
  </span>
);

const outlineBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 8px 8px 12px",
  border: "1px solid #B0B0B0",
  borderRadius: 12,
  background: "#fff",
  fontFamily: FONT,
  fontSize: 12,
  fontWeight: 700,
  color: "#454545",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const thStyle = {
  padding: 14,
  background: "#F6F6F6",
  borderBottom: "1px solid #E7E7E7",
  textAlign: "left",
  fontWeight: 500,
  fontSize: 14,
  color: "#454545",
  whiteSpace: "nowrap",
  lineHeight: 1.5,
};

const tdStyle = {
  padding: 12,
  borderBottom: "1px solid #E7E7E7",
  fontSize: 14,
  color: "#454545",
  verticalAlign: "middle",
  lineHeight: 1.5,
};

const selectStyle = {
  padding: "8px 12px",
  border: "1px solid #D1D1D1",
  borderRadius: 8,
  fontSize: 13,
  color: "#454545",
  background: "#fff",
  cursor: "pointer",
  minWidth: 0,
  flex: "1 1 140px",
  fontFamily: FONT,
};

const inputStyle = {
  padding: "8px 12px",
  border: "1px solid #D1D1D1",
  borderRadius: 8,
  fontSize: 13,
  color: "#454545",
  background: "#fff",
  minWidth: 0,
  flex: "1 1 100px",
  fontFamily: FONT,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#737373",
  marginBottom: 4,
  display: "block",
};

const Product = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    products, total, page, limit, loading, search,
    categoryId, stockFilter, statusFilter, minPrice, maxPrice, startDate, endDate,
    fetchProducts, setPage, setSearch, searchProducts, setFilter, clearFilters, removeProduct,
  } = useProductStore();

  const { categories, fetchCategories } = useCategoryStore();

  const [showFilters, setShowFilters] = React.useState(false);
  const [selected, setSelected] = React.useState([]);
  // null = closed, { id: null } = add, { id: "<productId>" } = edit
  const [editor, setEditor] = React.useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    const wantsAdd =
      location.state?.openAdd ||
      new URLSearchParams(location.search).get("add") === "1";
    if (wantsAdd) {
      setEditor({ id: null });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.search]);

  const openEditor = (id = null) => {
    setEditor({ id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = () => searchProducts();

  const activeFilterCount = [categoryId, stockFilter, statusFilter, minPrice, maxPrice, startDate, endDate].filter(Boolean).length;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await removeProduct(id);
    } catch { /* ignore */ }
  };

  const handleExport = () => {
    if (!products.length) return;
    const rows = products.map((p) => [
      p._id,
      `"${(p.productName || "").replace(/"/g, '""')}"`,
      p.discountPrice || p.price || "",
      p.stock ?? 0,
      typeof p.categoryId === "object" ? p.categoryId?.categoryName || "" : "",
      p.stock > 0 ? "In Stock" : "Out of Stock",
    ]);
    const csv = ["Id,Name,Price,Stock,Category,Status", ...rows.map((r) => r.join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const allSelected = products.length > 0 && selected.length === products.length;
  const toggleSelectAll = () =>
    setSelected(allSelected ? [] : products.map((p) => p._id));

  const totalPages = Math.ceil(total / limit) || 1;
  const activeCategory = categories.find((c) => c._id === categoryId);

  return (
    <div style={{ padding: 32, fontFamily: FONT }}>
      {/* Header + breadcrumbs */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: "#2A2A2A", lineHeight: 1.3 }}>
          Product
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <span
            style={{ fontSize: 14, color: "#888", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Dashboard
          </span>
          <img src={icCrumbArrow} alt="" style={{ width: 7, height: 11 }} />
          <span
            style={{
              fontSize: 14,
              color: activeCategory || editor ? "#888" : "#FF6051",
              fontWeight: activeCategory || editor ? 400 : 700,
              cursor: editor ? "pointer" : "default",
            }}
            onClick={() => editor && setEditor(null)}
          >
            Product
          </span>
          {activeCategory && (
            <>
              <img src={icCrumbArrow} alt="" style={{ width: 7, height: 11 }} />
              <span style={{ fontSize: 14, color: editor ? "#888" : "#FF6051", fontWeight: editor ? 400 : 700 }}>
                {activeCategory.categoryName || activeCategory.name}
              </span>
            </>
          )}
          {editor && (
            <>
              <img src={icCrumbArrow} alt="" style={{ width: 7, height: 11 }} />
              <span style={{ fontSize: 14, color: "#FF6051", fontWeight: 700 }}>
                {editor.id ? "Edit Product" : "Add Product"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Inline Add / Edit product form (Figma: Add Product) */}
      {editor && (
        <ProductForm
          productId={editor.id}
          categories={categories}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            fetchProducts();
          }}
        />
      )}

      {/* Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E7E7E7",
          padding: 24,
        }}
      >
        {/* Toolbar: search + CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "8px 16px",
              border: "1px solid #B0B0B0",
              borderRadius: 12,
              flex: "1 1 320px",
              maxWidth: 500,
              background: "#fff",
            }}
          >
            <input
              type="text"
              placeholder="Search for id, name product"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: 14,
                color: "#454545",
                fontFamily: FONT,
                background: "transparent",
              }}
            />
            <img
              src={icSearch}
              alt=""
              onClick={handleSearch}
              style={{ width: 20, height: 20, cursor: "pointer", flexShrink: 0 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                ...outlineBtnStyle,
                background: showFilters ? "#FFF2F0" : "#fff",
                borderColor: showFilters ? "#FF6051" : "#B0B0B0",
                color: showFilters ? "#FF6051" : "#454545",
              }}
            >
              Filter
              <img src={icFilterList} alt="" style={{ width: 20, height: 12 }} />
              {activeFilterCount > 0 && (
                <span
                  style={{
                    background: "#FF6051",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button onClick={handleExport} style={outlineBtnStyle}>
              Export
              <img
                src={icExport}
                alt=""
                style={{ width: 18, height: 18, transform: "rotate(90deg) scaleY(-1)" }}
              />
            </button>

            <button
              onClick={() => openEditor(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 8px 8px 12px",
                background: "#FF6051",
                border: "none",
                borderRadius: 12,
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              New Product
              <span
                style={{
                  width: 24,
                  height: 24,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={icAdd} alt="" style={{ width: 14, height: 14 }} />
              </span>
            </button>
          </div>
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              border: "1px solid #D1D1D1",
              borderRadius: 14,
              marginBottom: 24,
              overflowX: "auto",
            }}
          >
            {[{ _id: "", categoryName: "All" }, ...categories].map((c) => {
              const active = (categoryId || "") === c._id;
              return (
                <div
                  key={c._id || "all"}
                  onClick={() => setFilter("categoryId", c._id)}
                  style={{
                    flex: "1 0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 6px",
                    borderRadius: 8,
                    background: active ? "#FFF2F0" : "transparent",
                    color: active ? "#FF6051" : "#737373",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    lineHeight: 1.5,
                  }}
                >
                  {c.categoryName || c.name}
                </div>
              );
            })}
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div
            style={{
              background: "#F6F6F6",
              border: "1px solid #E7E7E7",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "#454545" }}>
                Filter Products
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#FF6051",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: FONT,
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 160px" }}>
                <label style={labelStyle}>Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setFilter("categoryId", e.target.value)}
                  style={{ ...selectStyle, width: "100%", flex: "unset" }}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.categoryName || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: "1 1 130px" }}>
                <label style={labelStyle}>Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setFilter("stockFilter", e.target.value)}
                  style={{ ...selectStyle, width: "100%", flex: "unset" }}
                >
                  {STOCK_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: "1 1 130px" }}>
                <label style={labelStyle}>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setFilter("statusFilter", e.target.value)}
                  style={{ ...selectStyle, width: "100%", flex: "unset" }}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: "1 1 200px" }}>
                <label style={labelStyle}>Price Range</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setFilter("minPrice", e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setFilter("maxPrice", e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              </div>

              <div style={{ flex: "1 1 240px" }}>
                <label style={labelStyle}>Date Added</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setFilter("startDate", e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setFilter("endDate", e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
            Loading...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 48, borderTopLeftRadius: 16, padding: 12 }}>
                    <Checkbox checked={allSelected} onChange={toggleSelectAll} />
                  </th>
                  <th style={{ ...thStyle, minWidth: 230 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Product <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 100 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Price <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 90 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      QTY <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 120 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Category <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 140 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Date <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 110 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      State <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 120, borderTopRightRadius: 16 }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 32, color: "#B0B0B0" }}>
                      No products found
                    </td>
                  </tr>
                )}
                {products.map((p) => {
                  const img = p.productImages?.[0]?.url || "";
                  const catName =
                    typeof p.categoryId === "object"
                      ? p.categoryId?.categoryName
                      : "";
                  const shortId = (p._id || "").slice(-6).toUpperCase();
                  return (
                    <tr key={p._id}>
                      <td style={{ ...tdStyle, width: 48 }}>
                        <Checkbox
                          checked={selected.includes(p._id)}
                          onChange={() => toggleSelect(p._id)}
                        />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 6,
                              background: "#F6F6F6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {img ? (
                              <img
                                src={img}
                                alt=""
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: 4,
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div style={{ width: 38, height: 38, borderRadius: 4, background: "#E7E7E7" }} />
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 12, color: "#1A71F6", lineHeight: 1.4 }}>
                              {shortId}
                            </span>
                            <span style={{ fontSize: 14, color: "#454545", lineHeight: 1.5 }}>
                              {p.productName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        {p.discountPrice ? (
                          <>
                            ₹{p.discountPrice}
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#B0B0B0",
                                marginLeft: 4,
                                fontSize: 12,
                              }}
                            >
                              ₹{p.price}
                            </span>
                          </>
                        ) : (
                          <>₹{p.price}</>
                        )}
                      </td>
                      <td style={tdStyle}>{p.stock ?? 0}</td>
                      <td style={tdStyle}>{catName || "—"}</td>
                      <td style={tdStyle}>{formatDate(p.createdAt)}</td>
                      <td style={tdStyle}>
                        <ChipStatus inStock={(p.stock ?? 0) > 0} />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img
                            src={icEye}
                            alt="View"
                            title="View"
                            onClick={() => openEditor(p._id)}
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                          />
                          <img
                            src={icEdit}
                            alt="Edit"
                            title="Edit"
                            onClick={() => openEditor(p._id)}
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                          />
                          <img
                            src={icDelete}
                            alt="Delete"
                            title="Delete"
                            onClick={() => handleDelete(p._id)}
                            style={{ width: 15, height: 16, cursor: "pointer" }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 14, display: "flex", gap: 3 }}>
            {total > 0 ? (
              <>
                <span style={{ color: "#FF6051", fontWeight: 700 }}>
                  {(page - 1) * limit + 1}
                </span>
                <span style={{ color: "#737373" }}>-</span>
                <span style={{ color: "#737373" }}>{Math.min(page * limit, total)}</span>
                <span style={{ color: "#737373" }}>of {totalPages} Pages</span>
              </>
            ) : (
              <span style={{ color: "#737373" }}>0 products</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <span style={{ fontSize: 14, color: "#454545" }}>The page on</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  padding: "4px 6px 4px 8px",
                  border: "1px solid #B0B0B0",
                  borderRadius: 8,
                  position: "relative",
                }}
              >
                <select
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 14,
                    color: "#454545",
                    fontFamily: FONT,
                    appearance: "none",
                    paddingRight: 20,
                    cursor: "pointer",
                  }}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <img
                  src={icSelectDown}
                  alt=""
                  style={{
                    width: 10,
                    height: 6,
                    position: "absolute",
                    right: 8,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{
                  padding: "4px 6px",
                  border: "1px solid #B0B0B0",
                  borderRadius: 8,
                  background: "#fff",
                  cursor: page > 1 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: page > 1 ? 1 : 0.4,
                }}
              >
                <img
                  src={icPageNext}
                  alt="Previous"
                  style={{ width: 8, height: 14, transform: "scaleX(-1)", margin: 3 }}
                />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                style={{
                  padding: "4px 6px",
                  border: "1px solid #B0B0B0",
                  borderRadius: 8,
                  background: "#fff",
                  cursor: page < totalPages ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: page < totalPages ? 1 : 0.4,
                }}
              >
                <img src={icPageNext} alt="Next" style={{ width: 8, height: 14, margin: 3 }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
