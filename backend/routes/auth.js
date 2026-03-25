const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auditLog = require("../utils/auditLog");

const SECRET = "hemohub_secret_key";

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      await auditLog({
        action: "REGISTER_FAILED",
        performedBy: username,
        role,
        details: "Username already taken",
        ipAddress: req.ip,
        status: "failed"
      });
      return res.status(400).json({ message: "Username already taken." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, username, password: hashed, role });
    await user.save();

    await auditLog({
      action: "USER_REGISTERED",
      performedBy: username,
      role,
      details: `New ${role} account created`,
      ipAddress: req.ip,
      status: "success"
    });

    res.json({ message: "Account created successfully" });
  } catch (err) {
    res.status(400).json({ message: "Error creating account", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const user = await User.findOne({ username, role });
    if (!user) {
      await auditLog({
        action: "LOGIN_FAILED",
        performedBy: username,
        role,
        details: "User not found",
        ipAddress: req.ip,
        status: "failed"
      });
      return res.status(401).json({ message: "Invalid username, password or role" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await auditLog({
        action: "LOGIN_FAILED",
        performedBy: username,
        role,
        details: "Wrong password",
        ipAddress: req.ip,
        status: "failed"
      });
      return res.status(401).json({ message: "Invalid username, password or role" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      SECRET,
      { expiresIn: "8h" }
    );

    await auditLog({
      action: "LOGIN_SUCCESS",
      performedBy: username,
      role,
      details: `${role} logged in successfully`,
      ipAddress: req.ip,
      status: "success"
    });

    res.json({
      token,
      role: user.role,
      name: user.name,
      username: user.username
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;