const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const CategorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: [true, "categoryName is required!"],
    },
    image: {
      type: String,
    },
    description: {
      type: String,
      default: "",
    },
    rank: { type: Number, default: 1, required: [true, "rank is required!"] },
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

var Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
