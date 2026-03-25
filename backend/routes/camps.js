const express = require("express");
const router = express.Router();
const Camp = require("../models/Camp");
const protect = require("../middleware/auth");

// GET all camps
router.get("/", async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: 1 });
    res.json(camps);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// POST create new camp (admin only)
router.post("/", protect, async (req, res) => {
  try {
    const camp = new Camp(req.body);
    await camp.save();
    res.json({ message: "Camp created", camp });
  } catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
});

// PATCH register donor for camp
router.patch("/:id/register", protect, async (req, res) => {
  try {
    const { username } = req.body;
    const camp = await Camp.findById(req.params.id);

    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    if (camp.registered.includes(username)) {
      return res.status(400).json({ message: "Already registered" });
    }

    if (camp.registered.length >= camp.maxSlots) {
      return res.status(400).json({ message: "Camp is full" });
    }

    camp.registered.push(username);
    await camp.save();

    res.json({ message: "Registered successfully", camp });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// PATCH unregister donor from camp
router.patch("/:id/unregister", protect, async (req, res) => {
  try {
    const { username } = req.body;
    const camp = await Camp.findById(req.params.id);

    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    camp.registered = camp.registered.filter(u => u !== username);
    await camp.save();

    res.json({ message: "Unregistered successfully", camp });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// DELETE camp (admin only)
router.delete("/:id", protect, async (req, res) => {
  try {
    await Camp.findByIdAndDelete(req.params.id);
    res.json({ message: "Camp deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

module.exports = router;