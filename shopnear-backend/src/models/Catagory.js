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
    // Admin ke define kiye product fields; seller product form category select
    // karte hi inhe dikhata hai (types: text, number, select, multiselect, boolean)
    attributes: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        type: {
          type: String,
          enum: ["text", "number", "select", "multiselect", "boolean"],
          default: "text",
        },
        options: [{ type: String }],
        required: { type: Boolean, default: false },
        unit: { type: String, default: "" },
      },
    ],
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
