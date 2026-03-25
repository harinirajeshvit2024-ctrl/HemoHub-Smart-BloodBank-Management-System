const express = require("express");
const router = express.Router();
const BloodStock = require("../models/BloodStock");
const protect = require("../middleware/auth");

// GET all stock
router.get("/", async (req, res) => {
  const stock = await BloodStock.find();
  res.json(stock);
});

// POST add or update stock
router.post("/", protect, async (req, res) => {
  try {
    const { bloodGroup, units } = req.body;
    let stock = await BloodStock.findOne({ bloodGroup });
    if (stock) {
      stock.units += Number(units);
      await stock.save();
    } else {
      stock = await BloodStock.create({ bloodGroup, units: Number(units) });
    }
    res.json({ message: "Stock updated", stock });
  } catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
});

module.exports = router;