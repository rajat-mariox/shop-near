const mongoose = require("mongoose");

const DeliverySettingsSchema = new mongoose.Schema(
  {
    estimatedDeliveryTime: {
      type: Number, // in minutes
      default: 20,
    },
    deliveryCharge: {
      type: Number,
      default: 50,
    },
    location: {
      type: String,
      default: "Home - Sultan Bhag, Erraga",
    },
    freeDeliveryAbove: {
      type: Number, // Order amount above which delivery is free
      default: 300,
    },
    maxDeliveryRadius: {
      type: Number, // in km
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
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
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("DeliverySettings", DeliverySettingsSchema);
