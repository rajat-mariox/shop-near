import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../../api/adminApi";

const formatCurrency = (v) => `₹${(v || 0).toLocaleString()}`;

const statusBadge = (s) => {
  const map = {
    delivered: "badge-green",
    shipped: "badge-purple",
    processing: "badge-orange",
    confirmed: "badge-orange",
    pending: "badge-orange",
    cancelled: "badge-red",
    returned: "badge-red",
  };
  return map[s?.toLowerCase()] || "badge-grey";
};

const TABS = [
  { label: "All", filter: {} },
  { label: "Pending", filter: { status: "pending" } },
  { label: "Confirmed", filter: { status: "confirmed" } },
  { label: "Shipped", filter: { status: "shipped" } },
  { label: "Delivered", filter: { status: "delivered" } },
  { label: "Cancelled", filter: { status: "cancelled" } },
];

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        ...TABS[activeTab].filter,
      };
      const res = await getOrders(params);
      const d = res.data?.data || res.data;
      setOrders(d.orders || []);
      setTotal(d.total || 0);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, activeTab]);

  // Auto-refresh (silent) — status changes bina manual refresh ke dikhein
  useEffect(() => {
    const t = setInterval(() => fetchOrders(true), 3000);
    return () => clearInterval(t);
  }, [page, activeTab, search]);

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };
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
        Orders
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
            placeholder="Search by order ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="btn btn-outline btn-sm" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="tab-bar">
          {TABS.map((t, i) => (
            <div
              key={t.label}
              className={`tab-item ${activeTab === i ? "active" : ""}`}
              onClick={() => {
                setActiveTab(i);
                setPage(1);
              }}
            >
              {t.label}
            </div>
          ))}
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 600 }}>
                      {o.orderId || o._id?.slice(-8)}
                    </td>
                    <td>{o.userId?.fullName || "Guest"}</td>
                    <td>{o.products?.length || 0}</td>
                    <td>{formatCurrency(o.grandTotal)}</td>
                    <td>
                      <span
                        style={{
                          textTransform: "uppercase",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {o.paymentMode}
                      </span>
                      <div
                        style={{
                          fontSize: 11,
                          color:
                            o.paymentStatus === "completed"
                              ? "#09DE13"
                              : "#888",
                        }}
                      >
                        {o.paymentStatus}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div
                        className="action-icon"
                        title="View"
                        onClick={() => navigate(`/orders/${o._id}`)}
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
    </div>
  );
};

export default OrderList;
