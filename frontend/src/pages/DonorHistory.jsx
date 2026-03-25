import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";

export default function DonorHistory({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const menuItems = [
    { label: "Register Donation", path: "/donor/register" },
    { label: "Donation History", path: "/donor/history" },
    { label: "Health Tips", path: "/donor/tips" },
    { label: "Donation Camps", path: "/donor/camps" }
  ];

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/donors/my-history")
      .then(data => { setHistory(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const totalDonations = history.length;

  const lastDonation = history[0]
    ? new Date(history[0].createdAt).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric"
      })
    : null;

  const nextEligible = history[0]
    ? new Date(
        new Date(history[0].createdAt).getTime() +
        90 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric"
      })
    : null;

  return (
    <div className="dashboard-container">
      <Sidebar
        role="Donor"
        menuItems={menuItems}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="main" style={{ padding: "30px" }}>
        <h1 style={{ color: "#8b0000", marginBottom: "24px" }}>
          📅 My Donation History
        </h1>

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
            <h4>Last Registration</h4>
            <h2 style={{
              color: "#2a9d8f",
              fontSize: "16px",
              marginTop: "10px"
            }}>
              {lastDonation || "—"}
            </h2>
          </div>
          <div className="stat-card" style={{ borderLeft: "5px solid #f4a261" }}>
            <h4>Next Eligible Date</h4>
            <h2 style={{
              color: "#f4a261",
              fontSize: "16px",
              marginTop: "10px"
            }}>
              {nextEligible || "Anytime! 🎉"}
            </h2>
          </div>
        </div>

        {/* History list */}
        {loading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px",
            background: "white",
            borderRadius: "12px",
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
                padding: "12px 28px",
                background: "#8b0000",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "15px"
              }}
            >
              Register Now
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {history.map((record, idx) => (
              <div key={record._id} style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                borderLeft: "4px solid #8b0000",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                <div>
                  <p style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    marginBottom: "6px",
                    color: "#333"
                  }}>
                    🩸 Registration #{totalDonations - idx}
                  </p>
                  <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                    📅 {new Date(record.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </p>
                  <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                    📍 {record.city || "City not specified"}
                  </p>
                  <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                    ⚖️ Weight: {record.weight} kg · Age: {record.age}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{
                    background: "#fff0f0",
                    color: "#8b0000",
                    fontWeight: "bold",
                    fontSize: "24px",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    display: "block",
                    marginBottom: "8px"
                  }}>
                    {record.bloodGroup}
                  </span>
                  <span style={{
                    background: "#d4edda",
                    color: "#155724",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    ✅ Registered
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}