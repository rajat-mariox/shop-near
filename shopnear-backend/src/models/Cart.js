const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Cart items
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        sellerId: {
          type: Schema.Types.ObjectId,
          ref: "Seller",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },
        selectedColor: {
          name: String,
          code: String,
        },
        selectedSize: String,
        price: Number, // Price at the time of adding
        discountPrice: Number,
        productName: String,
        productImage: String,
      },
    ],

    // Total calculations
    subtotal: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    // Applied coupon/promo
    appliedCoupon: {
      code: String,
      discountType: String, // 'percentage' or 'fixed'
      discountValue: Number,
    },

    // Delivery address
    deliveryAddress: {
      userId: Schema.Types.ObjectId,
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for faster queries
CartSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model("Cart", CartSchema);
