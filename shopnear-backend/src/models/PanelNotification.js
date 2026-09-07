const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Seller panel / admin panel ke liye in-app notifications (bell icon).
 * seller: recipientId = seller _id. admin: recipientId null (sab admins ko dikhti hai).
 */
const PanelNotificationSchema = new Schema(
  {
    recipientType: {
      type: String,
      enum: ["seller", "admin"],
      required: true,
      index: true,
    },
    recipientId: { type: Schema.Types.ObjectId, default: null, index: true },
    // new_order | payment_received | order_cancelled | new_review | seller_pending | info
    type: { type: String, default: "info" },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    // { orderId, orderNumber, sellerId, productId, ... } - panel isse navigate karta hai
    data: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

PanelNotificationSchema.index({ recipientType: 1, recipientId: 1, createdAt: -1 });

module.exports = mongoose.model("PanelNotification", PanelNotificationSchema);
