import { useState, useEffect } from "react";
import { apiFetch } from "../api";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await apiFetch("/requests");
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
  if (processing[id]) return;

  setProcessing(prev => ({ ...prev, [id]: true }));

  try {
    const result = await apiFetch(`/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });

    setRequests(prev => prev.map(r =>
      r._id === id ? { ...r, status: result.request?.status || status } : r
    ));

  } catch (err) {
    console.log("Update error:", err.message);
    // Always show the real error message
    alert("❌ " + err.message);
  } finally {
    setProcessing(prev => ({ ...prev, [id]: false }));
  }
};


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
    <div className="page-container"><p>Loading requests...</p></div>
  );

  return (
    <div className="page-container">
      <h2 className="page-title">Blood Requests Management</h2>

      {requests.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px",
          background: "white", borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
        }}>
          <p style={{ color: "#666" }}>No requests available.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {requests.map(req => (
            <div key={req._id} style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderLeft: `4px solid ${getUrgencyColor(req.urgency)}`,
              opacity: processing[req._id] ? 0.7 : 1
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", flexWrap: "wrap", gap: "12px"
              }}>
                <div>
                  <p style={{
                    fontWeight: "bold", fontSize: "16px",
                    marginBottom: "8px", color: "#333"
                  }}>
                    🏥 {req.patientName}
                  </p>
                  <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                    🩸 Blood Group:{" "}
                    <strong style={{ color: "#8b0000" }}>{req.bloodGroup}</strong>
                  </p>
                  <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                    📦 Units: <strong>{req.units}</strong>
                  </p>
                  <p style={{ fontSize: "14px", margin: "4px 0" }}>
                    ⚡ Urgency:{" "}
                    <span style={{
                      color: getUrgencyColor(req.urgency),
                      fontWeight: "bold"
                    }}>
                      {req.urgency}
                    </span>
                  </p>
                  <p style={{ color: "#999", fontSize: "12px", margin: "4px 0" }}>
                    📅 {new Date(req.date).toLocaleDateString("en-IN", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </p>
                </div>

                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "flex-end", gap: "10px"
                }}>
                  <span style={getStatusStyle(req.status)}>
                    {req.status === "Approved" ? "✅" :
                     req.status === "Rejected" ? "❌" : "⏳"} {req.status}
                  </span>

                  {req.status === "Pending" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-approve"
                        onClick={() => updateStatus(req._id, "Approved")}
                        disabled={!!processing[req._id]}
                        style={{
                          opacity: processing[req._id] ? 0.5 : 1,
                          cursor: processing[req._id] ? "not-allowed" : "pointer"
                        }}
                      >
                        {processing[req._id] ? "Processing..." : "✅ Approve"}
                      </button>
                      <button
                        className="btn btn-reject"
                        onClick={() => updateStatus(req._id, "Rejected")}
                        disabled={!!processing[req._id]}
                        style={{
                          opacity: processing[req._id] ? 0.5 : 1,
                          cursor: processing[req._id] ? "not-allowed" : "pointer"
                        }}
                      >
                        {processing[req._id] ? "..." : "❌ Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}