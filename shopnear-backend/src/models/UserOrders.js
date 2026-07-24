const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserOrdersSchema = new Schema(
  {
    // ---------------- USER & ADDRESS ----------------
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    addressId: {
      type: Schema.Types.ObjectId,
      ref: "UserAddress",
      required: true,
    },

    // ---------------- ORDER ITEMS ----------------
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Products",
        },

        sellerId: {
          type: Schema.Types.ObjectId,
          ref: "Seller",
        },

        productName: { type: String },
        productImage: { type: String },

        size: { type: String }, // S / M / L from UI
        color: { type: String }, // Cream / Black etc.

        quantity: { type: Number, required: true },

        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },

        discount: { type: Number, default: 0 }, // per item
      },
    ],

    // ---------------- ORDER IDENTIFIERS ----------------
    orderId: { type: String, required: true, unique: true },

    // ---------------- PRICE SUMMARY ----------------
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 }, // GST — cart se copy hota hai
    couponDiscount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    // ---------------- COUPON ----------------
    couponCodeId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },

    // ---------------- PAYMENT ----------------
    paymentMode: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    // Razorpay Payment Details
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    // Refund Details
    refundId: { type: String },
    refundStatus: { type: String }, // initiated, processed, failed

    // ---------------- ORDER STATUS ----------------
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },

    // Individual seller-wise order status tracking
    sellerOrderStatus: [
      {
        sellerId: { type: Schema.Types.ObjectId, ref: "Seller" },
        status: {
          type: String,
          enum: [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
          ],
          default: "pending",
        },
        otp: { type: String },
        otpExpires: { type: Date },
        otpVerified: { type: Boolean, default: false },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // Tracking Information
    trackingNumber: { type: String },
    estimatedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },

    // Additional Notes
    notes: { type: String },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserOrders", UserOrdersSchema);
