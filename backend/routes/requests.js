const express = require("express");
const router = express.Router();
const BloodRequest = require("../models/BloodRequest");
const BloodStock = require("../models/BloodStock");
const protect = require("../middleware/auth");

// GET all requests
router.get("/", protect, async (req, res) => {
  try {
    const requests = await BloodRequest.find().sort({ date: -1 });
    res.json(requests);
  } catch (err) {
    console.log("GET requests error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST new request
router.post("/", protect, async (req, res) => {
  try {
    console.log("POST /requests body:", JSON.stringify(req.body));
    
    const { patientName, bloodGroup, units, urgency } = req.body;

    console.log("Fields:", { patientName, bloodGroup, units, urgency });

    if (!patientName || !bloodGroup || !units) {
      return res.status(400).json({
        message: `Missing fields: ${!patientName ? 'patientName ' : ''}${!bloodGroup ? 'bloodGroup ' : ''}${!units ? 'units' : ''}`
      });
    }

    const request = new BloodRequest({
      patientName,
      bloodGroup,
      units: parseInt(units),
      urgency: urgency || "Normal"
    });

    await request.save();
    res.json({ message: "Request submitted", request });
  } catch (err) {
    console.log("POST request error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// PATCH approve or reject
router.patch("/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;
    console.log("PATCH request:", req.params.id, "status:", status);

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // ✅ PREVENT double processing
    if (request.status !== "Pending") {
      return res.status(400).json({
        message: `Request already ${request.status}. Cannot change again.`
      });
    }

    console.log("Request:", request.patientName, request.bloodGroup, request.units);

    if (status === "Approved") {
      const stock = await BloodStock.findOne({ bloodGroup: request.bloodGroup });
      console.log("Stock:", stock ? stock.units : "NOT FOUND");

      if (!stock) {
        return res.status(400).json({
          message: `No ${request.bloodGroup} stock found. Please add stock in Blood Inventory first.`
        });
      }

      if (stock.units < request.units) {
        return res.status(400).json({
          message: `Insufficient ${request.bloodGroup} stock! Available: ${stock.units} units, Needed: ${request.units} units.`
        });
      }

      stock.units -= request.units;
      await stock.save();
      console.log("Stock updated to:", stock.units);
    }

    request.status = status;
    await request.save();
    console.log("Status saved:", status);

    // Send response immediately
    res.json({ message: "Status updated", request });

    // Audit log after response — never blocks the response
    try {
      const auditLog = require("../utils/auditLog");
      await auditLog({
        action: `REQUEST_${status.toUpperCase()}`,
        performedBy: req.user.name || "Admin",
        role: req.user.role,
        details: `${request.units} units of ${request.bloodGroup} for ${request.patientName} was ${status}`,
        ipAddress: req.ip,
        status: "success"
      });
    } catch (auditErr) {
      console.log("Audit skipped:", auditErr.message);
    }

 } catch (err) {
    console.log("PATCH error FULL:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message || "Unknown error", stack: err.stack });
    }
  }
});

module.exports = router;