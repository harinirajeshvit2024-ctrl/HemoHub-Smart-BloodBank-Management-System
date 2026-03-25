import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";

export default function StaffPending({ darkMode, setDarkMode }) {
 const menuItems = [
  { label: "Staff Dashboard", path: "/staff/dashboard" },
  { label: "New Request", path: "/staff/request" },
  { label: "Pending Requests", path: "/staff/pending" }
];

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/requests")
      .then(data => { setRequests(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Approved") return {
      background: "#d4edda", color: "#155724",
      padding: "4px 12px", borderRadius: "20px",
      fontWeight: "bold", fontSize: "13px"
    };
    if (status === "Rejected") return {
      background: "#f8d7da", color: "#721c24",
      padding: "4px 12px", borderRadius: "20px",
      fontWeight: "bold", fontSize: "13px"
    };
    return {
      background: "#fff3cd", color: "#856404",
      padding: "4px 12px", borderRadius: "20px",
      fontWeight: "bold", fontSize: "13px"
    };
  };

  const getUrgencyColor = (urgency) => {
    if (urgency === "High") return "#e63946";
    if (urgency === "Medium") return "#f4a261";
    return "#2a9d8f";
  };

  if (loading) return (
    <div className="dashboard-container">
      <Sidebar role="Staff" menuItems={menuItems}
        darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="main" style={{ padding: "30px" }}>
        <p>Loading requests...</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Sidebar role="Staff" menuItems={menuItems}
        darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="main" style={{ padding: "30px" }}>
        <h1 style={{ color: "#8b0000", marginBottom: "24px" }}>
          📋 Request Status
        </h1>

        {requests.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "40px",
            background: "white", borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}>
            <p style={{ color: "#666", fontSize: "16px" }}>
              No requests submitted yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {requests.map(req => (
              <div key={req._id} style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                borderLeft: `4px solid ${getUrgencyColor(req.urgency)}`
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "12px"
                }}>
                  <div>
                    <p style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "8px" }}>
                      🏥 {req.patientName}
                    </p>
                    <p style={{ color: "#666", fontSize: "14px", marginBottom: "4px" }}>
                      🩸 Blood Group: <strong>{req.bloodGroup}</strong>
                    </p>
                    <p style={{ color: "#666", fontSize: "14px", marginBottom: "4px" }}>
                      📦 Units: <strong>{req.units}</strong>
                    </p>
                    <p style={{ fontSize: "14px", marginBottom: "4px" }}>
                      ⚡ Urgency:{" "}
                      <span style={{
                        color: getUrgencyColor(req.urgency),
                        fontWeight: "bold"
                      }}>
                        {req.urgency}
                      </span>
                    </p>
                    <p style={{ color: "#999", fontSize: "12px" }}>
                      📅 {new Date(req.date).toLocaleDateString("en-IN", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                  </div>
                  <span style={getStatusStyle(req.status)}>
                    {req.status === "Approved" ? "✅" :
                     req.status === "Rejected" ? "❌" : "⏳"} {req.status}
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