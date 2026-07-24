const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const UserAddressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    fullName: { type: String, required: [true, "fullName required!"] },
    // email: {
    //   type: String,
    //   required: "email require!",
    // },
    address: {
      type: String,
      required: "address require!",
    },
    city: {
      type: String,
      required: "city require!",
    },
    state: {
      type: String,
      required: "state require!",
    },
    // country: {
    //   type: String,
    //   required: "state require!",
    // },
    pinCode: {
      type: Number,
      required: "pinCode require!",
    },
    addressType: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      default: "",
    },
    // Live location se aaye coordinates (optional) — delivery distance ke kaam aayenge
    lat: {
      type: Number,
      default: null,
    },
    lng: {
      type: Number,
      default: null,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

var UserAddress = mongoose.model("UserAddress", UserAddressSchema);

module.exports = UserAddress;
