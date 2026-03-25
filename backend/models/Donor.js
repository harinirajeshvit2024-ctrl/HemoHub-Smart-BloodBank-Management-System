const mongoose = require("mongoose");

const DonorSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  age:          { type: Number, required: true },
  weight:       { type: Number, required: true },
  bloodGroup:   { type: String, required: true },
  phone:        { type: String },
  city:         { type: String },
  lastDonation: { type: Date, default: null },
  createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model("Donor", DonorSchema);