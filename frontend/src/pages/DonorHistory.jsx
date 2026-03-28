import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";

export default function DonorHistory({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const menuItems = [
    { label: "Register Donation", path: "/donor/register" },
    { label: "Donation History",  path: "/donor/history" },
    { label: "Health Tips",       path: "/donor/tips" },
    { label: "Donation Camps",    path: "/donor/camps" }
  ];

  const [history,     setHistory]     = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/donors/my-history"),
      apiFetch("/donors/my-eligibility")
    ])
      .then(([hist, elig]) => {
        setHistory(hist);
        setEligibility(elig);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const totalDonations = history.length;

  return (
    <div className="dashboard-container">
      <Sidebar
        role="Donor" menuItems={menuItems}
        darkMode={darkMode} setDarkMode={setDarkMode}
      />

      <div className="main" style={{ padding: "30px" }}>
        <h1 style={{ color: "#8b0000", marginBottom: "24px" }}>
          📅 My Donation History
        </h1>

        {/* Eligibility status banner */}
        {eligibility && (
          <div style={{
            background: eligibility.eligible ? "#d4edda" : "#fff3cd",
            border: `1px solid ${eligibility.eligible ? "#c3e6cb" : "#ffc107"}`,
            borderRadius: "12px", padding: "20px 24px",
            marginBottom: "24px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: "12px"
          }}>
            <div>
              <p style={{
                fontWeight: "bold", fontSize: "16px",
                color: eligibility.eligible ? "#155724" : "#856404",
                margin: "0 0 4px"
              }}>
                {eligibility.eligible ? "✅ You are eligible to donate!" : "⏳ Not eligible yet"}
              </p>
              <p style={{
                fontSize: "14px",
                color: eligibility.eligible ? "#155724" : "#856404",
                margin: 0
              }}>
                {eligibility.message}
              </p>
            </div>

            {!eligibility.eligible && eligibility.nextEligibleDate && (
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "12px", color: "#856404", margin: "0 0 4px" }}>
                  Recovery progress
                </p>
                <div style={{
                  background: "#fff",
                  borderRadius: "20px", height: "8px",
                  width: "160px", overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.round(((90 - eligibility.daysLeft) / 90) * 100)}%`,
                    background: "#f4a261",
                    borderRadius: "20px"
                  }} />
                </div>
                <p style={{
                  fontSize: "12px", color: "#856404",
                  fontWeight: "bold", margin: "4px 0 0"
                }}>
                  {eligibility.daysLeft} days left
                </p>
              </div>
            )}

            {eligibility.eligible && (
              <button
                onClick={() => navigate("/donor/register")}
                style={{
                  padding: "10px 22px",
                  background: "#8b0000", color: "white",
                  border: "none", borderRadius: "8px",
                  cursor: "pointer", fontWeight: "bold", fontSize: "14px"
                }}
              >
                🩸 Donate Again
              </button>
            )}
          </div>
        )}

        {/* Summary cards */}
        <div className="cards" style={{ marginBottom: "30px" }}>
          <div className="stat-card" style={{ borderLeft: "5px solid #8b0000" }}>
            <h4>Total Registrations</h4>
            <h2 style={{ color: "#8b0000" }}>{totalDonations}</h2>
          </div>
          <div className="stat-card" style={{ borderLeft: "5px solid #e63946" }}>
            <h4>Lives Impacted</h4>
            <h2 style={{ color: "#e63946" }}>{totalDonations * 3}</h2>
          </div>
          <div className="stat-card" style={{ borderLeft: "5px solid #2a9d8f" }}>
            <h4>Last Donation</h4>
            <h2 style={{ color: "#2a9d8f", fontSize: "15px", marginTop: "10px" }}>
              {eligibility?.lastDonation
                ? new Date(eligibility.lastDonation).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                  })
                : "—"}
            </h2>
          </div>
          <div className="stat-card" style={{ borderLeft: "5px solid #f4a261" }}>
            <h4>Next Eligible</h4>
            <h2 style={{ color: "#f4a261", fontSize: "15px", marginTop: "10px" }}>
              {eligibility?.eligible
                ? "Anytime! 🎉"
                : eligibility?.nextEligibleDate
                ? new Date(eligibility.nextEligibleDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                  })
                : "—"}
            </h2>
          </div>
        </div>

        {/* History list */}
        {loading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px",
            background: "white", borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}>
            <p style={{ fontSize: "50px", marginBottom: "12px" }}>🩸</p>
            <p style={{ color: "#666", fontSize: "18px", marginBottom: "8px" }}>
              No donation registrations yet.
            </p>
            <p style={{ color: "#999", fontSize: "14px", marginBottom: "20px" }}>
              Register your interest to donate blood and save lives!
            </p>
            <button
              onClick={() => navigate("/donor/register")}
              style={{
                padding: "12px 28px", background: "#8b0000",
                color: "white", border: "none", borderRadius: "8px",
                cursor: "pointer", fontWeight: "bold", fontSize: "15px"
              }}
            >
              Register Now
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {history.map((record, idx) => {
              const hasDonated = !!record.lastDonation;
              return (
                <div key={record._id} style={{
                  background: "white", borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderLeft: `4px solid ${hasDonated ? "#2a9d8f" : "#f4a261"}`,
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", flexWrap: "wrap", gap: "12px"
                }}>
                  <div>
                    <p style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "6px", color: "#333" }}>
                      🩸 Registration #{totalDonations - idx}
                    </p>
                    <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                      📅 Registered on:{" "}
                      {new Date(record.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                    {hasDonated && (
                      <p style={{ color: "#2a9d8f", fontSize: "14px", margin: "4px 0", fontWeight: "bold" }}>
                        💉 Donation recorded by admin:{" "}
                        {new Date(record.lastDonation).toLocaleDateString("en-IN", {
                          year: "numeric", month: "long", day: "numeric"
                        })}
                      </p>
                    )}
                    <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                      📍 {record.city || "City not specified"} · ⚖️ {record.weight} kg · Age: {record.age}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      background: "#fff0f0", color: "#8b0000",
                      fontWeight: "bold", fontSize: "24px",
                      padding: "10px 18px", borderRadius: "10px",
                      display: "block", marginBottom: "8px"
                    }}>
                      {record.bloodGroup}
                    </span>
                    <span style={{
                      background: hasDonated ? "#d4edda" : "#fff3cd",
                      color: hasDonated ? "#155724" : "#856404",
                      padding: "4px 10px", borderRadius: "12px",
                      fontSize: "12px", fontWeight: "bold"
                    }}>
                      {hasDonated ? "✅ Donation Confirmed" : "⏳ Pending Admin Confirmation"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}