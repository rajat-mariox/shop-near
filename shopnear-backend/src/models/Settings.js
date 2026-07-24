const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SettingsSchema = new Schema(
  {
    termsAndConditions: { type: String, default: "" },
    privacyPolicy: { type: String, default: "" },
    aboutUs: { type: String, default: "" },
    shippingPolicy: { type: String, default: "" },
    cancellationPolicy: { type: String, default: "" },
    refundPolicy: { type: String, default: "" },
    contactUs: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", SettingsSchema);
