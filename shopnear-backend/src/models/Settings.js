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
    // Home screen ke header (delivery + search + banner area) ka background —
    // admin se image/video upload hota hai; khali ho to app apna default dikhati hai
    homeHeaderBg: { type: String, default: "" },
    homeHeaderBgType: {
      type: String,
      enum: ["image", "video", ""],
      default: "",
    },
    // Header background ke upar festive string lights dikhani hain ya nahi (admin toggle)
    homeHeaderLights: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", SettingsSchema);
