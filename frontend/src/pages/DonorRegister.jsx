import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";

function DonorRegister({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const menuItems = [
    { label: "Register Donation", path: "/donor/register" },
    { label: "Donation History",  path: "/donor/history" },
    { label: "Health Tips",       path: "/donor/tips" },
    { label: "Donation Camps",    path: "/donor/camps" }
  ];

  const [formData, setFormData] = useState({
    name: "", age: "", weight: "",
    bloodGroup: "", phone: "", city: ""
  });
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [checkingElig, setCheckingElig] = useState(true);

  // Check eligibility as soon as page loads
  useEffect(() => {
    apiFetch("/donors/my-eligibility")
      .then(data => { setEligibility(data); setCheckingElig(false); })
      .catch(() => setCheckingElig(false));
  }, []);

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const age    = Number(formData.age);
    const weight = Number(formData.weight);

    if (!formData.name || !formData.bloodGroup) {
      setError("Please fill all required fields.");
      return;
    }
    if (age < 18 || age > 60) {
      setError("Age must be between 18 and 60.");
      return;
    }
    if (weight < 50) {
      setError("Weight must be at least 50 kg.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/donors", {
        method: "POST",
        body: JSON.stringify({ ...formData, age, weight })
      });
      alert("Donor Registered Successfully! The admin will record your actual donation at the camp.");
      navigate("/donor");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading eligibility ──
  if (checkingElig) {
    return (
      <div className="dashboard-container">
        <Sidebar role="Donor" menuItems={menuItems} darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="main" style={{ padding: "30px" }}>
          <p style={{ color: "#666" }}>Checking your eligibility...</p>
        </div>
      </div>
    );
  }

  // ── NOT ELIGIBLE — show block screen ──
  if (eligibility && !eligibility.eligible) {
    return (
      <div className="dashboard-container">
        <Sidebar role="Donor" menuItems={menuItems} darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="main" style={{ padding: "30px" }}>
          <div style={{
            maxWidth: "600px",
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 4px 24px rgba(139,0,0,0.12)",
            borderTop: "5px solid #e63946",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>⏳</div>
            <h2 style={{ color: "#e63946", marginBottom: "12px" }}>
              Not Eligible Yet
            </h2>
            <p style={{ color: "#555", fontSize: "16px", marginBottom: "24px" }}>
              {eligibility.message}
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "28px"
            }}>
              <div style={{
                background: "#fff5f5", borderRadius: "10px",
                padding: "16px", borderLeft: "4px solid #e63946"
              }}>
                <p style={{ fontSize: "12px", color: "#888", margin: "0 0 4px" }}>
                  Last donation
                </p>
                <p style={{ fontSize: "16px", fontWeight: "bold", color: "#e63946", margin: 0 }}>
                  {new Date(eligibility.lastDonation).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              </div>
              <div style={{
                background: "#f0faf8", borderRadius: "10px",
                padding: "16px", borderLeft: "4px solid #2a9d8f"
              }}>
                <p style={{ fontSize: "12px", color: "#888", margin: "0 0 4px" }}>
                  Next eligible date
                </p>
                <p style={{ fontSize: "16px", fontWeight: "bold", color: "#2a9d8f", margin: 0 }}>
                  {new Date(eligibility.nextEligibleDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              </div>
            </div>

            {/* Countdown bar */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: "12px", color: "#888", marginBottom: "6px"
              }}>
                <span>Recovery progress</span>
                <span>{90 - eligibility.daysLeft} / 90 days</span>
              </div>
              <div style={{
                background: "#f0f0f0", borderRadius: "20px",
                height: "10px", overflow: "hidden"
              }}>
                <div style={{
                  height: "100%",
                  width: `${Math.round(((90 - eligibility.daysLeft) / 90) * 100)}%`,
                  background: "linear-gradient(90deg, #8b0000, #e63946)",
                  borderRadius: "20px",
                  transition: "width 1s ease"
                }} />
              </div>
              <p style={{
                fontSize: "13px", color: "#e63946",
                fontWeight: "bold", marginTop: "8px"
              }}>
                {eligibility.daysLeft} days remaining
              </p>
            </div>

            <button
              onClick={() => navigate("/donor/history")}
              style={{
                padding: "12px 28px",
                background: "#8b0000", color: "white",
                border: "none", borderRadius: "8px",
                cursor: "pointer", fontWeight: "bold", fontSize: "15px"
              }}
            >
              View My Donation History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ELIGIBLE — show registration form ──
  return (
    <div className="dashboard-container">
      <Sidebar role="Donor" menuItems={menuItems} darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="main" style={{ padding: "30px" }}>
        <h1 style={{ color: "#8b0000", marginBottom: "8px" }}>🩸 Register Donation</h1>

        {/* Eligible badge */}
        {eligibility && eligibility.eligible && eligibility.lastDonation && (
          <div style={{
            background: "#d4edda", border: "1px solid #c3e6cb",
            borderRadius: "8px", padding: "10px 16px",
            marginBottom: "20px", fontSize: "14px", color: "#155724",
            fontWeight: "bold"
          }}>
            ✅ You are eligible to donate! Last donated:{" "}
            {new Date(eligibility.lastDonation).toLocaleDateString("en-IN")}
          </div>
        )}

        <div style={{
          background: "white", borderRadius: "12px",
          padding: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          maxWidth: "700px"
        }}>
          <h2 style={{ color: "#8b0000", marginBottom: "24px", fontSize: "20px" }}>
            Donor Details
          </h2>

          {error && (
            <p style={{
              color: "#e63946", background: "#fff5f5",
              padding: "12px", borderRadius: "8px",
              marginBottom: "16px", fontSize: "14px"
            }}>
              ⚠ {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="donor-form">
            <input
              type="text" name="name" placeholder="Full Name"
              value={formData.name} onChange={handleChange} required
            />
            <input
              type="number" name="age" placeholder="Age"
              value={formData.age} onChange={handleChange} required
            />
            <input
              type="number" name="weight" placeholder="Weight (kg)"
              value={formData.weight} onChange={handleChange} required
            />
            <select
              name="bloodGroup" value={formData.bloodGroup}
              onChange={handleChange} required
            >
              <option value="">Select Blood Group</option>
              {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <input
              type="text" name="phone" placeholder="Phone Number"
              value={formData.phone} onChange={handleChange}
            />
            <input
              type="text" name="city" placeholder="City"
              value={formData.city} onChange={handleChange}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                gridColumn: "span 2", padding: "14px",
                background: loading ? "#ccc" : "#8b0000",
                color: "white", border: "none",
                borderRadius: "8px", fontSize: "16px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Registering..." : "Register as Donor"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DonorRegister;