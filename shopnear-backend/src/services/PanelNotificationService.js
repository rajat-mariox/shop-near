const PanelNotification = require("../models/PanelNotification");
const Seller = require("../models/Seller");
const Product = require("../models/Product");

/**
 * Seller/admin panel notifications. Event helpers fire-and-forget hain:
 * kabhi throw nahi karte taaki order/rating flow na toote.
 */
module.exports = () => {
  const notify = async ({
    recipientType,
    recipientId = null,
    type = "info",
    title,
    message = "",
    data = {},
  }) => {
    try {
      return await PanelNotification.create({
        recipientType,
        recipientId,
        type,
        title,
        message,
        data,
      });
    } catch (e) {
      console.error("PanelNotification create failed:", e.message);
      return null;
    }
  };

  const notifySeller = (sellerId, payload) =>
    notify({ recipientType: "seller", recipientId: sellerId, ...payload });
  const notifyAdmin = (payload) =>
    notify({ recipientType: "admin", recipientId: null, ...payload });

  const scopeQuery = ({ recipientType, recipientId }) =>
    recipientType === "admin"
      ? { recipientType: "admin" }
      : { recipientType: "seller", recipientId };

  const list = async ({ recipientType, recipientId, page = 1, limit = 20 }) => {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const q = scopeQuery({ recipientType, recipientId });
    const [items, total, unread] = await Promise.all([
      PanelNotification.find(q)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PanelNotification.countDocuments(q),
      PanelNotification.countDocuments({ ...q, isRead: false }),
    ]);
    return { items, total, unread, page, limit };
  };

  const unreadCount = async (scope) =>
    PanelNotification.countDocuments({ ...scopeQuery(scope), isRead: false });

  const markRead = async (scope, id) =>
    PanelNotification.updateOne(
      { _id: id, ...scopeQuery(scope) },
      { $set: { isRead: true } }
    );

  const markAllRead = async (scope) =>
    PanelNotification.updateMany(
      { ...scopeQuery(scope), isRead: false },
      { $set: { isRead: true } }
    );

  /* ---------------- Event helpers (fire-and-forget) ---------------- */

  const sellerIdsOf = (order) => [
    ...new Set(
      (order.sellerOrderStatus || [])
        .map((s) => String(s.sellerId))
        .concat((order.products || []).map((p) => String(p.sellerId)))
        .filter(Boolean)
    ),
  ];

  const money = (n) => "Rs " + Number(n || 0).toLocaleString("en-IN");

  // COD order place hone par ya online payment verify hone par
  const orderPlaced = (order) => {
    try {
      const paid = order.paymentMode === "online";
      const orderNumber = order.orderId;
      for (const sellerId of sellerIdsOf(order)) {
        const mine = (order.products || []).filter(
          (p) => String(p.sellerId) === sellerId
        );
        const itemCount = mine.reduce((a, p) => a + (p.quantity || 1), 0);
        const amount = mine.reduce((a, p) => a + (p.totalPrice || 0), 0);
        notifySeller(sellerId, {
          type: paid ? "payment_received" : "new_order",
          title: paid ? "New paid order" : "New order (COD)",
          message: `${orderNumber}: ${itemCount} item${itemCount > 1 ? "s" : ""}, ${money(amount)}. Please accept the order.`,
          data: { orderId: String(order._id), orderNumber, sellerId },
        });
      }
      notifyAdmin({
        type: "new_order",
        title: paid ? "New paid order" : "New order (COD)",
        message: `${orderNumber} placed, total ${money(order.grandTotal)}.`,
        data: { orderId: String(order._id), orderNumber },
      });
    } catch (e) {
      console.error("orderPlaced notification failed:", e.message);
    }
  };

  const orderCancelled = (order, by = "customer") => {
    try {
      const orderNumber = order.orderId;
      for (const sellerId of sellerIdsOf(order)) {
        notifySeller(sellerId, {
          type: "order_cancelled",
          title: "Order cancelled",
          message: `${orderNumber} was cancelled by the ${by}.`,
          data: { orderId: String(order._id), orderNumber, sellerId },
        });
      }
      notifyAdmin({
        type: "order_cancelled",
        title: "Order cancelled",
        message: `${orderNumber} was cancelled by the ${by}.`,
        data: { orderId: String(order._id), orderNumber },
      });
    } catch (e) {
      console.error("orderCancelled notification failed:", e.message);
    }
  };

  const newReview = async (rating, productId) => {
    try {
      const product = await Product.findById(productId).select("productName shopId");
      const sellerId = rating.sellerId || (product && product.shopId);
      if (!sellerId) return;
      notifySeller(sellerId, {
        type: "new_review",
        title: `New ${rating.rating}-star review`,
        message: `${product ? product.productName : "A product"}: ${rating.reviewText || "No comment"}`,
        data: { productId: String(productId), ratingId: String(rating._id) },
      });
    } catch (e) {
      console.error("newReview notification failed:", e.message);
    }
  };

  const sellerPendingApproval = async (sellerId) => {
    try {
      const seller = await Seller.findById(sellerId).select("shopName fullName city");
      notifyAdmin({
        type: "seller_pending",
        title: "New seller awaiting approval",
        message: `${seller?.shopName || seller?.fullName || "A seller"}${seller?.city ? " (" + seller.city + ")" : ""} submitted their profile for verification.`,
        data: { sellerId: String(sellerId) },
      });
    } catch (e) {
      console.error("sellerPendingApproval notification failed:", e.message);
    }
  };

  return {
    notify,
    notifySeller,
    notifyAdmin,
    list,
    unreadCount,
    markRead,
    markAllRead,
    orderPlaced,
    orderCancelled,
    newReview,
    sellerPendingApproval,
  };
};
