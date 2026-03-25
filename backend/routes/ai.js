const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

router.post("/tips", async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: req.body.prompt }],
      max_tokens: 1000,
      temperature: 0.7
    });
    const text = completion.choices[0].message.content;
    res.json({ content: [{ text }] });
  } catch (err) {
    console.log("AI Tips Error:", err.message);
    res.status(500).json({ message: "AI error", error: err.message });
  }
});

router.post("/forecast", async (req, res) => {
  try {
    const { stock, requests } = req.body;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const stockSummary = stock
      .map(s => `${s.bloodGroup}: ${s.units} units`)
      .join(", ");

    const recentRequests = (requests || []).slice(0, 20);
    const requestSummary = recentRequests.length > 0
      ? recentRequests.map(r => `${r.bloodGroup}(${r.units}u,${r.status})`).join(", ")
      : "No recent requests";

    const prompt = `You are a blood bank AI analyst.
Current blood stock: ${stockSummary}
Recent requests: ${requestSummary}

Return ONLY a JSON array. No explanation. No markdown. No text before or after.
Example format:
[{"group":"O+","currentUnits":5,"predictedDemand":12,"riskLevel":"High","reason":"High demand low stock","action":"Contact O+ donors immediately"}]

Rules:
- riskLevel must be exactly High, Medium, or Low
- Only include blood groups with risk
- Maximum 6 items
- Return empty array [] if all stock looks fine`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.1
    });

    const raw = completion.choices[0].message.content;
    console.log("Forecast raw response:", raw);

    // Clean the response aggressively
    let clean = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/^[^[{]*/s, "")
      .trim();

    // Find the JSON array in the response
    const startIndex = clean.indexOf("[");
    const endIndex = clean.lastIndexOf("]");

    if (startIndex === -1 || endIndex === -1) {
      console.log("No JSON array found in response");
      return res.json({ forecast: [] });
    }

    clean = clean.substring(startIndex, endIndex + 1);
    console.log("Cleaned forecast:", clean);

    const parsed = JSON.parse(clean);
    res.json({ forecast: parsed });

  } catch (err) {
    console.log("Forecast Error:", err.message);
    res.status(500).json({ message: "Forecast error", error: err.message });
  }
});

router.post("/emergency", async (req, res) => {
  try {
    const { stock, requests, donors } = req.body;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const criticalStock = (stock || []).filter(s => s.units < 10);
    const pendingRequests = (requests || []).filter(r => r.status === "Pending");
    const highUrgency = (requests || []).filter(r => r.urgency === "High");
    const eligibleDonors = (donors || []).filter(d => !d.lastDonation);

    const prompt = `You are an emergency AI system for a blood bank in India.

CRITICAL DATA:
- Blood groups under 10 units: ${criticalStock.map(s => `${s.bloodGroup}(${s.units})`).join(", ") || "None"}
- Total pending requests: ${pendingRequests.length}
- High urgency requests: ${highUrgency.map(r => `${r.bloodGroup}(${r.units}u)`).join(", ") || "None"}
- Total registered donors: ${(donors || []).length}
- Eligible donors: ${eligibleDonors.length}

Return ONLY a JSON object. No explanation. No markdown. No text before or after.
Example format:
{"alertLevel":"Critical","summary":"Short one sentence summary","immediateActions":["Action 1","Action 2","Action 3"],"predictedImpact":"What happens if no action in 24 hours","timeToAct":"2 hours"}

alertLevel must be exactly one of: Critical, High, Medium, Low, Normal`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.1
    });

    const raw = completion.choices[0].message.content;
    console.log("Emergency raw response:", raw);

    // Clean aggressively
    let clean = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Find the JSON object
    const startIndex = clean.indexOf("{");
    const endIndex = clean.lastIndexOf("}");

    if (startIndex === -1 || endIndex === -1) {
      console.log("No JSON object found");
      return res.json({
        alert: {
          alertLevel: "Normal",
          summary: "Blood bank situation appears stable.",
          immediateActions: ["Monitor stock levels", "Check pending requests", "Update donor records"],
          predictedImpact: "No immediate risk detected.",
          timeToAct: "No urgent action needed"
        }
      });
    }

    clean = clean.substring(startIndex, endIndex + 1);
    console.log("Cleaned emergency:", clean);

    const parsed = JSON.parse(clean);
    res.json({ alert: parsed });

  } catch (err) {
    console.log("Emergency Error:", err.message);
    res.status(500).json({ message: "Emergency error", error: err.message });
  }
});

module.exports = router;