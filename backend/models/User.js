const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["Admin", "Staff", "Donor"], required: true },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);