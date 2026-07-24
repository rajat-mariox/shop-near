const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductsSchema = new Schema(
  {
    // ---------------- BASIC DETAILS ----------------
    productName: { type: String, required: true, index: true },
    brand: { type: String, default: "" },

    // Shop reference (Trendy Apparel etc.)
    shopId: { type: Schema.Types.ObjectId, ref: "Seller" },

    // Category (shirts, jeans, skirts, shorts…)
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },

    // ---------------- IMAGES ----------------
    productImages: [
      {
        url: String,
      },
    ],

    // ---------------- VARIANTS ----------------
    colors: [
      {
        name: String, // "Beige", "Black"
        code: String, // "#F2D3C3"
      },
    ],

    sizes: [
      {
        label: String, // "S" / "M" / "L"
        inStock: { type: Boolean, default: true },
      },
    ],

    // ---------------- PRICING ----------------
    price: { type: Number, required: true }, // main price
    discountPrice: { type: Number }, // price after discount
    discountPercent: { type: Number }, // 20%
    currency: { type: String, default: "₹" },

    // ---------------- STOCK ----------------
    stock: { type: Number, default: 0 }, // total units

    // ---------------- RATING ----------------
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },

    // ---------------- DESCRIPTION ----------------
    description: { type: String, default: "" },

    descriptionImages: [
      {
        image: String,
      },
    ],

    highlights: [
      {
        text: String, // bullet points
      },
    ],

    features: { type: String, default: "" },

    // ---------------- FLAGS ----------------
    isFeatured: { type: Boolean, default: false },
    showOnDashboard: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", ProductsSchema);
