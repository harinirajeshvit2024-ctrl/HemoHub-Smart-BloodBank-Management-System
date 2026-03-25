import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BloodFactsTicker from "../components/BloodFactsTicker";
import { apiFetch } from "../api";

export default function DonorLanding({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const menuItems = [
    { label: "Register Donation", path: "/donor/register" },
    { label: "Donation History", path: "/donor/history" },
    { label: "Health Tips", path: "/donor/tips" },
    { label: "Donation Camps", path: "/donor/camps" }
  ];

  const [history, setHistory] = useState([]);
  const [camps, setCamps] = useState([]);
  const name = sessionStorage.getItem("username") || "Donor";

  useEffect(() => {
    apiFetch("/donors/my-history")
      .then(data => setHistory(data))
      .catch(() => {});
    apiFetch("/camps")
      .then(data => setCamps(data.filter(c => new Date(c.date) > new Date())))
      .catch(() => {});
  }, []);

  const lastDonation = history[0]
    ? new Date(history[0].createdAt).toLocaleDateString("en-IN")
    : null;

  const nextEligible = history[0]
    ? new Date(new Date(history[0].createdAt).getTime() + 90 * 24 * 60 * 60 * 1000)
    : null;

  const canDonate = !nextEligible || nextEligible <= new Date();

  return (
    <div className="dashboard-container">
      <Sidebar
        role="Donor"
        menuItems={menuItems}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="main" style={{ padding: "30px" }}>

        {/* Facts ticker */}
        <BloodFactsTicker />

        {/* Hero banner */}
        <div style={{
          background: "linear-gradient(135deg, #8b0000, #c0392b)",
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "24px",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", right: "-10px",
            top: "-10px", fontSize: "120px", opacity: 0.08
          }}>
            ❤️
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "24px" }}>
            Welcome back, {name} 🩸
          </h1>
          <p style={{ margin: "0 0 16px", opacity: 0.85, fontSize: "15px" }}>
            Your blood can save up to 3 lives. Thank you for being a hero.
          </p>
          {canDonate ? (
            <button
              onClick={() => navigate("/donor/register")}
              style={{
                padding: "12px 24px",
                background: "white",
                color: "#8b0000",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "15px"
              }}
            >
              🩸 Register to Donate Now
            </button>
          ) : (
            <div style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "8px",
              padding: "10px 16px",
              display: "inline-block"
            }}>
              <span style={{ fontWeight: "bold" }}>
                ⏳ Next eligible date:{" "}
                {nextEligible.toLocaleDateString("en-IN")}
              </span>
            </div>
          )}
        </div>

        {/* Donor stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}>
          {[
            {
              icon: "🩸",
              value: history.length,
              label: "Total Donations",
              color: "#8b0000",
              bg: "#fff5f5"
            },
            {
              icon: "❤️",
              value: history.length * 3,
              label: "Lives Impacted",
              color: "#e63946",
              bg: "#fff5f5"
            },
            {
              icon: "📅",
              value: lastDonation || "Never",
              label: "Last Donation",
              color: "#2a9d8f",
              bg: "#f0faf8",
              small: true
            },
            {
              icon: "🏕️",
              value: camps.length,
              label: "Upcoming Camps",
              color: "#6c5ce7",
              bg: "#f5f3ff"
            }
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg,
              borderRadius: "12px",
              padding: "20px",
              border: `1px solid ${s.color}22`,
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}>
              <div style={{
                fontSize: "28px", width: "48px", height: "48px",
                background: "white", borderRadius: "10px",
                display: "flex", alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 8px ${s.color}22`,
                flexShrink: 0
              }}>
                {s.icon}
              </div>
              <div>
                <p style={{
                  margin: 0,
                  fontSize: s.small ? "16px" : "24px",
                  fontWeight: "bold",
                  color: s.color,
                  lineHeight: 1
                }}>
                  {s.value}
                </p>
                <p style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "#666"
                }}>
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming camps preview */}
        {camps.length > 0 && (
          <div style={{
            background: "white",
            borderRadius: "14px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)"
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "16px"
            }}>
              <h3 style={{ margin: 0, color: "#8b0000" }}>
                🏕️ Upcoming Camps
              </h3>
              <button
                onClick={() => navigate("/donor/camps")}
                style={{
                  padding: "8px 16px", background: "white",
                  color: "#8b0000", border: "1px solid #8b0000",
                  borderRadius: "8px", cursor: "pointer",
                  fontSize: "13px", fontWeight: "bold"
                }}
              >
                View All →
              </button>
            </div>
            {camps.slice(0, 2).map(camp => (
              <div key={camp._id} style={{
                padding: "14px", background: "#fff5f5",
                borderRadius: "10px", marginBottom: "10px",
                borderLeft: "3px solid #8b0000"
              }}>
                <p style={{ fontWeight: "bold", margin: "0 0 4px" }}>
                  {camp.location}
                </p>
                <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
                  📅 {new Date(camp.date).toLocaleDateString("en-IN", {
                    year: "numeric", month: "long", day: "numeric"
                  })} · 📍 {camp.city}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px"
        }}>
          {[
            {
              icon: "✍️",
              title: "Register Donation",
              color: "#8b0000",
              path: "/donor/register"
            },
            {
              icon: "📅",
              title: "My History",
              color: "#2a9d8f",
              path: "/donor/history"
            },
            {
              icon: "💡",
              title: "Health Tips",
              color: "#f4a261",
              path: "/donor/tips"
            },
            {
              icon: "🏕️",
              title: "View Camps",
              color: "#6c5ce7",
              path: "/donor/camps"
            }
          ].map((card, i) => (
            <div
              key={i}
              onClick={() => navigate(card.path)}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                borderBottom: `3px solid ${card.color}`,
                transition: "transform 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                {card.icon}
              </div>
              <p style={{
                margin: 0, fontWeight: "bold",
                color: card.color, fontSize: "14px"
              }}>
                {card.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}