require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donors");
const requestRoutes = require("./routes/requests");
const stockRoutes = require("./routes/stock");
const aiRoutes = require("./routes/ai");
const smsRoutes = require("./routes/sms");
const campRoutes = require("./routes/camps");
const auditRoutes = require("./routes/audit");

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`>>> ${req.method} ${req.path}`, JSON.stringify(req.body));
  next();
});
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/hemohub")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/camps", campRoutes);
app.use("/api/audit", auditRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));