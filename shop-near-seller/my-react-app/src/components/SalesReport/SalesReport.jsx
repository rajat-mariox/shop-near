import React, { useState, useEffect } from "react";
import { getSellerOrderStats, getSellerOrders } from "../../api/sellerApi";

const SalesReport = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const limit = 10;

  useEffect(() => {
    getSellerOrderStats()
      .then((res) => {
        const d = res.data?.data || res.data;
        setStats(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit };
    if (statusFilter) params.status = statusFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    getSellerOrders(params)
      .then((res) => {
        const d = res.data?.data || res.data;
        setOrders(d.orders || d || []);
        setTotal(d.total_orders ?? d.totalOrders ?? d.total ?? 0);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page, statusFilter, startDate, endDate]);

  const totalPages = Math.ceil(total / limit) || 1;

  const statCards = [
    { label: "Total Revenue", value: `₹${stats?.totalRevenue?.toLocaleString("en-IN") || 0}`, color: "#4CAF50", bg: "#E8F5E9" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, color: "#2196F3", bg: "#E3F2FD" },
    { label: "Completed", value: stats?.completedOrders ?? 0, color: "#FF9800", bg: "#FFF3E0" },
    { label: "Pending", value: stats?.pendingOrders ?? 0, color: "#F44336", bg: "#FFEBEE" },
  ];

  const getStatusBadge = (status) => {
    const map = {
      delivered: { bg: "#B2FFB4", color: "#04910C", label: "Delivered" },
      completed: { bg: "#B2FFB4", color: "#04910C", label: "Completed" },
      pending: { bg: "#FFF3CD", color: "#856404", label: "Pending" },
      accepted: { bg: "#D1ECF1", color: "#0C5460", label: "Accepted" },
      rejected: { bg: "#FFDCDC", color: "#FF0000", label: "Rejected" },
      cancelled: { bg: "#FFDCDC", color: "#FF0000", label: "Cancelled" },
      processing: { bg: "#E3F2FD", color: "#1565C0", label: "Processing" },
      shipped: { bg: "#E8F5E9", color: "#2E7D32", label: "Shipped" },
      out_for_delivery: { bg: "#FFF3E0", color: "#E65100", label: "Out for Delivery" },
    };
    const s = map[status] || { bg: "#eee", color: "#666", label: status || "Unknown" };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: "4px 12px",
          borderRadius: 8,
          fontWeight: 500,
          fontSize: 12,
          textTransform: "capitalize",
        }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ fontSize: 23, fontWeight: 600, color: "#2A2A2A", marginBottom: 20 }}>
        Sales Report
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              flex: "1 1 200px",
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #ececec",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: card.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                color: card.color,
                flexShrink: 0,
              }}
            >
              {card.label === "Total Revenue" ? "₹" : "#"}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#222" }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #ececec",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: "1 1 150px" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 13,
                color: "#333",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 13,
                color: "#333",
                background: "#fff",
              }}
            />
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 13,
                color: "#333",
                background: "#fff",
              }}
            />
          </div>
          {(statusFilter || startDate || endDate) && (
            <button
              onClick={() => { setStatusFilter(""); setStartDate(""); setEndDate(""); setPage(1); }}
              style={{
                padding: "8px 16px",
                background: "none",
                border: "none",
                color: "#FF6051",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Orders Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f7f7fa" }}>
                  {["Order ID", "Customer", "Items", "Amount", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 10px",
                        borderBottom: "1px solid #ececec",
                        textAlign: h === "Order ID" || h === "Customer" ? "left" : "center",
                        fontWeight: 600,
                        color: "#454545",
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#bbb" }}>
                      No orders found
                    </td>
                  </tr>
                )}
                {orders.map((o) => {
                  const orderId = o.orderNumber || o._id?.slice(-8) || "-";
                  const customer = o.userId?.fullName || o.userId?.name || o.customerName || "-";
                  const itemCount = o.products?.length || o.items?.length || 0;
                  const amount = o.totalAmount ?? o.total ?? 0;
                  const date = o.createdAt
                    ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-";

                  return (
                    <tr key={o._id} style={{ borderBottom: "1px solid #ececec" }}>
                      <td style={{ padding: "12px 10px", fontWeight: 600, color: "#333", fontSize: 13 }}>
                        #{orderId}
                      </td>
                      <td style={{ padding: "12px 10px", color: "#555" }}>
                        {customer}
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center", color: "#555" }}>
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center", fontWeight: 600, color: "#222" }}>
                        ₹{amount.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        {getStatusBadge(o.status || o.orderStatus)}
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center", color: "#888", fontSize: 13 }}>
                        {date}
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
            marginTop: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ color: "#888", fontSize: 14 }}>
            {total > 0
              ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`
              : "0 orders"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              style={{
                padding: "6px 12px",
                border: "1px solid #ececec",
                borderRadius: 8,
                cursor: page > 1 ? "pointer" : "not-allowed",
                background: "#fff",
                fontWeight: 600,
              }}
            >
              ←
            </button>
            <span style={{ fontSize: 14, color: "#555" }}>
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "6px 12px",
                border: "1px solid #ececec",
                borderRadius: 8,
                cursor: page < totalPages ? "pointer" : "not-allowed",
                background: "#fff",
                fontWeight: 600,
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
