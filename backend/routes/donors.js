const express = require("express");
const router  = express.Router();
const Donor   = require("../models/Donor");
const protect = require("../middleware/auth");

const safeAuditLog = async (data) => {
  try {
    const auditLog = require("../utils/auditLog");
    await auditLog(data);
  } catch (e) {
    console.log("Audit skipped:", e.message);
  }
};

// ── GET all donors (admin only) ──────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// ── GET my donation history ──────────────────────────────────────────
// Only matches records where username exactly equals the logged-in user
// Never falls back to name — that caused cross-user contamination
router.get("/my-history", protect, async (req, res) => {
  try {
    const username = req.user.name; // "name" in JWT = the username string

    if (!username || username === "__legacy__") {
      return res.json([]);
    }

    const donors = await Donor.find({ username })
      .sort({ createdAt: -1 });

    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// ── GET my eligibility status ────────────────────────────────────────
router.get("/my-eligibility", protect, async (req, res) => {
  try {
    const username = req.user.name;

    // Safety — if somehow username is blank, just say eligible
    if (!username || username === "__legacy__") {
      return res.json({
        eligible: true,
        lastDonation: null,
        nextEligibleDate: null,
        daysLeft: 0,
        message: "You are eligible to donate!"
      });
    }

    // Find the most recent donor record for this exact username
    const donor = await Donor.findOne({ username })
      .sort({ lastDonation: -1 });

    // No record at all → definitely eligible
    if (!donor) {
      return res.json({
        eligible: true,
        lastDonation: null,
        nextEligibleDate: null,
        daysLeft: 0,
        message: "You have not donated yet. You are eligible!"
      });
    }

    // Has a record but admin hasn't recorded donation yet → eligible
    if (!donor.lastDonation) {
      return res.json({
        eligible: true,
        lastDonation: null,
        nextEligibleDate: null,
        daysLeft: 0,
        message: "No donation recorded yet. You are eligible!"
      });
    }

    // Has a real donation date → calculate 90-day window
    const lastDate        = new Date(donor.lastDonation);
    const nextEligibleDate = new Date(lastDate);
    nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);

    const today    = new Date();
    const daysLeft = Math.ceil(
      (nextEligibleDate - today) / (1000 * 60 * 60 * 24)
    );
    const eligible = daysLeft <= 0;

    res.json({
      eligible,
      lastDonation:      donor.lastDonation,
      nextEligibleDate:  eligible ? null : nextEligibleDate,
      daysLeft:          eligible ? 0 : daysLeft,
      bloodGroup:        donor.bloodGroup,
      message: eligible
        ? "You are eligible to donate again!"
        : `You can donate again in ${daysLeft} days (${nextEligibleDate.toLocaleDateString("en-IN")})`
    });

  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// ── GET smart donor match ────────────────────────────────────────────
router.get("/match", protect, async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;

    if (!bloodGroup) {
      return res.status(400).json({ message: "Blood group is required" });
    }

    const compatibility = {
      "A+":  ["A+", "A-", "O+", "O-"],
      "A-":  ["A-", "O-"],
      "B+":  ["B+", "B-", "O+", "O-"],
      "B-":  ["B-", "O-"],
      "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      "AB-": ["A-", "B-", "AB-", "O-"],
      "O+":  ["O+", "O-"],
      "O-":  ["O-"]
    };

    const compatibleGroups = compatibility[bloodGroup] || [bloodGroup];
    let query = { bloodGroup: { $in: compatibleGroups } };
    if (city && city.trim() !== "") {
      query.city = { $regex: city.trim(), $options: "i" };
    }

    const allDonors     = await Donor.find(query).sort({ createdAt: -1 });
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const taggedDonors = allDonors.map(donor => {
      if (!donor.lastDonation) {
        return { ...donor.toObject(), eligible: true, daysUntilEligible: 0 };
      }
      const lastDate    = new Date(donor.lastDonation);
      const eligible    = lastDate < ninetyDaysAgo;
      const eligibleDate = new Date(lastDate);
      eligibleDate.setDate(eligibleDate.getDate() + 90);
      const daysLeft = Math.ceil(
        (eligibleDate - new Date()) / (1000 * 60 * 60 * 24)
      );
      return {
        ...donor.toObject(),
        eligible,
        daysUntilEligible: eligible ? 0 : daysLeft
      };
    });

    const eligibleCount = taggedDonors.filter(d => d.eligible).length;
    res.json({
      donors:  taggedDonors,
      message: `Found ${taggedDonors.length} donor(s) — ${eligibleCount} eligible now`
    });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// ── POST register new donor ──────────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const { name, age, weight, bloodGroup, phone, city } = req.body;
    const username = req.user.name;

    // Guard — should never happen but just in case
    if (!username || username === "__legacy__") {
      return res.status(400).json({
        message: "Session error. Please log out and log in again."
      });
    }

    // 90-day check — ONLY looks at this exact user's records
    const existingDonor = await Donor.findOne({ username })
      .sort({ lastDonation: -1 });

    if (existingDonor && existingDonor.lastDonation) {
      const daysSince = Math.floor(
        (new Date() - new Date(existingDonor.lastDonation))
        / (1000 * 60 * 60 * 24)
      );
      if (daysSince < 90) {
        return res.status(400).json({
          message: `You donated ${daysSince} days ago. You must wait ${90 - daysSince} more days before registering again.`
        });
      }
    }

    const donor = new Donor({
      name,
      username, // always saved now
      age,
      weight,
      bloodGroup,
      phone,
      city
    });
    await donor.save();

    await safeAuditLog({
      action:      "DONOR_REGISTERED",
      performedBy: username,
      role:        "Donor",
      details:     `Donor registered. Blood group: ${bloodGroup}, City: ${city}`,
      ipAddress:   req.ip,
      status:      "success"
    });

    res.json({ message: "Donor registered", donor });
  } catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
});

// ── PATCH record actual donation (admin only) ────────────────────────
router.patch("/:id/record-donation", protect, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    if (donor.lastDonation) {
      const daysSince = Math.floor(
        (new Date() - new Date(donor.lastDonation))
        / (1000 * 60 * 60 * 24)
      );
      if (daysSince < 90) {
        return res.status(400).json({
          message: `Donor not eligible yet. ${90 - daysSince} days remaining.`
        });
      }
    }

    donor.lastDonation = new Date();
    await donor.save();

    const BloodStock = require("../models/BloodStock");
    let stock = await BloodStock.findOne({ bloodGroup: donor.bloodGroup });
    if (stock) {
      stock.units += 1;
      await stock.save();
    } else {
      await BloodStock.create({ bloodGroup: donor.bloodGroup, units: 1 });
    }

    await safeAuditLog({
      action:      "DONATION_RECORDED",
      performedBy: req.user.name || "Admin",
      role:        req.user.role,
      details:     `Donation recorded for ${donor.name}. 1 unit of ${donor.bloodGroup} added to stock.`,
      ipAddress:   req.ip,
      status:      "success"
    });

    res.json({
      message: `Donation recorded for ${donor.name}. 1 unit of ${donor.bloodGroup} added to stock.`,
      donor
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE donor ─────────────────────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    await Donor.findByIdAndDelete(req.params.id);

    await safeAuditLog({
      action:      "DONOR_DELETED",
      performedBy: req.user.name || "Admin",
      role:        req.user.role,
      details:     `Donor ${donor.name} (${donor.bloodGroup}) deleted.`,
      ipAddress:   req.ip,
      status:      "success"
    });

    res.json({ message: "Donor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;