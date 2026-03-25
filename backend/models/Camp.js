const mongoose = require("mongoose");

const CampSchema = new mongoose.Schema({
  location:    { type: String, required: true },
  address:     { type: String },
  city:        { type: String, required: true },
  date:        { type: Date, required: true },
  organizer:   { type: String },
  maxSlots:    { type: Number, default: 50 },
  registered:  [{ type: String }],
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model("Camp", CampSchema);