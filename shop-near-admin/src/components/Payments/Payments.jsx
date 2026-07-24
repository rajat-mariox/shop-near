import React, { useState, useEffect } from "react";
import { getOrders } from "../../api/adminApi";

const formatCurrency = (v) => `₹${(v || 0).toLocaleString()}`;

const Payments = () => {
  const [tab, setTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (tab === "completed") params.paymentStatus = "completed";
      if (tab === "pending") params.paymentStatus = "pending";
      if (tab === "failed") params.paymentStatus = "failed";
      if (tab === "cod") params.paymentMode = "cod";
      if (tab === "online") params.paymentMode = "online";

      const res = await getOrders(params);
      const d = res.data?.data || res.data;
      setOrders(d.orders || []);
      setTotal(d.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, tab]);

  const totalPages = Math.ceil(total / limit) || 1;

  const payStatusBadge = (s) => {
    const map = {
      completed: "badge-green",
      pending: "badge-orange",
      failed: "badge-red",
      refunded: "badge-purple",
    };
    return map[s] || "badge-grey";
  };

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
        Payments
      </div>

      <div className="card">
        <div className="tab-bar">
          {[
            { key: "all", label: "All" },
            { key: "completed", label: "Completed" },
            { key: "pending", label: "Pending" },
            { key: "failed", label: "Failed" },
            { key: "cod", label: "COD" },
            { key: "online", label: "Online" },
          ].map((t) => (
            <div
              key={t.key}
              className={`tab-item ${tab === t.key ? "active" : ""}`}
              onClick={() => {
                setTab(t.key);
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
                <th>Amount</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Razorpay ID</th>
                <th>Date</th>
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
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                  >
                    No payment records found
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 600 }}>
                      {o.orderId || o._id?.slice(-8)}
                    </td>
                    <td>{o.userId?.fullName || "Guest"}</td>
                    <td style={{ fontWeight: 600 }}>
                      {formatCurrency(o.grandTotal)}
                    </td>
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
                    </td>
                    <td>
                      <span
                        className={`badge ${payStatusBadge(o.paymentStatus)}`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#888" }}>
                      {o.razorpayPaymentId || "—"}
                    </td>
                    <td>
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString()
                        : "—"}
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

export default Payments;
