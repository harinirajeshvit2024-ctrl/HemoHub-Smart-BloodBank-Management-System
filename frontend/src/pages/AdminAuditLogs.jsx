import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";

export default function AdminAuditLogs({ darkMode, setDarkMode }) {
  const menuItems = [
    { label: "Dashboard Stats",  path: "/admin/dashboard-stats" },
    { label: "Blood Inventory",  path: "/admin/blood-inventory" },
    { label: "Donor List",       path: "/admin/donors" },
    { label: "Pending Requests", path: "/admin/requests" },
    { label: "Donor Match",      path: "/admin/donor-match" },
    { label: "Manage Camps",     path: "/admin/camps" },
    { label: "Audit Logs",       path: "/admin/audit-logs" }
  ];

  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [exporting, setExporting] = useState("");
  const sheetjsLoaded             = useRef(false);

  useEffect(() => {
    if (sheetjsLoaded.current) return;
    const script   = document.createElement("script");
    script.src     = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload  = () => { sheetjsLoaded.current = true; };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    apiFetch("/audit/logs")
      .then(data  => { setLogs(data); setLoading(false); })
      .catch(err  => { console.error(err); setLoading(false); });
  }, []);

  const getActionColor = (action) => {
    if (action.includes("FAILED"))        return "#e63946";
    if (action.includes("APPROVED"))      return "#2a9d8f";
    if (action.includes("REJECTED"))      return "#f4a261";
    if (action.includes("LOGIN_SUCCESS")) return "#2a9d8f";
    if (action.includes("REGISTERED"))   return "#6c5ce7";
    if (action.includes("DONATION"))      return "#8b0000";
    return "#555";
  };

  const getActionBg = (action) => {
    if (action.includes("FAILED"))        return "#fff5f5";
    if (action.includes("APPROVED"))      return "#f0faf8";
    if (action.includes("REJECTED"))      return "#fff9f0";
    if (action.includes("LOGIN_SUCCESS")) return "#f0faf8";
    return "#f9f9f9";
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "all")       return true;
    if (filter === "failed")    return log.status === "failed";
    if (filter === "login")     return log.action.includes("LOGIN");
    if (filter === "requests")  return log.action.includes("REQUEST");
    if (filter === "donations") return log.action.includes("DONATION");
    return true;
  });

  const exportCSV = () => {
    setExporting("csv");
    try {
      const headers = ["ID","Action","Performed By","Role","Details","IP Address","Status","Date & Time"];
      const rows = filteredLogs.map(log => [
        log.id,
        log.action,
        log.performed_by,
        log.role,
        `"${(log.details || "").replace(/"/g, '""')}"`,
        log.ip_address || "",
        log.status,
        new Date(log.created_at).toLocaleString("en-IN")
      ]);
      const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `hemohub_audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("CSV export failed: " + err.message);
    } finally {
      setExporting("");
    }
  };

  const exportExcel = () => {
    if (!window.XLSX) {
      alert("Excel library still loading — please wait 2 seconds and try again.");
      return;
    }
    setExporting("excel");
    try {
      const XLSX = window.XLSX;

      const data = filteredLogs.map(log => ({
        "ID":           log.id,
        "Action":       log.action,
        "Performed By": log.performed_by,
        "Role":         log.role,
        "Details":      log.details || "",
        "IP Address":   log.ip_address || "",
        "Status":       log.status,
        "Date & Time":  new Date(log.created_at).toLocaleString("en-IN")
      }));

      const worksheet  = XLSX.utils.json_to_sheet(data);
      worksheet["!cols"] = [
        { wch: 6  },
        { wch: 24 },
        { wch: 18 },
        { wch: 10 },
        { wch: 52 },
        { wch: 16 },
        { wch: 10 },
        { wch: 24 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

      const summary = [
        { "Metric": "Total Events",       "Value": logs.length },
        { "Metric": "Successful Actions", "Value": logs.filter(l => l.status === "success").length },
        { "Metric": "Failed Actions",     "Value": logs.filter(l => l.status === "failed").length },
        { "Metric": "Login Events",       "Value": logs.filter(l => l.action.includes("LOGIN")).length },
        { "Metric": "Request Actions",    "Value": logs.filter(l => l.action.includes("REQUEST")).length },
        { "Metric": "Donation Actions",   "Value": logs.filter(l => l.action.includes("DONATION")).length },
        { "Metric": "Exported On",        "Value": new Date().toLocaleString("en-IN") },
        { "Metric": "Filter Applied",     "Value": filter }
      ];
      const summarySheet    = XLSX.utils.json_to_sheet(summary);
      summarySheet["!cols"] = [{ wch: 22 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      XLSX.writeFile(workbook, `hemohub_audit_logs_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (err) {
      alert("Excel export failed: " + err.message);
    } finally {
      setExporting("");
    }
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
        <h1 style={{ color: "#8b0000", marginBottom: "4px" }}>🔍 Audit Logs</h1>
        <p style={{ color: "#666", marginBottom: "24px", fontSize: "14px" }}>
          Complete activity trail — every login, request, donation and failure recorded in MySQL
        </p>

        {/* Stats row */}
        {!loading && logs.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "12px", marginBottom: "24px"
          }}>
            {[
              { label: "Total Events",  value: logs.length,                                          color: "#8b0000" },
              { label: "Successful",    value: logs.filter(l => l.status === "success").length,      color: "#2a9d8f" },
              { label: "Failed",        value: logs.filter(l => l.status === "failed").length,       color: "#e63946" },
              { label: "Login Events",  value: logs.filter(l => l.action.includes("LOGIN")).length,  color: "#6c5ce7" }
            ].map((s, i) => (
              <div key={i} style={{
                background: "white", borderRadius: "10px",
                padding: "14px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderLeft: `4px solid ${s.color}`
              }}>
                <p style={{ fontSize: "12px", color: "#888", margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontSize: "22px", fontWeight: "bold", color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs + export buttons */}
        <div style={{
          display: "flex", gap: "8px",
          marginBottom: "24px", flexWrap: "wrap",
          alignItems: "center"
        }}>
          {[
            { key: "all",       label: "All" },
            { key: "login",     label: "🔐 Logins" },
            { key: "requests",  label: "🩸 Requests" },
            { key: "donations", label: "💉 Donations" },
            { key: "failed",    label: "❌ Failed" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: "8px 16px",
                background: filter === tab.key ? "#8b0000" : "white",
                color:      filter === tab.key ? "white"   : "#666",
                border: "1px solid #ddd",
                borderRadius: "20px", cursor: "pointer",
                fontSize: "13px",
                fontWeight: filter === tab.key ? "bold" : "normal"
              }}
            >
              {tab.label}
            </button>
          ))}

          <span style={{ fontSize: "13px", color: "#666", alignSelf: "center" }}>
            {filteredLogs.length} record(s)
          </span>

          <div style={{ flex: 1 }} />

          <button
            onClick={exportCSV}
            disabled={exporting !== "" || filteredLogs.length === 0}
            style={{
              padding: "9px 18px",
              background: exporting === "csv" || filteredLogs.length === 0 ? "#ccc" : "#2a9d8f",
              color: "white", border: "none", borderRadius: "8px",
              cursor: exporting !== "" || filteredLogs.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "bold", fontSize: "13px"
            }}
          >
            {exporting === "csv" ? "⏳ Exporting..." : "⬇ Export CSV"}
          </button>

          <button
            onClick={exportExcel}
            disabled={exporting !== "" || filteredLogs.length === 0}
            style={{
              padding: "9px 18px",
              background: exporting === "excel" || filteredLogs.length === 0 ? "#ccc" : "#1d6f42",
              color: "white", border: "none", borderRadius: "8px",
              cursor: exporting !== "" || filteredLogs.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "bold", fontSize: "13px"
            }}
          >
            {exporting === "excel" ? "⏳ Exporting..." : "📊 Export Excel"}
          </button>
        </div>

        {/* Log entries */}
        {loading ? (
          <div style={{
            textAlign: "center", padding: "60px",
            background: "white", borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}>
            <p style={{ fontSize: "32px" }}>⏳</p>
            <p style={{ color: "#666", marginTop: "8px" }}>Loading audit logs from MySQL...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px",
            background: "white", borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}>
            <p style={{ fontSize: "40px" }}>🔍</p>
            <p style={{ color: "#666", marginTop: "12px" }}>No logs found for this filter.</p>
            <p style={{ color: "#999", fontSize: "13px", marginTop: "6px" }}>
              Make sure the MySQL table exists and you have performed some actions.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {filteredLogs.map((log, i) => (
              <div key={i} style={{
                background: getActionBg(log.action),
                borderRadius: "10px", padding: "16px 20px",
                borderLeft: `4px solid ${getActionColor(log.action)}`,
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", flexWrap: "wrap", gap: "8px"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    gap: "10px", marginBottom: "6px", flexWrap: "wrap"
                  }}>
                    <span style={{
                      background: getActionColor(log.action),
                      color: "white", padding: "3px 10px",
                      borderRadius: "12px", fontSize: "11px", fontWeight: "bold"
                    }}>
                      {log.action}
                    </span>
                    <span style={{
                      background: log.status === "failed" ? "#f8d7da" : "#d4edda",
                      color:      log.status === "failed" ? "#721c24" : "#155724",
                      padding: "3px 8px", borderRadius: "12px",
                      fontSize: "11px", fontWeight: "bold"
                    }}>
                      {log.status === "failed" ? "❌ Failed" : "✅ Success"}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#333" }}>
                    {log.details}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                    👤 {log.performed_by} ({log.role})
                    {log.ip_address && ` · 🌐 ${log.ip_address}`}
                  </p>
                </div>
                <p style={{ fontSize: "12px", color: "#999", whiteSpace: "nowrap" }}>
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