let promisePool = null;

try {
  const mysql = require("mysql2");

  const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root1234",
    database: "hemohub_logs",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  promisePool = pool.promise();

  pool.getConnection((err, connection) => {
    if (err) {
      console.log("⚠ MySQL connection failed (non-critical):", err.message);
      return;
    }
    console.log("✅ MySQL connected");
    connection.release();
  });

} catch (err) {
  console.log("⚠ MySQL module error (non-critical):", err.message);
}

module.exports = {
  execute: async (...args) => {
    if (!promisePool) {
      console.log("⚠ MySQL not available, skipping query");
      return [[], []];
    }
    try {
      return await promisePool.execute(...args);
    } catch (err) {
      console.log("⚠ MySQL query failed (non-critical):", err.message);
      return [[], []];
    }
  }
};