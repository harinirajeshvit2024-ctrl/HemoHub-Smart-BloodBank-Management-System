const express = require("express");
const router = express.Router();
const mysql = require("../config/mysql");
const protect = require("../middleware/auth");

router.get("/logs", protect, async (req, res) => {
  try {
    const [rows] = await mysql.execute(
      "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500"
    );
    res.json(rows);
  } catch (err) {
    console.log("Audit logs error:", err.message);
    res.status(500).json({ message: "MySQL error", error: err.message });
  }
});

router.get("/export/csv", protect, async (req, res) => {
  try {
    const [rows] = await mysql.execute(
      "SELECT * FROM audit_logs ORDER BY created_at DESC"
    );
    const headers = ["ID","Action","Performed By","Role","Details","IP Address","Status","Created At"];
    const csvRows = rows.map(row => [
      row.id,
      row.action,
      row.performed_by,
      row.role,
      `"${(row.details || "").replace(/"/g, '""')}"`,
      row.ip_address || "",
      row.status,
      new Date(row.created_at).toLocaleString("en-IN")
    ].join(","));
    const csv = [headers.join(","), ...csvRows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=hemohub_audit_logs.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Export error", error: err.message });
  }
});

router.get("/export/json", protect, async (req, res) => {
  try {
    const [rows] = await mysql.execute(
      "SELECT * FROM audit_logs ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Export error", error: err.message });
  }
});

module.exports = router;