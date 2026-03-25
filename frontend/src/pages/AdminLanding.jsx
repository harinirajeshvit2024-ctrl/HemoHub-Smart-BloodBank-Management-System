import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BloodFactsTicker from "../components/BloodFactsTicker";
import EmergencyBanner from "../components/EmergencyBanner";
import ImpactStats from "../components/ImpactStats";
import { apiFetch } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminLanding({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const menuItems = [
    { label: "Dashboard Stats", path: "/admin/dashboard-stats" },
    { label: "Blood Inventory", path: "/admin/blood-inventory" },
    { label: "Donor List", path: "/admin/donors" },
    { label: "Pending Requests", path: "/admin/requests" },
    { label: "Donor Match", path: "/admin/donor-match" },
    { label: "Manage Camps", path: "/admin/camps" }
  ];

  const [data, setData] = useState({
    totalUnits: 0,
    totalDonors: 0,
    approved: 0,
    pending: 0,
    stock: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stock, donors, requests] = await Promise.all([
          apiFetch("/stock"),
          apiFetch("/donors"),
          apiFetch("/requests")
        ]);
        setData({
          totalUnits: stock.reduce((sum, s) => sum + s.units, 0),
          totalDonors: donors.length,
          approved: requests.filter(r => r.status === "Approved").length,
          pending: requests.filter(r => r.status === "Pending").length,
          stock
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const getStockColor = (units) => {
    if (units < 10) return "#e63946";
    if (units < 20) return "#f4a261";
    return "#2a9d8f";
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        role="Admin"
        menuItems={menuItems}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="main" style={{ padding: "30px" }}>

        {/* Facts ticker */}
        <BloodFactsTicker />

        {/* Emergency banner */}
        <EmergencyBanner />

        {/* Welcome header */}
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
            position: "absolute", right: "-20px", top: "-20px",
            fontSize: "120px", opacity: 0.08
          }}>
            🩸
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "26px" }}>
            Welcome, Admin 🛡️
          </h1>
          <p style={{ margin: "0 0 16px", opacity: 0.85, fontSize: "15px" }}>
            You are managing HemoHub — every decision here saves lives.
          </p>
          {data.pending > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "8px",
              padding: "10px 16px",
              display: "inline-block"
            }}>
              <span style={{ fontWeight: "bold" }}>
                ⚠️ {data.pending} pending request{data.pending > 1 ? "s" : ""} waiting for your approval
              </span>
            </div>
          )}
        </div>

        {/* Impact stats */}
        <ImpactStats
          totalUnits={data.totalUnits}
          totalDonors={data.totalDonors}
          approved={data.approved}
        />

        {/* Blood stock quick view */}
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
              🩸 Live Blood Stock
            </h3>
            <button
              onClick={() => navigate("/admin/blood-inventory")}
              style={{
                padding: "8px 16px",
                background: "white", color: "#8b0000",
                border: "1px solid #8b0000",
                borderRadius: "8px", cursor: "pointer",
                fontSize: "13px", fontWeight: "bold"
              }}
            >
              Manage →
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
            gap: "12px"
          }}>
            {data.stock.map(s => (
              <div key={s.bloodGroup} style={{
                textAlign: "center",
                padding: "16px 8px",
                background: s.units < 10 ? "#fff5f5" : "#f9f9f9",
                borderRadius: "10px",
                borderTop: `3px solid ${getStockColor(s.units)}`,
                position: "relative"
              }}>
                {s.units < 10 && (
                  <div style={{
                    position: "absolute", top: "6px", right: "6px",
                    fontSize: "10px"
                  }}>🚨</div>
                )}
                <p style={{
                  fontWeight: "bold", fontSize: "20px",
                  color: "#8b0000", margin: "0 0 4px"
                }}>
                  {s.bloodGroup}
                </p>
                <p style={{
                  fontSize: "22px", fontWeight: "bold",
                  color: getStockColor(s.units), margin: 0
                }}>
                  {s.units}
                </p>
                <p style={{
                  fontSize: "10px", color: "#999",
                  margin: "2px 0 0"
                }}>
                  units
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick action cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px"
        }}>
          {[
            {
              icon: "📋",
              title: "Pending Requests",
              desc: `${data.pending} waiting`,
              color: "#f4a261",
              path: "/admin/requests"
            },
            {
              icon: "🎯",
              title: "Donor Match",
              desc: "Find eligible donors",
              color: "#2a9d8f",
              path: "/admin/donor-match"
            },
            {
              icon: "📊",
              title: "View Statistics",
              desc: "Charts and analytics",
              color: "#8b0000",
              path: "/admin/dashboard-stats"
            },
            {
              icon: "🏕️",
              title: "Manage Camps",
              desc: "Create donation camps",
              color: "#6c5ce7",
              path: "/admin/camps"
            }
          ].map((card, i) => (
            <div
              key={i}
              onClick={() => navigate(card.path)}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                borderBottom: `3px solid ${card.color}`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                {card.icon}
              </div>
              <h3 style={{ margin: "0 0 4px", color: card.color }}>
                {card.title}
              </h3>
              <p style={{ margin: 0, color: "#888", fontSize: "13px" }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}