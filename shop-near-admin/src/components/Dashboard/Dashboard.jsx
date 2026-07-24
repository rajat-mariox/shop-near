import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getDashboardStats } from "../../api/adminApi";

const PIE_COLORS = [
  "#FF6051",
  "#6c63ff",
  "#7ED957",
  "#F7B731",
  "#4A90E2",
  "#E84393",
  "#00B894",
  "#FDCB6E",
];

const formatCurrency = (v) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v}`;
};

const statusBadge = (s) => {
  const map = {
    delivered: "badge-green",
    shipped: "badge-purple",
    shipping: "badge-purple",
    processing: "badge-orange",
    confirmed: "badge-orange",
    pending: "badge-orange",
    cancelled: "badge-red",
    returned: "badge-red",
    Active: "badge-green",
    Inactive: "badge-grey",
  };
  return map[s] || map[s?.toLowerCase()] || "badge-grey";
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        setStats(res.data?.data || res.data);
      })
      .catch((err) => console.error("Dashboard stats error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div
        className="page-content"
        style={{ textAlign: "center", padding: 60 }}
      >
        Loading dashboard...
      </div>
    );

  const d = stats || {};

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(d.totalRevenue || 0),
      bg: "#FF6051",
      color: "#fff",
      changeColor: "#E6FF96",
    },
    {
      label: "Total Sellers",
      value: (d.totalSellers || 0).toLocaleString(),
      bg: "#fff",
      color: "#FF6051",
      changeColor: "#09DE13",
    },
    {
      label: "Total Users",
      value: (d.totalUsers || 0).toLocaleString(),
      bg: "#fff",
      color: "#FF6051",
      changeColor: "#09DE13",
    },
    {
      label: "Total Orders",
      value: (d.totalOrders || 0).toLocaleString(),
      bg: "#fff",
      color: "#FF6051",
      changeColor: "#09DE13",
    },
    {
      label: "Active Products",
      value: (d.totalProducts || 0).toLocaleString(),
      bg: "#fff",
      color: "#FF6051",
      changeColor: "#09DE13",
    },
  ];

  const revenueData = (d.monthlyRevenue || []).map((m) => {
    const parts = m._id.split("-");
    const monthIdx = parseInt(parts[1], 10) - 1;
    return {
      month: MONTH_LABELS[monthIdx] || m._id,
      revenue: m.revenue,
      orders: m.orders,
    };
  });

  const categoryData = (d.categoryDistribution || []).map((c) => ({
    name: c.name || "Uncategorized",
    value: c.count,
  }));

  const topSellers = (d.topSellers || []).map((s) => ({
    name: s.shopName || s.fullName || "Unknown",
    orders: s.orderCount,
    revenue: formatCurrency(s.revenue || 0),
    status: "Active",
  }));

  const recentOrders = (d.recentOrders || []).map((o) => ({
    id: o.orderId || o._id,
    customer: o.userId?.fullName || "Guest",
    amount: formatCurrency(o.grandTotal || 0),
    status: o.status,
  }));

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
        Dashboard
      </div>

      {/* Stats Row */}
      <div
        style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}
      >
        {statCards.map((s) => (
          <div
            key={s.label}
            style={{
              flex: "1 1 180px",
              background: s.bg,
              borderRadius: 16,
              padding: "22px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: s.bg === "#fff" ? "1px solid #ececec" : "none",
              minWidth: 170,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: s.bg === "#fff" ? "#888" : "rgba(255,255,255,.8)",
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 24,
                color: s.color,
                marginBottom: 4,
              }}
            >
              {s.value}
            </div>
            {s.label === "Total Sellers" && (
              <div style={{ fontSize: 12, fontWeight: 500, color: "#888" }}>
                {d.pendingSellers || 0} pending approval
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div
        style={{ display: "flex", gap: 24, marginBottom: 28, flexWrap: "wrap" }}
      >
        <div className="card" style={{ flex: "2 1 500px", minWidth: 400 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 16,
              color: "#222",
            }}
          >
            Revenue & Orders (Monthly)
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="6 6" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#888" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#888" }}
                />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF6051"
                  strokeWidth={3}
                  dot={false}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#6c63ff"
                  strokeWidth={3}
                  dot={false}
                  name="Orders"
                  strokeDasharray="6 4"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: 240,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
              }}
            >
              No revenue data yet
            </div>
          )}
        </div>

        <div
          className="card"
          style={{
            flex: "1 1 280px",
            minWidth: 260,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 16,
              color: "#222",
              alignSelf: "flex-start",
            }}
          >
            Sales by Category
          </div>
          {categoryData.length > 0 ? (
            <>
              <PieChart width={220} height={220}>
                <Pie
                  data={categoryData}
                  cx={110}
                  cy={110}
                  innerRadius={60}
                  outerRadius={95}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                {categoryData.map((c, i) => (
                  <div
                    key={c.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        background: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                    {c.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                height: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
              }}
            >
              No category data
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tables */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 440px" }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 16,
              color: "#222",
            }}
          >
            Top Sellers
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topSellers.length > 0 ? (
                  topSellers.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.orders}</td>
                      <td>{s.revenue}</td>
                      <td>
                        <span className={`badge ${statusBadge(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", color: "#aaa" }}
                    >
                      No sellers yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ flex: "1 1 440px" }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 16,
              color: "#222",
            }}
          >
            Recent Orders
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((o, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{o.id}</td>
                      <td>{o.customer}</td>
                      <td>{o.amount}</td>
                      <td>
                        <span className={`badge ${statusBadge(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", color: "#aaa" }}
                    >
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
