const auditLog = async ({
  action = "UNKNOWN",
  performedBy = "unknown",
  role = "unknown",
  details = "",
  ipAddress = "",
  status = "success"
} = {}) => {
  try {
    const mysql = require("../config/mysql");
    await mysql.execute(
      `INSERT INTO audit_logs 
       (action, performed_by, role, details, ip_address, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [action, performedBy, role, details, ipAddress, status]
    );
  } catch (err) {
    console.log("⚠ Audit log skipped:", err.message);
  }
};

module.exports = auditLog;