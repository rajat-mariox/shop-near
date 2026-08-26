const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      default: "",
      trim: true,
    },
    // Home screen ke header par dikhne wala wallet balance
    walletBalance: {
      type: Number,
      default: 0,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    profileImages: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      defailt: "Male",
      enum: ["Male", "Female", "Other"],
      required: false,
    },
    dob: {
      type: String,
      default: "",
    },
    countryCode: {
      type: String,
      required: [true, "Country code is required!"],
      default: "+91",
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required!"],
      unique: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number!"],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Account deletion (Play Store policy): 7 din ka grace period,
    // login karne par recover, warna cron permanently delete kar deta hai
    deletionRequestedAt: {
      type: Date,
      default: null,
      index: true,
    },
    deletionReason: {
      type: String,
      default: "",
    },
    notificationAllowed: {
      type: Boolean,
      default: true,
    },
    // FCM push notification token (app login/refresh par update hota hai)
    deviceToken: {
      type: String,
      default: "",
    },
    deviceType: {
      type: String,
      enum: ["android", "ios", ""],
      default: "",
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [long, lat]
    },
  },
  { timestamps: true }
);

UserSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", UserSchema);
module.exports = User;
