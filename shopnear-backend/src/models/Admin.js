const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const adminSchema = new Schema({
  name: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

var Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
