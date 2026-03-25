const express = require("express");
const router = express.Router();
const mysql = require("../config/mysql");
const protect = require("../middleware/auth");

// GET all audit logs
router.get("/logs", protect, async (req, res) => {
  try {
    const [rows] = await mysql.execute(
      "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200"
    );
    res.json(rows);
  } catch (err) {
    console.log("Audit logs error:", err.message);
    res.status(500).json({ message: "MySQL error", error: err.message });
  }
});

module.exports = router;