const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const BrandsSchema = new Schema(
  {
    brand: { type: String, required: [true, "brand require!"] },
    image: { type: String, required: [true, "description require!"] },
    offerText: { type: String, default: "" },
    // Card ke border aur offer badge ka rang (design me har brand ka apna rang hai)
    themeColor: { type: String, default: "#B11116" },
    rank: { type: Number, default: 0 },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

var Brands = mongoose.model("Brands", BrandsSchema);

module.exports = Brands;
