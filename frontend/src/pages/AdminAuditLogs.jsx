import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";

export default function AdminAuditLogs({ darkMode, setDarkMode }) {
  const menuItems = [
    { label: "Dashboard Stats", path: "/admin/dashboard-stats" },
    { label: "Blood Inventory", path: "/admin/blood-inventory" },
    { label: "Donor List", path: "/admin/donors" },
    { label: "Pending Requests", path: "/admin/requests" },
    { label: "Donor Match", path: "/admin/donor-match" },
    { label: "Manage Camps", path: "/admin/camps" },
    { label: "Audit Logs", path: "/admin/audit-logs" }
  ];

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    apiFetch("/audit/logs")
      .then(data => { setLogs(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const getActionColor = (action) => {
    if (action.includes("FAILED")) return "#e63946";
    if (action.includes("APPROVED")) return "#2a9d8f";
    if (action.includes("REJECTED")) return "#f4a261";
    if (action.includes("LOGIN_SUCCESS")) return "#2a9d8f";
    if (action.includes("REGISTERED")) return "#6c5ce7";
    if (action.includes("DONATION")) return "#8b0000";
    return "#555";
  };

  const getActionBg = (action) => {
    if (action.includes("FAILED")) return "#fff5f5";
    if (action.includes("APPROVED")) return "#f0faf8";
    if (action.includes("REJECTED")) return "#fff9f0";
    if (action.includes("LOGIN_SUCCESS")) return "#f0faf8";
    return "#f9f9f9";
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    if (filter === "failed") return log.status === "failed";
    if (filter === "login") return log.action.includes("LOGIN");
    if (filter === "requests") return log.action.includes("REQUEST");
    if (filter === "donations") return log.action.includes("DONATION");
    return true;
  });

  return (
    <div className="dashboard-container">
      <Sidebar
        role="Admin"
        menuItems={menuItems}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="main" style={{ padding: "30px" }}>
        <h1 style={{ color: "#8b0000", marginBottom: "8px" }}>
          🔍 Audit Logs
        </h1>
        <p style={{ color: "#666", marginBottom: "24px", fontSize: "14px" }}>
          Complete activity trail stored in MySQL — every action recorded
        </p>

        {/* Filter tabs */}
        <div style={{
          display: "flex", gap: "8px",
          marginBottom: "24px", flexWrap: "wrap"
        }}>
          {[
            { key: "all", label: "All" },
            { key: "login", label: "🔐 Logins" },
            { key: "requests", label: "🩸 Requests" },
            { key: "donations", label: "💉 Donations" },
            { key: "failed", label: "❌ Failed" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: "8px 16px",
                background: filter === tab.key ? "#8b0000" : "white",
                color: filter === tab.key ? "white" : "#666",
                border: "1px solid #ddd",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: filter === tab.key ? "bold" : "normal"
              }}
            >
              {tab.label}
            </button>
          ))}
          <span style={{
            marginLeft: "auto",
            fontSize: "13px",
            color: "#666",
            alignSelf: "center"
          }}>
            {filteredLogs.length} record(s)
          </span>
        </div>

        {loading ? (
          <p>Loading audit logs from MySQL...</p>
        ) : filteredLogs.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px",
            background: "white", borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}>
            <p style={{ fontSize: "40px" }}>🔍</p>
            <p style={{ color: "#666" }}>No logs found for this filter.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {filteredLogs.map((log, i) => (
              <div key={i} style={{
                background: getActionBg(log.action),
                borderRadius: "10px",
                padding: "16px 20px",
                borderLeft: `4px solid ${getActionColor(log.action)}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "8px"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "6px",
                    flexWrap: "wrap"
                  }}>
                    <span style={{
                      background: getActionColor(log.action),
                      color: "white",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold"
                    }}>
                      {log.action}
                    </span>
                    <span style={{
                      background: log.status === "failed" ? "#f8d7da" : "#d4edda",
                      color: log.status === "failed" ? "#721c24" : "#155724",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold"
                    }}>
                      {log.status === "failed" ? "❌ Failed" : "✅ Success"}
                    </span>
                  </div>

                  <p style={{
                    margin: "0 0 4px",
                    fontSize: "14px",
                    color: "#333"
                  }}>
                    {log.details}
                  </p>

                  <p style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#888"
                  }}>
                    👤 {log.performed_by} ({log.role})
                    {log.ip_address && ` · 🌐 ${log.ip_address}`}
                  </p>
                </div>

                <p style={{
                  fontSize: "12px",
                  color: "#999",
                  whiteSpace: "nowrap"
                }}>
                  {new Date(log.created_at).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}