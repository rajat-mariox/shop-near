import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSellerStore from "../../store/sellerStore";
import useCategoryStore from "../../store/categoryStore";

const TABS = [
  { label: "All Sellers" },
  { label: "Active" },
  { label: "Inactive" },
];

const statusText = (s) => {
  if (s.status === "pending_approval" || s.status === "pending_profile")
    return "Pending";
  if (s.status === "rejected") return "Rejected";
  if (!s.isActive) return "Inactive";
  return "Active";
};

const statusBadge = (s) => {
  const t = typeof s === "string" ? s : statusText(s);
  const map = {
    Active: "badge-green",
    Inactive: "badge-grey",
    Pending: "badge-orange",
    Rejected: "badge-red",
  };
  return map[t] || "badge-grey";
};

const INITIAL_FORM = {
  fullName: "",
  email: "",
  mobile: "",
  shopName: "",
  shopDescription: "",
  businessType: "",
  categories: [],
  address: "",
  street: "",
  city: "",
  pincode: "",
  gstNumber: "",
  openingTime: "",
  closingTime: "",
  weeklyOff: "",
};

const SellerList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    sellers, total, loading, page, activeTab, search,
    setPage, setActiveTab, setSearch, searchSellers,
    fetchSellers, toggleStatus, remove, create,
  } = useSellerStore();

  const { categories: categoryList, fetchCategories } = useCategoryStore();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearch(urlSearch);
      searchSellers();
    } else {
      fetchSellers();
    }
    fetchCategories();
  }, []);

  const handleToggle = async (id) => {
    try { await toggleStatus(id); } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this seller?")) return;
    try { await remove(id); } catch (err) { console.error(err); }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (catId) => {
    setForm((prev) => {
      const cats = prev.categories.includes(catId)
        ? prev.categories.filter((c) => c !== catId)
        : [...prev.categories, catId];
      return { ...prev, categories: cats };
    });
  };

  const handleAddSeller = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.mobile || form.mobile.length < 10) {
      setFormError("Valid mobile number is required");
      return;
    }
    if (!form.fullName.trim()) {
      setFormError("Full name is required");
      return;
    }
    if (!form.shopName.trim()) {
      setFormError("Shop name is required");
      return;
    }

    setSaving(true);
    try {
      await create(form);
      setShowModal(false);
      setForm(INITIAL_FORM);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Failed to create seller";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / (useSellerStore.getState().limit)) || 1;

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: 8,
    fontSize: 14,
    background: "#fff",
  };

  const labelStyle = {
    display: "block",
    fontWeight: 600,
    fontSize: 13,
    color: "#444",
    marginBottom: 4,
  };

  return (
    <div className="page-content">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 600, color: "#2A2A2A" }}>
          Sellers
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add Seller
        </button>
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
            placeholder="Search seller by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchSellers()}
          />
          <button className="btn btn-outline btn-sm" onClick={searchSellers}>
            Search
          </button>
        </div>

        <div className="tab-bar">
          {TABS.map((t, i) => (
            <div
              key={t.label}
              className={`tab-item ${activeTab === i ? "active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {t.label}
            </div>
          ))}
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Business Type</th>
                <th>Phone</th>
                <th>Status</th>
                <th>City</th>
                <th>Joined</th>
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
              ) : sellers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                  >
                    No sellers found
                  </td>
                </tr>
              ) : (
                sellers.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <img
                          src={
                            s.ownerImage ||
                            s.shopLogo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(s.shopName || s.fullName || "S")}&background=FF6051&color=fff`
                          }
                          alt=""
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {s.shopName || s.fullName || "\u2014"}
                          </div>
                          <div style={{ fontSize: 12, color: "#888" }}>
                            {s.email || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{s.businessType || "\u2014"}</td>
                    <td>{s.mobile || "\u2014"}</td>
                    <td>
                      <span className={`badge ${statusBadge(s)}`}>
                        {statusText(s)}
                      </span>
                    </td>
                    <td>{s.city || "\u2014"}</td>
                    <td>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleDateString()
                        : "\u2014"}
                    </td>
                    <td>
                      <div className="action-icons">
                        <div
                          className="action-icon"
                          title="View"
                          onClick={() => navigate(`/sellers/${s._id}`)}
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
                              stroke="#888"
                              strokeWidth="1.5"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              stroke="#888"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                        {s.status === "approved" && (
                          <label
                            className="toggle"
                            title={s.isActive ? "Deactivate" : "Activate"}
                          >
                            <input
                              type="checkbox"
                              checked={s.isActive}
                              onChange={() => handleToggle(s._id)}
                            />
                            <span className="slider" />
                          </label>
                        )}
                        <div
                          className="action-icon"
                          title="Delete"
                          onClick={() => handleDelete(s._id)}
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

      {/* ─── Add Seller Modal ─── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-box"
            style={{ minWidth: 520, maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700 }}>Add New Seller</div>
              <div
                style={{ cursor: "pointer", fontSize: 22, color: "#888" }}
                onClick={() => setShowModal(false)}
              >
                x
              </div>
            </div>

            {formError && (
              <div
                style={{
                  background: "#fff4f2",
                  color: "#e74c3c",
                  padding: "10px 14px",
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSeller}>
              {/* Owner Info */}
              <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 12 }}>
                Owner Information
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    style={inputStyle}
                    name="fullName"
                    value={form.fullName}
                    onChange={handleFormChange}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Mobile Number *</label>
                  <input
                    style={inputStyle}
                    name="mobile"
                    value={form.mobile}
                    onChange={handleFormChange}
                    placeholder="10-digit mobile"
                    maxLength={10}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={inputStyle}
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="Email address"
                    type="email"
                  />
                </div>
              </div>

              {/* Shop Details */}
              <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 12 }}>
                Shop Details
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Shop Name *</label>
                  <input
                    style={inputStyle}
                    name="shopName"
                    value={form.shopName}
                    onChange={handleFormChange}
                    placeholder="Shop name"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Business Type</label>
                  <input
                    style={inputStyle}
                    name="businessType"
                    value={form.businessType}
                    onChange={handleFormChange}
                    placeholder="e.g. Fashion, Grocery"
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Shop Description</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                    name="shopDescription"
                    value={form.shopDescription}
                    onChange={handleFormChange}
                    placeholder="Brief description of the shop"
                  />
                </div>
                <div>
                  <label style={labelStyle}>GST Number</label>
                  <input
                    style={inputStyle}
                    name="gstNumber"
                    value={form.gstNumber}
                    onChange={handleFormChange}
                    placeholder="GST number"
                  />
                </div>
              </div>

              {/* Category */}
              <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 12 }}>
                Categories
              </div>
              <div style={{ position: "relative", marginBottom: 20 }}>
                {/* Selected tags */}
                <div
                  onClick={() => setCatDropdownOpen(true)}
                  style={{
                    ...inputStyle,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    alignItems: "center",
                    minHeight: 42,
                    cursor: "text",
                    padding: "6px 10px",
                  }}
                >
                  {form.categories.map((catId) => {
                    const cat = categoryList.find((c) => c._id === catId);
                    if (!cat) return null;
                    return (
                      <span
                        key={catId}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          background: "#FFF0EE",
                          color: "#FF6051",
                          border: "1px solid #ffd7cf",
                          borderRadius: 6,
                          padding: "3px 8px",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {cat.categoryName || cat.name}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryToggle(catId);
                          }}
                          style={{ cursor: "pointer", fontSize: 15, lineHeight: 1 }}
                        >
                          x
                        </span>
                      </span>
                    );
                  })}
                  <input
                    value={catSearch}
                    onChange={(e) => {
                      setCatSearch(e.target.value);
                      setCatDropdownOpen(true);
                    }}
                    onFocus={() => setCatDropdownOpen(true)}
                    placeholder={form.categories.length === 0 ? "Search categories..." : ""}
                    style={{
                      border: "none",
                      outline: "none",
                      flex: 1,
                      minWidth: 100,
                      fontSize: 14,
                      padding: "4px 0",
                      background: "transparent",
                    }}
                  />
                </div>

                {/* Dropdown */}
                {catDropdownOpen && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 9 }}
                      onClick={() => {
                        setCatDropdownOpen(false);
                        setCatSearch("");
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: 8,
                        marginTop: 4,
                        maxHeight: 180,
                        overflowY: "auto",
                        zIndex: 10,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      {categoryList
                        .filter((cat) =>
                          (cat.categoryName || cat.name || "")
                            .toLowerCase()
                            .includes(catSearch.toLowerCase())
                        )
                        .map((cat) => {
                          const selected = form.categories.includes(cat._id);
                          return (
                            <div
                              key={cat._id}
                              onClick={() => handleCategoryToggle(cat._id)}
                              style={{
                                padding: "9px 14px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 14,
                                background: selected ? "#FFF0EE" : "#fff",
                                color: selected ? "#FF6051" : "#333",
                                fontWeight: selected ? 600 : 400,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = selected
                                  ? "#FFE4E0"
                                  : "#f7f7fa")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = selected
                                  ? "#FFF0EE"
                                  : "#fff")
                              }
                            >
                              <span
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: 4,
                                  border: selected
                                    ? "2px solid #FF6051"
                                    : "2px solid #ccc",
                                  background: selected ? "#FF6051" : "#fff",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  fontSize: 11,
                                  color: "#fff",
                                }}
                              >
                                {selected && "\u2713"}
                              </span>
                              {cat.categoryName || cat.name}
                            </div>
                          );
                        })}
                      {categoryList.filter((cat) =>
                        (cat.categoryName || cat.name || "")
                          .toLowerCase()
                          .includes(catSearch.toLowerCase())
                      ).length === 0 && (
                        <div style={{ padding: "12px 14px", color: "#888", fontSize: 14 }}>
                          No categories found
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Address */}
              <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 12 }}>
                Address
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Address</label>
                  <input
                    style={inputStyle}
                    name="address"
                    value={form.address}
                    onChange={handleFormChange}
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Street</label>
                  <input
                    style={inputStyle}
                    name="street"
                    value={form.street}
                    onChange={handleFormChange}
                    placeholder="Street"
                  />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input
                    style={inputStyle}
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Pincode</label>
                  <input
                    style={inputStyle}
                    name="pincode"
                    value={form.pincode}
                    onChange={handleFormChange}
                    placeholder="Pincode"
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Shop Timing */}
              <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 12 }}>
                Shop Timing
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>Opening Time</label>
                  <input
                    style={inputStyle}
                    name="openingTime"
                    value={form.openingTime}
                    onChange={handleFormChange}
                    type="time"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Closing Time</label>
                  <input
                    style={inputStyle}
                    name="closingTime"
                    value={form.closingTime}
                    onChange={handleFormChange}
                    type="time"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Weekly Off</label>
                  <input
                    style={inputStyle}
                    name="weeklyOff"
                    value={form.weeklyOff}
                    onChange={handleFormChange}
                    placeholder="e.g. Sunday"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create Seller"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerList;
