const express      = require("express");
const router       = express.Router();
const BloodRequest = require("../models/BloodRequest");
const BloodStock   = require("../models/BloodStock");
const protect      = require("../middleware/auth");

// GET requests — admin sees all, staff sees only their own
router.get("/", protect, async (req, res) => {
  try {
    let requests;
    if (req.user.role === "Admin") {
      requests = await BloodRequest.find().sort({ date: -1 });
    } else {
      requests = await BloodRequest.find({
        submittedBy: req.user.name
      }).sort({ date: -1 });
    }
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new request — saves submittedBy from JWT
router.post("/", protect, async (req, res) => {
  try {
    const { patientName, bloodGroup, units, urgency } = req.body;

    if (!patientName || !bloodGroup || !units) {
      return res.status(400).json({
        message: `Missing fields: ${!patientName ? "patientName " : ""}${!bloodGroup ? "bloodGroup " : ""}${!units ? "units" : ""}`
      });
    }

    const request = new BloodRequest({
      patientName,
      bloodGroup,
      units:       parseInt(units),
      urgency:     urgency || "Normal",
      submittedBy: req.user.name
    });

    await request.save();
    res.json({ message: "Request submitted", request });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH approve or reject — admin only
router.patch("/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        message: `Request already ${request.status}. Cannot change again.`
      });
    }

    if (status === "Approved") {
      const stock = await BloodStock.findOne({
        bloodGroup: request.bloodGroup
      });

      if (!stock) {
        return res.status(400).json({
          message: `No ${request.bloodGroup} stock found. Please add stock first.`
        });
      }

      if (stock.units < request.units) {
        return res.status(400).json({
          message: `Insufficient stock! Available: ${stock.units} units, Needed: ${request.units} units.`
        });
      }

      stock.units -= request.units;
      await stock.save();
    }

    request.status = status;
    await request.save();

    res.json({ message: "Status updated", request });

    // Audit log after response
    try {
      const auditLog = require("../utils/auditLog");
      await auditLog({
        action:      `REQUEST_${status.toUpperCase()}`,
        performedBy: req.user.name || "Admin",
        role:        req.user.role,
        details:     `${request.units} units of ${request.bloodGroup} for ${request.patientName} was ${status}`,
        ipAddress:   req.ip,
        status:      "success"
      });
    } catch (auditErr) {
      console.log("Audit skipped:", auditErr.message);
    }

  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ message: err.message });
    }
  }
});

module.exports = router;