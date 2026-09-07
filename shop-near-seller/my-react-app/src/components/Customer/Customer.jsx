import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerCustomers } from "../../api/sellerApi";

import icSearch from "../../assets/figma/ic-search-input.svg";
import icFilterList from "../../assets/figma/ic-filter-list.svg";
import icExport from "../../assets/figma/ic-export.svg";
import icCheckbox from "../../assets/figma/ic-checkbox.svg";
import icEye from "../../assets/figma/ic-eye.svg";
import icCaretUp from "../../assets/figma/caret-up.svg";
import icCaretDown from "../../assets/figma/caret-down.svg";
import icCrumbArrow from "../../assets/figma/ic-crumb-arrow.svg";
import icSelectDown from "../../assets/figma/ic-select-down.svg";
import icPageNext from "../../assets/figma/ic-page-next.svg";

const FONT = "'Plus Jakarta Sans', sans-serif";

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

const formatAddress = (a) => {
  if (!a) return "—";
  const parts = [a.address, a.city, a.state, a.pinCode].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
};

const Customer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [minOrders, setMinOrders] = useState("");
  const [appliedMinOrders, setAppliedMinOrders] = useState("");
  const [selected, setSelected] = useState([]);
  const [viewCustomer, setViewCustomer] = useState(null);
  const limit = 10;

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (appliedSearch) params.search = appliedSearch;
      if (appliedMinOrders) params.minOrders = appliedMinOrders;
      const res = await getSellerCustomers(params);
      const d = res.data?.rData || res.data?.data || res.data;
      setCustomers(d.customers || []);
      setTotal(d.total_customers || 0);
      setSelected([]);
    } catch (e) {
      console.error("Failed to load customers", e);
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, appliedMinOrders]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = () => {
    setPage(1);
    setAppliedSearch(search.trim());
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allSelected = customers.length > 0 && selected.length === customers.length;
  const toggleSelectAll = () =>
    setSelected(allSelected ? [] : customers.map((c) => c._id));

  const handleExport = () => {
    if (!customers.length) return;
    const header = ["Name", "Email", "Phone", "Total Purchases", "Orders", "Address"];
    const rows = customers.map((c) => [
      `"${(c.fullName || "").replace(/"/g, '""')}"`,
      c.email || "",
      c.mobileNumber || "",
      c.totalPurchases || 0,
      c.orderCount || 0,
      `"${formatAddress(c.address).replace(/"/g, '""')}"`,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 32, fontFamily: FONT }}>
      {/* Header + breadcrumbs */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: "#2A2A2A", lineHeight: 1.3 }}>
          Customers
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <span
            style={{ fontSize: 14, color: "#888", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Dashboard
          </span>
          <img src={icCrumbArrow} alt="" style={{ width: 7, height: 11 }} />
          <span style={{ fontSize: 14, color: "#FF6051", fontWeight: 700 }}>
            Customers
          </span>
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          border: "1px solid #E7E7E7",
          padding: 24,
        }}
      >
        {/* Toolbar */}
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
              placeholder="Search by name, email, phone"
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

          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
            <button
              onClick={() => setShowFilter((v) => !v)}
              style={{
                ...outlineBtnStyle,
                background: showFilter ? "#FFF2F0" : "#fff",
                borderColor: showFilter ? "#FF6051" : "#B0B0B0",
                color: showFilter ? "#FF6051" : "#454545",
              }}
            >
              Filter
              <img src={icFilterList} alt="" style={{ width: 20, height: 12 }} />
              {appliedMinOrders && (
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
                  1
                </span>
              )}
            </button>

            {showFilter && (
              <div
                style={{
                  position: "absolute",
                  top: "115%",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #E7E7E7",
                  borderRadius: 12,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  padding: 16,
                  zIndex: 5,
                  width: 240,
                  display: "grid",
                  gap: 10,
                }}
              >
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#323130" }}>
                    Minimum Orders
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minOrders}
                    onChange={(e) => setMinOrders(e.target.value)}
                    placeholder="e.g. 2"
                    style={{
                      width: "100%",
                      marginTop: 4,
                      padding: "8px 10px",
                      border: "1.6px solid #D1D1D1",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: FONT,
                      color: "#454545",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      setPage(1);
                      setAppliedMinOrders(minOrders);
                      setShowFilter(false);
                    }}
                    style={{
                      flex: 1,
                      background: "#FF6051",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 0",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: FONT,
                    }}
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setMinOrders("");
                      setAppliedMinOrders("");
                      setPage(1);
                      setShowFilter(false);
                    }}
                    style={{
                      flex: 1,
                      background: "#fff",
                      color: "#454545",
                      border: "1px solid #B0B0B0",
                      borderRadius: 8,
                      padding: "8px 0",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: FONT,
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <button onClick={handleExport} style={outlineBtnStyle}>
              Export
              <img
                src={icExport}
                alt=""
                style={{ width: 18, height: 18, transform: "rotate(90deg) scaleY(-1)" }}
              />
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
            Loading customers...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 48, borderTopLeftRadius: 16, padding: 12 }}>
                    <Checkbox checked={allSelected} onChange={toggleSelectAll} />
                  </th>
                  <th style={{ ...thStyle, minWidth: 180 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Name Customer <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 160 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Contact <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 130 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Purchases <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 110 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Order QTY <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 220 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Address <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 90, borderTopRightRadius: 16 }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: 32, color: "#B0B0B0" }}>
                      No customers found
                    </td>
                  </tr>
                )}
                {customers.map((c) => (
                  <tr key={c._id}>
                    <td style={{ ...tdStyle, width: 48 }}>
                      <Checkbox
                        checked={selected.includes(c._id)}
                        onChange={() => toggleSelect(c._id)}
                      />
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 12, color: "#FF6051", lineHeight: 1.4 }}>
                          ID {(c._id || "").slice(-5).toUpperCase()}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#454545", lineHeight: 1.4 }}>
                          {c.fullName || "—"}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span
                          style={{
                            maxWidth: 180,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "inline-block",
                          }}
                          title={c.email || ""}
                        >
                          {c.email || "—"}
                        </span>
                        <span style={{ fontWeight: 500 }}>{c.mobileNumber || "—"}</span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      ₹{(c.totalPurchases || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={tdStyle}>{c.orderCount || 0} Order</td>
                    <td style={tdStyle}>{formatAddress(c.address)}</td>
                    <td style={tdStyle}>
                      <img
                        src={icEye}
                        alt="View"
                        title="View Customer"
                        onClick={() => setViewCustomer(c)}
                        style={{ width: 16, height: 16, cursor: "pointer" }}
                      />
                    </td>
                  </tr>
                ))}
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
                <span style={{ color: "#737373" }}>of {total} Customers</span>
              </>
            ) : (
              <span style={{ color: "#737373" }}>0 customers</span>
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* View customer modal */}
      {viewCustomer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setViewCustomer(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              minWidth: 380,
              maxWidth: 480,
              fontFamily: FONT,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 14, color: "#2A2A2A" }}>Customer Details</h3>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
              <strong style={{ color: "#454545" }}>Name:</strong> {viewCustomer.fullName || "—"}
            </p>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
              <strong style={{ color: "#454545" }}>Email:</strong> {viewCustomer.email || "—"}
            </p>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
              <strong style={{ color: "#454545" }}>Phone:</strong> {viewCustomer.mobileNumber || "—"}
            </p>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
              <strong style={{ color: "#454545" }}>Total Purchases:</strong> ₹
              {(viewCustomer.totalPurchases || 0).toLocaleString("en-IN")}
            </p>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
              <strong style={{ color: "#454545" }}>Orders:</strong> {viewCustomer.orderCount || 0}
            </p>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
              <strong style={{ color: "#454545" }}>Address:</strong> {formatAddress(viewCustomer.address)}
            </p>
            <button
              onClick={() => setViewCustomer(null)}
              style={{
                marginTop: 16,
                background: "#FF6051",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "10px 24px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
