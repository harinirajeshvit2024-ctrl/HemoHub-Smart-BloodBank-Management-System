const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  bloodGroup:  { type: String, required: true },
  units:       { type: Number, required: true },
  urgency:     { type: String, enum: ["Normal", "Medium", "High"], default: "Normal" },
  status:      { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  date:        { type: Date, default: Date.now }
});

module.exports = mongoose.model("BloodRequest", RequestSchema);