import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSellerOrders,
  getSellerOrderStats,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  verifySellerDeliveryOtp,
  getDeliveryAgents,
  createDeliveryAgent,
  assignDeliveryAgent,
} from "../../api/sellerApi";

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

const STATUS_MAP = {
  0: { label: "All Orders", value: "" },
  1: { label: "Pending", value: "pending" },
  2: { label: "Confirmed", value: "confirmed" },
  3: { label: "Shipped", value: "shipped" },
  4: { label: "Delivered", value: "delivered" },
  5: { label: "Cancelled", value: "cancelled" },
};

const paymentColor = (p) =>
  p === "completed" ? "#E6FF96" : p === "failed" ? "#FFD6D6" : "#FFF5C5";
const paymentTextColor = (p) =>
  p === "completed" ? "#00B809" : p === "failed" ? "#EB2B0B" : "#E27D00";

const statusStyles = {
  pending: { bg: "#FFF5C5", color: "#E27D00" },
  confirmed: { bg: "#DCD2FF", color: "#7F27FF" },
  processing: { bg: "#DCD2FF", color: "#7F27FF" },
  shipped: { bg: "#D2E8FF", color: "#2B6CB0" },
  delivered: { bg: "#E6FF96", color: "#00B809" },
  cancelled: { bg: "#FEC6AA", color: "#EB2B0B" },
  returned: { bg: "#FFD6D6", color: "#EB2B0B" },
};

const Chip = ({ bg, color, children }) => (
  <span
    style={{
      display: "inline-block",
      padding: "6px 8px",
      borderRadius: 10,
      background: bg,
      color,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.4,
      whiteSpace: "nowrap",
      textTransform: "capitalize",
    }}
  >
    {children}
  </span>
);

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

const actionChipStyle = (bg, color) => ({
  background: bg,
  color,
  border: "none",
  borderRadius: 6,
  padding: "4px 8px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: FONT,
  whiteSpace: "nowrap",
});

const Transaction = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState([]);
  const [actionModal, setActionModal] = useState(null); // { orderId, type }
  const [rejectReason, setRejectReason] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  // Assign Agent modal — shop ke delivery agents me se choose ya quick-add
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [quickAgent, setQuickAgent] = useState({ name: "", mobile: "" });
  const [assigning, setAssigning] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const limit = 10;

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = { page, limit };
      const statusVal = STATUS_MAP[activeTab]?.value;
      if (statusVal) params.status = statusVal;
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      const res = await getSellerOrders(params);
      const d = res.data?.rData || res.data?.data || res.data;
      setOrders(d.orders || []);
      setTotalOrders(d.total_orders || 0);
      if (!silent) setSelected([]);
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, activeTab, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh (silent) — naye orders / status change bina manual refresh ke dikhein
  useEffect(() => {
    const t = setInterval(() => fetchOrders(true), 3000);
    return () => clearInterval(t);
  }, [fetchOrders]);

  useEffect(() => {
    getSellerOrderStats()
      .then((res) => setStats(res.data?.rData || res.data?.data || res.data))
      .catch(() => {});
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalOrders / limit));

  const handleTabChange = (idx) => {
    setActiveTab(idx);
    setPage(1);
  };

  const handleAccept = async (orderId) => {
    try {
      await acceptOrder(orderId);
      fetchOrders();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to accept order");
    }
  };

  const handleReject = async () => {
    if (!actionModal) return;
    try {
      await rejectOrder(actionModal.orderId, rejectReason);
      setActionModal(null);
      setRejectReason("");
      fetchOrders();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to reject order");
    }
  };

  const handleStatusUpdate = async () => {
    if (!actionModal || !statusUpdate) return;
    try {
      const orderId = actionModal.orderId;
      const wasShipped = statusUpdate === "shipped";
      await updateOrderStatus(orderId, statusUpdate);
      setActionModal(null);
      setStatusUpdate("");
      fetchOrders();
      // Shipped hote hi delivery agent assign karne ka modal khol do
      if (wasShipped) {
        openAssignAgentModal({ orderId, deliveryAgent: null });
      }
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to update status");
    }
  };

  const [deliveryOtp, setDeliveryOtp] = useState("");

  const handleVerifyDeliveryOtp = async () => {
    if (!actionModal || !deliveryOtp.trim()) return;
    try {
      const res = await verifySellerDeliveryOtp(actionModal.orderId, deliveryOtp.trim());
      if (res.data?.code === 1) {
        setActionModal(null);
        setDeliveryOtp("");
        fetchOrders();
        alert("Order delivered successfully!");
      } else {
        alert(res.data?.message || "Invalid OTP");
      }
    } catch (e) {
      alert(e.response?.data?.message || e.response?.data?.msg || "Invalid OTP");
    }
  };

  // Assign Agent modal kholte hi agents ki list load karo
  const openAssignAgentModal = (order) => {
    setSelectedAgentId(order.deliveryAgent?.agentId || "");
    setQuickAgent({ name: "", mobile: "" });
    setActionModal({ orderId: order.orderId, type: "assignAgent", order });
    setAgentsLoading(true);
    getDeliveryAgents()
      .then((res) => {
        const d = res.data?.rData || res.data?.data || res.data;
        setAgents(d.agents || []);
      })
      .catch(() => setAgents([]))
      .finally(() => setAgentsLoading(false));
  };

  const handleAssignAgent = async () => {
    if (!actionModal || assigning) return;
    try {
      setAssigning(true);
      let agentId = selectedAgentId;

      // Quick-add: naya agent banake usko hi assign kar do
      if (!agentId && quickAgent.name.trim() && quickAgent.mobile.trim().length >= 10) {
        const res = await createDeliveryAgent({
          name: quickAgent.name.trim(),
          mobile: quickAgent.mobile.trim(),
        });
        const created = res.data?.rData || res.data?.data || res.data;
        agentId = created?._id;
      }

      if (!agentId) {
        alert("Pehle agent select karein ya naya agent add karein");
        return;
      }

      await assignDeliveryAgent(actionModal.orderId, agentId);
      setActionModal(null);
      fetchOrders();
      alert("Delivery agent assigned! Customer ko iski details dikhengi.");
    } catch (e) {
      const msg = e.response?.data?.msg || e.response?.data?.message || "";
      alert(
        msg === "agent_mobile_already_exists"
          ? "Is mobile number ka agent pehle se added hai — list me se select karein"
          : msg || "Failed to assign agent"
      );
    } finally {
      setAssigning(false);
    }
  };

  /* ---- helper to get seller-specific status from an order ---- */
  const getSellerStatus = (order) => {
    const ss = order.sellerOrderStatus;
    if (ss && ss.length > 0) return ss[0].status;
    return order.status || "pending";
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  /* client-side search filter on loaded orders */
  const displayOrders = search
    ? orders.filter((o) => {
        const q = search.toLowerCase();
        const prodName = o.products?.[0]?.productName || "";
        const custName = o.userId?.fullName || "";
        return (
          o.orderId?.toLowerCase().includes(q) ||
          prodName.toLowerCase().includes(q) ||
          custName.toLowerCase().includes(q)
        );
      })
    : orders;

  const handleExport = () => {
    const header = ["Order ID", "Customer", "Product", "Amount", "Payment Status", "Status", "Date"];
    const rows = displayOrders.map((o) => [
      o.orderId || "",
      o.userId?.fullName || "",
      o.products?.[0]?.productName || "",
      o.grandTotal || 0,
      o.paymentStatus || "",
      getSellerStatus(o),
      o.createdAt ? new Date(o.createdAt).toISOString() : "",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allSelected = displayOrders.length > 0 && selected.length === displayOrders.length;
  const toggleSelectAll = () =>
    setSelected(allSelected ? [] : displayOrders.map((o) => o._id));

  const activeFilterCount = [dateRange.startDate, dateRange.endDate].filter(Boolean).length;
  const allOrdersCount = stats?.totalOrders ?? totalOrders;

  return (
    <div style={{ padding: 32, fontFamily: FONT }}>
      {/* Header + breadcrumbs */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: "#2A2A2A", lineHeight: 1.3 }}>
          Orders
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <span
            style={{ fontSize: 14, color: "#888", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Dashboard
          </span>
          <img src={icCrumbArrow} alt="" style={{ width: 7, height: 11 }} />
          <span style={{ fontSize: 14, color: activeTab === 0 ? "#888" : "#888" }}>Orders</span>
          <img src={icCrumbArrow} alt="" style={{ width: 7, height: 11 }} />
          <span style={{ fontSize: 14, color: "#FF6051", fontWeight: 700 }}>
            {STATUS_MAP[activeTab].label}
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
              placeholder="Search for order id, product, customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            <img src={icSearch} alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />
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
                    From
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => {
                      setDateRange((d) => ({ ...d, startDate: e.target.value }));
                      setPage(1);
                    }}
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
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#323130" }}>
                    To
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => {
                      setDateRange((d) => ({ ...d, endDate: e.target.value }));
                      setPage(1);
                    }}
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

        {/* Status tabs */}
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
          {Object.values(STATUS_MAP).map((tab, idx) => {
            const active = activeTab === idx;
            const label =
              idx === 0 && allOrdersCount ? `${tab.label} (${allOrdersCount})` : tab.label;
            return (
              <div
                key={tab.label}
                onClick={() => handleTabChange(idx)}
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
                {label}
              </div>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
            Loading orders...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 48, borderTopLeftRadius: 16, padding: 12 }}>
                    <Checkbox checked={allSelected} onChange={toggleSelectAll} />
                  </th>
                  <th style={{ ...thStyle, minWidth: 230 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Orders <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 130 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Customer <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 110 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Price <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 100 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Date <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 110 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Payment <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 110 }}>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Status <Sorter />
                    </span>
                  </th>
                  <th style={{ ...thStyle, minWidth: 220, borderTopRightRadius: 16 }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: 32, color: "#B0B0B0" }}>
                      No orders found
                    </td>
                  </tr>
                )}
                {displayOrders.map((order) => {
                  const product = order.products?.[0] || {};
                  const rawImg = product.productId?.productImages?.[0];
                  const imgSrc =
                    (typeof rawImg === "object" ? rawImg?.url : rawImg) ||
                    product.productImage ||
                    "";
                  const sellerSt = getSellerStatus(order);
                  const ss = statusStyles[sellerSt] || statusStyles.pending;

                  return (
                    <tr key={order._id}>
                      <td style={{ ...tdStyle, width: 48 }}>
                        <Checkbox
                          checked={selected.includes(order._id)}
                          onChange={() => toggleSelect(order._id)}
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
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt=""
                                style={{ width: 38, height: 38, borderRadius: 4, objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{ width: 38, height: 38, borderRadius: 4, background: "#E7E7E7" }} />
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 12, color: "#FF6051", lineHeight: 1.4 }}>
                              {order.orderId}
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#454545", lineHeight: 1.4 }}>
                              {product.productName || "-"}
                              {order.products?.length > 1 && ` +${order.products.length - 1} more`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>
                        {order.userId?.fullName || "-"}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>
                        ₹{order.grandTotal?.toLocaleString("en-IN") || "0"}
                      </td>
                      <td style={tdStyle}>{formatDate(order.createdAt)}</td>
                      <td style={tdStyle}>
                        <Chip
                          bg={paymentColor(order.paymentStatus)}
                          color={paymentTextColor(order.paymentStatus)}
                        >
                          {order.paymentStatus || "pending"}
                        </Chip>
                      </td>
                      <td style={tdStyle}>
                        <Chip bg={ss.bg} color={ss.color}>{sellerSt}</Chip>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap" }}>
                          <img
                            src={icEye}
                            alt="View"
                            title="View Order"
                            onClick={() =>
                              setActionModal({ orderId: order.orderId, type: "view", order })
                            }
                            style={{ width: 22, height: 22, cursor: "pointer", flexShrink: 0 }}
                          />
                          {sellerSt === "pending" && (
                            <>
                              <button
                                onClick={() => handleAccept(order.orderId)}
                                style={actionChipStyle("#E6FF96", "#00B809")}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  setActionModal({ orderId: order.orderId, type: "reject" })
                                }
                                style={actionChipStyle("#FEC6AA", "#EB2B0B")}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {["confirmed", "processing", "shipped"].includes(sellerSt) && (
                            <button
                              onClick={() =>
                                setActionModal({ orderId: order.orderId, type: "status" })
                              }
                              style={actionChipStyle("#DCD2FF", "#7F27FF")}
                            >
                              Update
                            </button>
                          )}
                          {sellerSt === "shipped" && (
                            <>
                              <button
                                onClick={() => openAssignAgentModal(order)}
                                style={actionChipStyle("#D2E8FF", "#2B6CB0")}
                                title={
                                  order.deliveryAgent?.name
                                    ? `Assigned: ${order.deliveryAgent.name} (${order.deliveryAgent.mobile})`
                                    : "Assign delivery agent"
                                }
                              >
                                {order.deliveryAgent?.name ? "✓ Agent" : "Assign Agent"}
                              </button>
                              <button
                                onClick={() =>
                                  setActionModal({ orderId: order.orderId, type: "deliver" })
                                }
                                style={actionChipStyle("#E6FF96", "#00B809")}
                              >
                                Complete
                              </button>
                            </>
                          )}
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
            {totalOrders > 0 ? (
              <>
                <span style={{ color: "#FF6051", fontWeight: 700 }}>
                  {(page - 1) * limit + 1}
                </span>
                <span style={{ color: "#737373" }}>-</span>
                <span style={{ color: "#737373" }}>{Math.min(page * limit, totalOrders)}</span>
                <span style={{ color: "#737373" }}>of {totalOrders} Orders</span>
              </>
            ) : (
              <span style={{ color: "#737373" }}>0 orders</span>
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

      {/* ---- MODALS ---- */}
      {actionModal && actionModal.type === "reject" && (
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
          onClick={() => setActionModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              width: "100%",
              maxWidth: 460,
              margin: 16,
              boxSizing: "border-box",
              fontFamily: FONT,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 12, color: "#2A2A2A" }}>Reject Order</h3>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 10 }}>
              Order: <strong>{actionModal.orderId}</strong>
            </p>
            <textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: "100%",
                minHeight: 80,
                borderRadius: 8,
                border: "1px solid #D1D1D1",
                padding: 10,
                fontSize: 14,
                marginBottom: 14,
                fontFamily: FONT,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleReject}
                style={{
                  background: "#FF6051",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                Confirm Reject
              </button>
              <button
                onClick={() => setActionModal(null)}
                style={{
                  background: "#fff",
                  color: "#FF6051",
                  border: "1px solid #FF6051",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal && actionModal.type === "status" && (
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
          onClick={() => setActionModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              width: "100%",
              maxWidth: 460,
              margin: 16,
              boxSizing: "border-box",
              fontFamily: FONT,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 12, color: "#2A2A2A" }}>
              Update Order Status
            </h3>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 10 }}>
              Order: <strong>{actionModal.orderId}</strong>
            </p>
            <select
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #D1D1D1",
                fontSize: 14,
                marginBottom: 14,
                fontFamily: FONT,
              }}
            >
              <option value="">Select status</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
            </select>
            <p style={{ fontSize: 12, color: "#888", marginTop: -6, marginBottom: 14 }}>
              Order "Shipped" hone par customer ko tracking screen par delivery OTP milta hai.
              Delivery par wahi OTP "Complete" button se enter karke order delivered hota hai.
              Shipped karte hi aap delivery agent bhi assign kar payenge — customer directly
              agent se connect hoga.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleStatusUpdate}
                disabled={!statusUpdate}
                style={{
                  background: statusUpdate ? "#FF6051" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: statusUpdate ? "pointer" : "default",
                  fontFamily: FONT,
                }}
              >
                Update
              </button>
              <button
                onClick={() => setActionModal(null)}
                style={{
                  background: "#fff",
                  color: "#FF6051",
                  border: "1px solid #FF6051",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal && actionModal.type === "view" && actionModal.order && (
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
          onClick={() => setActionModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              minWidth: 440,
              maxWidth: 520,
              maxHeight: "80vh",
              overflowY: "auto",
              fontFamily: FONT,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 12, color: "#2A2A2A" }}>
              Order Details
            </h3>
            <p style={{ fontSize: 14, color: "#888" }}>
              <strong>Order ID:</strong> {actionModal.order.orderId}
            </p>
            <p style={{ fontSize: 14, color: "#888" }}>
              <strong>Customer:</strong>{" "}
              {actionModal.order.userId?.fullName || "-"}
            </p>
            <p style={{ fontSize: 14, color: "#888" }}>
              <strong>Date:</strong> {formatDate(actionModal.order.createdAt)}
            </p>
            <p style={{ fontSize: 14, color: "#888" }}>
              <strong>Payment:</strong> {actionModal.order.paymentMode} /{" "}
              {actionModal.order.paymentStatus}
            </p>
            <p style={{ fontSize: 14, color: "#888" }}>
              <strong>Grand Total:</strong> ₹
              {actionModal.order.grandTotal?.toLocaleString("en-IN")}
            </p>
            {actionModal.order.deliveryAgent?.name && (
              <p style={{ fontSize: 14, color: "#888" }}>
                <strong>Delivery Agent:</strong>{" "}
                {actionModal.order.deliveryAgent.name} (
                {actionModal.order.deliveryAgent.mobile})
              </p>
            )}
            <h4 style={{ marginTop: 14, marginBottom: 8 }}>Products</h4>
            {actionModal.order.products?.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 8,
                  padding: 8,
                  border: "1px solid #ececec",
                  borderRadius: 8,
                }}
              >
                <img
                  src={
                    (typeof p.productId?.productImages?.[0] === "object"
                      ? p.productId?.productImages?.[0]?.url
                      : p.productId?.productImages?.[0]) ||
                    p.productImage ||
                    ""
                  }
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    objectFit: "cover",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {p.productName}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    Qty: {p.quantity} × ₹{p.unitPrice} = ₹{p.totalPrice}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setActionModal(null)}
              style={{
                marginTop: 16,
                background: "#FF6051",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 24px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {actionModal && actionModal.type === "deliver" && (
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
          onClick={() => {
            setActionModal(null);
            setDeliveryOtp("");
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              width: "100%",
              maxWidth: 460,
              margin: 16,
              boxSizing: "border-box",
              fontFamily: FONT,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 12, color: "#2A2A2A" }}>
              Complete Delivery
            </h3>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 10 }}>
              Order: <strong>{actionModal.orderId}</strong>
            </p>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 14, lineHeight: 1.5 }}>
              Customer ke Order Tracking screen par jo delivery OTP dikh raha hai,
              wo yahan enter karein. Sahi OTP par order delivered ho jayega.
            </p>
            <input
              placeholder="Enter delivery OTP"
              value={deliveryOtp}
              onChange={(e) => setDeliveryOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.6px solid #D1D1D1",
                fontSize: 18,
                letterSpacing: 6,
                fontWeight: 700,
                color: "#454545",
                textAlign: "center",
                marginBottom: 14,
                fontFamily: FONT,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleVerifyDeliveryOtp}
                disabled={deliveryOtp.trim().length < 4}
                style={{
                  background: deliveryOtp.trim().length >= 4 ? "#FF6051" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: deliveryOtp.trim().length >= 4 ? "pointer" : "default",
                  fontFamily: FONT,
                }}
              >
                Verify & Complete
              </button>
              <button
                onClick={() => {
                  setActionModal(null);
                  setDeliveryOtp("");
                }}
                style={{
                  background: "#fff",
                  color: "#FF6051",
                  border: "1px solid #FF6051",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal && actionModal.type === "assignAgent" && (
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
          onClick={() => setActionModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              minWidth: 400,
              maxWidth: 460,
              fontFamily: FONT,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 12, color: "#2A2A2A" }}>
              Assign Delivery Agent
            </h3>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
              Order: <strong>{actionModal.orderId}</strong>
            </p>
            {actionModal.order?.deliveryAgent?.name && (
              <p style={{ fontSize: 13, color: "#00B809", marginBottom: 10 }}>
                Currently assigned: {actionModal.order.deliveryAgent.name} (
                {actionModal.order.deliveryAgent.mobile})
              </p>
            )}
            <p style={{ fontSize: 12, color: "#888", marginBottom: 12, lineHeight: 1.5 }}>
              Jo agent ye order deliver karega usse assign karein — customer ko
              tracking screen par agent ka naam aur number dikhega, aur wo
              directly agent ko call karega.
            </p>

            {agentsLoading ? (
              <p style={{ fontSize: 13, color: "#888" }}>Loading agents...</p>
            ) : (
              <>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #D1D1D1",
                    fontSize: 14,
                    marginBottom: 10,
                    fontFamily: FONT,
                  }}
                >
                  <option value="">Select agent</option>
                  {agents
                    .filter((a) => a.isActive)
                    .map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name} — {a.mobile}
                      </option>
                    ))}
                </select>

                {!selectedAgentId && (
                  <div
                    style={{
                      border: "1px dashed #D1D1D1",
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 14,
                    }}
                  >
                    <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px" }}>
                      Ya naya agent add karke assign karein:
                    </p>
                    <input
                      placeholder="Agent Name"
                      value={quickAgent.name}
                      onChange={(e) =>
                        setQuickAgent((q) => ({ ...q, name: e.target.value }))
                      }
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #D1D1D1",
                        fontSize: 14,
                        marginBottom: 8,
                        fontFamily: FONT,
                        boxSizing: "border-box",
                      }}
                    />
                    <input
                      placeholder="Agent Mobile Number"
                      value={quickAgent.mobile}
                      maxLength={15}
                      onChange={(e) =>
                        setQuickAgent((q) => ({
                          ...q,
                          mobile: e.target.value.replace(/[^\d+]/g, ""),
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #D1D1D1",
                        fontSize: 14,
                        fontFamily: FONT,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}
              </>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleAssignAgent}
                disabled={
                  assigning ||
                  (!selectedAgentId &&
                    !(quickAgent.name.trim() && quickAgent.mobile.trim().length >= 10))
                }
                style={{
                  background:
                    !assigning &&
                    (selectedAgentId ||
                      (quickAgent.name.trim() && quickAgent.mobile.trim().length >= 10))
                      ? "#FF6051"
                      : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                {assigning ? "Assigning..." : "Assign Agent"}
              </button>
              <button
                onClick={() => setActionModal(null)}
                style={{
                  background: "#fff",
                  color: "#FF6051",
                  border: "1px solid #FF6051",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaction;
