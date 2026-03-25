import { useState } from "react";

export default function EligibilityChecker() {
  const [form, setForm] = useState({
    age: "",
    weight: "",
    lastDonation: "",
    conditions: ""
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkEligibility = async () => {
    if (!form.age || !form.weight) {
      alert("Please enter age and weight at minimum.");
      return;
    }
    setLoading(true);

    const prompt = `Blood donation eligibility check for India.
Person: Age ${form.age}, Weight ${form.weight}kg, 
Last donation: ${form.lastDonation || "Never donated before"}, 
Medical conditions: ${form.conditions || "None mentioned"}.

Rules: age 18-65, weight ≥50kg, gap of 3+ months since last donation,
no active infections, no recent surgery, no blood pressure issues.

Respond ONLY as JSON with no extra text:
{"eligible": true or false, "reason": "one sentence explanation", "tips": "one helpful next step"}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content[0].text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(text));
    } catch (err) {
      console.error(err);
      setResult({
        eligible: false,
        reason: "Could not check eligibility. Please try again.",
        tips: ""
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#fff5f5",
      border: "1px solid #ffcccc",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "30px"
    }}>
      <h3 style={{ color: "#8b0000", marginBottom: "6px" }}>
        🤖 AI Eligibility Checker
      </h3>
      <p style={{ color: "#666", fontSize: "13px", marginBottom: "18px" }}>
        Check if you are eligible to donate blood right now
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        marginBottom: "16px"
      }}>
        <input
          placeholder="Your Age"
          value={form.age}
          onChange={e => setForm({ ...form, age: e.target.value })}
          type="number"
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "14px"
          }}
        />
        <input
          placeholder="Your Weight (kg)"
          value={form.weight}
          onChange={e => setForm({ ...form, weight: e.target.value })}
          type="number"
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "14px"
          }}
        />
        <input
          placeholder="Last donation date (or leave blank)"
          value={form.lastDonation}
          onChange={e => setForm({ ...form, lastDonation: e.target.value })}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "14px"
          }}
        />
        <input
          placeholder="Any medical conditions? (optional)"
          value={form.conditions}
          onChange={e => setForm({ ...form, conditions: e.target.value })}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "14px"
          }}
        />
      </div>

      <button
        onClick={checkEligibility}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: loading ? "#ccc" : "#8b0000",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: "15px"
        }}
      >
        {loading ? "🔄 Checking..." : "Check My Eligibility"}
      </button>

      {result && (
        <div style={{
          marginTop: "16px",
          padding: "16px",
          background: result.eligible ? "#d4edda" : "#f8d7da",
          borderRadius: "8px",
          border: `1px solid ${result.eligible ? "#c3e6cb" : "#f5c6cb"}`
        }}>
          <p style={{
            fontWeight: "bold",
            fontSize: "16px",
            color: result.eligible ? "#155724" : "#721c24",
            marginBottom: "8px"
          }}>
            {result.eligible
              ? "✅ You are eligible to donate blood!"
              : "❌ You are not eligible right now"}
          </p>
          <p style={{ color: "#333", marginBottom: "6px" }}>
            {result.reason}
          </p>
          {result.tips && (
            <p style={{ color: "#555", fontStyle: "italic", fontSize: "13px" }}>
              💡 {result.tips}
            </p>
          )}
        </div>
      )}
    </div>
  );
}