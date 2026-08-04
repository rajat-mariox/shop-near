const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Shop ka delivery agent / servant — seller apne panel se add karta hai
// aur shipped order par assign karta hai, taaki customer directly usse connect kare
const DeliveryAgentSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },

    // Optional extra details
    vehicleNumber: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ek seller ke andar same mobile ka duplicate agent na bane
DeliveryAgentSchema.index({ sellerId: 1, mobile: 1 }, { unique: true });

module.exports = mongoose.model("DeliveryAgent", DeliveryAgentSchema);
