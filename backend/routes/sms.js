const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");

router.post("/notify", protect, async (req, res) => {
  try {
    const { phone, name, bloodGroup, city } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // For now we log — Twilio integration goes here
    console.log(`📱 SMS to ${name} (${phone}): 
    Urgent blood donation request for ${bloodGroup} near ${city}.
    Please contact HemoHub blood bank immediately.`);

    // Simulate SMS sent
    res.json({
      message: "SMS sent successfully",
      to: phone,
      name
    });

  } catch (err) {
    res.status(500).json({ message: "SMS error", error: err.message });
  }
});

module.exports = router;