import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetailApi, updateOrderStatus } from "../../api/adminApi";

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
    completed: "badge-green",
    failed: "badge-red",
    refunded: "badge-purple",
  };
  return map[s?.toLowerCase()] || "badge-grey";
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", marginBottom: 10 }}>
    <div style={{ width: 160, fontWeight: 500, color: "#888", fontSize: 14 }}>
      {label}
    </div>
    <div style={{ fontWeight: 600, color: "#333", fontSize: 14 }}>
      {value || "—"}
    </div>
  </div>
);

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await getOrderDetailApi(id);
      setOrder(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Auto-refresh (silent) — seller/app se status change bina manual refresh ke dikhe
  useEffect(() => {
    const t = setInterval(fetchOrder, 3000);
    return () => clearInterval(t);
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(order._id, newStatus);
      fetchOrder();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div
        className="page-content"
        style={{ textAlign: "center", padding: 60 }}
      >
        Loading...
      </div>
    );
  if (!order)
    return (
      <div
        className="page-content"
        style={{ textAlign: "center", paddingTop: 80 }}
      >
        <h2 style={{ color: "#888" }}>Order not found</h2>
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </button>
      </div>
    );

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
        Order Details
      </div>

      {/* Header */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>
            Order #{order.orderId || order._id.slice(-8)}
          </div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            Placed on{" "}
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className={`badge ${statusBadge(order.status)}`}
            style={{ fontSize: 14, padding: "6px 16px" }}
          >
            {order.status}
          </span>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/orders")}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}
      >
        {[
          { label: "Grand Total", value: formatCurrency(order.grandTotal) },
          { label: "Payment Mode", value: order.paymentMode?.toUpperCase() },
          { label: "Payment Status", value: order.paymentStatus },
          { label: "Items", value: order.products?.length || 0 },
        ].map((s) => (
          <div
            key={s.label}
            className="card"
            style={{ flex: 1, textAlign: "center", minWidth: 140 }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#888",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              {s.label}
            </div>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#FF6051" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Update Status */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
          Update Order Status
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${order.status === s ? "btn-primary" : "btn-outline"}`}
              disabled={updating || order.status === s}
              onClick={() => handleStatusChange(s)}
              style={{ textTransform: "capitalize" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Customer Info */}
        <div className="card" style={{ flex: "1 1 380px" }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            Customer Information
          </div>
          <InfoRow label="Name" value={order.userId?.fullName} />
          <InfoRow label="Phone" value={order.userId?.mobileNumber} />
          <InfoRow label="Email" value={order.userId?.email} />
          {order.addressId && (
            <>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginTop: 16,
                  marginBottom: 8,
                  color: "#555",
                }}
              >
                Delivery Address
              </div>
              <InfoRow label="Name" value={order.addressId.fullName} />
              <InfoRow
                label="Address"
                value={`${order.addressId.address || ""} ${order.addressId.landmark || ""}`}
              />
              <InfoRow
                label="City"
                value={`${order.addressId.city || ""} ${order.addressId.state || ""} ${order.addressId.pincode || ""}`}
              />
              <InfoRow label="Phone" value={order.addressId.mobileNumber} />
            </>
          )}
        </div>

        {/* Price Summary */}
        <div className="card" style={{ flex: "1 1 380px" }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            Price Summary
          </div>
          <InfoRow label="Subtotal" value={formatCurrency(order.subtotal)} />
          <InfoRow
            label="Shipping"
            value={formatCurrency(order.shippingCost)}
          />
          <InfoRow
            label="Coupon Discount"
            value={
              order.couponDiscount
                ? `-${formatCurrency(order.couponDiscount)}`
                : "—"
            }
          />
          <div
            style={{
              borderTop: "1px solid #ececec",
              paddingTop: 12,
              marginTop: 8,
            }}
          >
            <InfoRow
              label="Grand Total"
              value={formatCurrency(order.grandTotal)}
            />
          </div>
          {order.razorpayPaymentId && (
            <>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginTop: 16,
                  marginBottom: 8,
                  color: "#555",
                }}
              >
                Payment Details
              </div>
              <InfoRow label="Razorpay ID" value={order.razorpayPaymentId} />
              <InfoRow label="Order ID" value={order.razorpayOrderId} />
            </>
          )}
          {order.trackingNumber && (
            <InfoRow label="Tracking #" value={order.trackingNumber} />
          )}
          {order.estimatedDeliveryDate && (
            <InfoRow
              label="Est. Delivery"
              value={new Date(order.estimatedDeliveryDate).toLocaleDateString()}
            />
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
          Order Items
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Size</th>
                <th>Color</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.products || []).map((item, i) => (
                <tr key={i}>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt=""
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <span style={{ fontWeight: 600 }}>
                        {item.productName || item.productId?.productName || "—"}
                      </span>
                    </div>
                  </td>
                  <td>
                    {item.sellerId?.shopName || item.sellerId?.fullName || "—"}
                  </td>
                  <td>{item.size || "—"}</td>
                  <td>{item.color || "—"}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ fontWeight: 600 }}>
                    {formatCurrency(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Notes & Cancel Info */}
      {(order.cancelReason || order.adminNotes || order.notes) && (
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            Notes
          </div>
          {order.cancelReason && (
            <InfoRow label="Cancel Reason" value={order.cancelReason} />
          )}
          {order.adminNotes && (
            <InfoRow label="Admin Notes" value={order.adminNotes} />
          )}
          {order.notes && (
            <InfoRow label="Customer Notes" value={order.notes} />
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
