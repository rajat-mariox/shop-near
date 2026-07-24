const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const BannersSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required!"],
    },
    subtitle: {
      type: String,
    },
    image: {
      type: String,
      required: [true, "image is required!"],
    },
    rank: {
      type: Number,
      default: 0,
    },
    redirectType: {
      type: String,
      enum: ["category", "product", "seller", "external"],
      default: "category",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Products",
    },
    startDate: { type: Date },
    expireDate: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

var Banners = mongoose.model("Banners", BannersSchema);

module.exports = Banners;
