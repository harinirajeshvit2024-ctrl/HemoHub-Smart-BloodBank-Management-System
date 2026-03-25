const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema({
  bloodGroup: { type: String, required: true, unique: true },
  units:      { type: Number, default: 0 }
});

module.exports = mongoose.model("BloodStock", StockSchema);