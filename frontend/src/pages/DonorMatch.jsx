import { useState } from "react";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";

export default function DonorMatch({ darkMode, setDarkMode }) {
  const menuItems = [
  { label: "Dashboard Stats",  path: "/admin/dashboard-stats" },
  { label: "Blood Inventory",  path: "/admin/blood-inventory" },
  { label: "Donor List",       path: "/admin/donors" },
  { label: "Pending Requests", path: "/admin/requests" },
  { label: "Donor Match",      path: "/admin/donor-match" },
  { label: "Manage Camps",     path: "/admin/camps" },
  { label: "Audit Logs",       path: "/admin/audit-logs" }
];

  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [smsStatus, setSmsStatus] = useState({});

  const handleSearch = async () => {
    if (!bloodGroup) {
      alert("Please select a blood group.");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const params = new URLSearchParams({ bloodGroup });
      if (city.trim()) params.append("city", city.trim());

      const data = await apiFetch(`/donors/match?${params.toString()}`);
      setResults(data.donors);
      setMessage(data.message);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async (donor) => {
    setSmsStatus(prev => ({ ...prev, [donor._id]: "sending" }));
    try {
      await apiFetch("/sms/notify", {
        method: "POST",
        body: JSON.stringify({
          phone: donor.phone,
          name: donor.name,
          bloodGroup: donor.bloodGroup,
          city: donor.city
        })
      });
      setSmsStatus(prev => ({ ...prev, [donor._id]: "sent" }));
    } catch (err) {
      setSmsStatus(prev => ({ ...prev, [donor._id]: "failed" }));
      alert("SMS failed: " + err.message);
    }
  };

  const handleSendAll = async () => {
    if (!results || results.length === 0) return;
    if (!window.confirm(`Send SMS to all ${results.length} donors?`)) return;
    for (const donor of results) {
      if (donor.phone) {
        await handleSendSMS(donor);
      }
    }
  };

  const getSmsButtonText = (donorId) => {
    const status = smsStatus[donorId];
    if (status === "sending") return "📤 Sending...";
    if (status === "sent") return "✅ Sent!";
    if (status === "failed") return "❌ Failed";
    return "📱 Send SMS";
  };

  const getSmsButtonColor = (donorId) => {
    const status = smsStatus[donorId];
    if (status === "sent") return "#2a9d8f";
    if (status === "failed") return "#e63946";
    return "#8b0000";
  };

  const getCompatibleGroups = (group) => {
    const compatibility = {
      "A+":  ["A+", "A-", "O+", "O-"],
      "A-":  ["A-", "O-"],
      "B+":  ["B+", "B-", "O+", "O-"],
      "B-":  ["B-", "O-"],
      "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      "AB-": ["A-", "B-", "AB-", "O-"],
      "O+":  ["O+", "O-"],
      "O-":  ["O-"]
    };
    return compatibility[group] || [group];
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
        <h1 style={{ color: "#8b0000", marginBottom: "8px" }}>
          🎯 Smart Donor Match
        </h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Find compatible donors by blood group and location, then notify them via SMS
        </p>

        {/* Search Panel */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginBottom: "24px"
        }}>
          <h3 style={{ marginBottom: "16px", color: "#333" }}>
            Search Donors
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: "12px",
            alignItems: "end"
          }}>
            <div>
              <label style={{
                display: "block", marginBottom: "6px",
                fontSize: "13px", fontWeight: "bold", color: "#555"
              }}>
                Blood Group Needed
              </label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                style={{
                  width: "100%", padding: "12px",
                  borderRadius: "8px", border: "1px solid #ddd",
                  fontSize: "14px"
                }}
              >
                <option value="">Select Blood Group</option>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: "block", marginBottom: "6px",
                fontSize: "13px", fontWeight: "bold", color: "#555"
              }}>
                Filter by City (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Chennai, Mumbai..."
                value={city}
                onChange={e => setCity(e.target.value)}
                style={{
                  width: "100%", padding: "12px",
                  borderRadius: "8px", border: "1px solid #ddd",
                  fontSize: "14px"
                }}
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: "12px 24px",
                background: loading ? "#ccc" : "#8b0000",
                color: "white", border: "none",
                borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold", fontSize: "14px",
                whiteSpace: "nowrap"
              }}
            >
              {loading ? "🔍 Searching..." : "🔍 Find Donors"}
            </button>
          </div>

          {/* Show compatible groups */}
          {bloodGroup && (
            <div style={{ marginTop: "12px" }}>
              <p style={{ fontSize: "13px", color: "#666" }}>
                Compatible blood groups for <strong>{bloodGroup}</strong>:{" "}
                {getCompatibleGroups(bloodGroup).map(g => (
                  <span key={g} style={{
                    display: "inline-block",
                    background: "#fff0f0",
                    color: "#8b0000",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    margin: "2px"
                  }}>
                    {g}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {results !== null && (
          <div>
            {/* Result header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div>
                <h3 style={{ margin: 0, color: "#333" }}>
                  {results.length === 0
                    ? "No donors found"
                    : `${results.length} Donor(s) Found`}
                </h3>
                <p style={{ color: "#666", fontSize: "13px", margin: "4px 0 0" }}>
                  {message}
                </p>
              </div>

              {results.length > 0 && (
                <button
                  onClick={handleSendAll}
                  style={{
                    padding: "10px 20px",
                    background: "#2a9d8f",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}
                >
                  📱 Send SMS to All
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px",
                background: "white", borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
              }}>
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</p>
                <p style={{ color: "#666", fontSize: "16px" }}>
                  No donors found for {bloodGroup}
                  {city ? ` in ${city}` : ""}.
                </p>
                <p style={{ color: "#999", fontSize: "14px", marginTop: "8px" }}>
                  Try searching without city filter or a different blood group.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {results.map((donor, idx) => (
                  <div key={donor._id} style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    borderLeft: "4px solid #8b0000"
                  }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      {/* Rank badge */}
                      <div style={{
                        width: "40px", height: "40px",
                        background: idx === 0 ? "#8b0000" : "#f0f0f0",
                        color: idx === 0 ? "white" : "#666",
                        borderRadius: "50%",
                        display: "flex", alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold", fontSize: "16px",
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </div>

                      <div>
                        <p style={{
                          fontWeight: "bold", fontSize: "16px",
                          marginBottom: "4px"
                        }}>
                          {donor.name}
                        </p>
                        <p style={{ color: "#666", fontSize: "13px", marginBottom: "2px" }}>
                          📍 {donor.city || "City not specified"}
                        </p>
                        <p style={{ color: "#666", fontSize: "13px", marginBottom: "2px" }}>
                          📞 {donor.phone || "Phone not specified"}
                        </p>
                        <p style={{ color: "#999", fontSize: "12px" }}>
                          Last donated:{" "}
                          {donor.lastDonation
                            ? new Date(donor.lastDonation).toLocaleDateString("en-IN")
                            : "Never"}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap"
                    }}>
                      {/* Blood group badge */}
                      <span style={{
                        background: "#fff0f0",
                        color: "#8b0000",
                        fontWeight: "bold",
                        fontSize: "20px",
                        padding: "8px 16px",
                        borderRadius: "8px"
                      }}>
                        {donor.bloodGroup}
                      </span>

                      {/* SMS button */}
                      <button
                        onClick={() => handleSendSMS(donor)}
                        disabled={
                          smsStatus[donor._id] === "sending" ||
                          smsStatus[donor._id] === "sent" ||
                          !donor.phone
                        }
                        style={{
                          padding: "10px 16px",
                          background: !donor.phone
                            ? "#ccc"
                            : getSmsButtonColor(donor._id),
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: !donor.phone ? "not-allowed" : "pointer",
                          fontWeight: "bold",
                          fontSize: "13px",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {!donor.phone
                          ? "No phone"
                          : getSmsButtonText(donor._id)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}