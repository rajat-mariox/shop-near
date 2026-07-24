const mongoose = require("mongoose");

const offersSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    offerType: {
      type: String,
      enum: ["category", "brand", "product", "general"],
      default: "general",
    },
    priceStartsAt: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
    },
    discountAmount: {
      type: Number,
    },
    image: {
      type: String,
      required: true,
    },
    // Card ka gradient: bgColor se bgColorEnd tak. bgColorEnd na ho to flat colour.
    bgColor: {
      type: String,
      default: "#FFE9C6",
    },
    bgColorEnd: {
      type: String,
      default: "",
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    brands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brands",
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOnHome: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
      // Higher priority offers show first
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for active offers
offersSchema.index({ isActive: 1, displayOnHome: 1, endDate: 1 });

module.exports = mongoose.model("Offers", offersSchema);
