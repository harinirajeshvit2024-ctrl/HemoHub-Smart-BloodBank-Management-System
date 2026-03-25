import { useState } from "react";
import { apiFetch } from "../api";

export default function EmergencyPredictor({ stockData, requestData, donorData }) {
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 const getEmergencyAlert = async () => {
  setLoading(true);
  setError(null);
  setAlert(null);

  try {
    const data = await apiFetch("/ai/emergency", {
      method: "POST",
      body: JSON.stringify({
        stock: stockData || [],
        requests: requestData || [],
        donors: donorData || []
      })
    });
    setAlert(data.alert);
  } catch (err) {
    console.error(err);
    setError("Could not generate emergency analysis. Please try again.");
  } finally {
    setLoading(false);
  }
};
  const alertColors = {
    Critical: { bg: "#fff5f5", border: "#e63946", text: "#e63946", badge: "#e63946" },
    High: { bg: "#fff9f0", border: "#f4a261", text: "#f4a261", badge: "#f4a261" },
    Medium: { bg: "#fffbf0", border: "#f4a261", text: "#856404", badge: "#f4a261" },
    Low: { bg: "#f0faf8", border: "#2a9d8f", text: "#2a9d8f", badge: "#2a9d8f" },
    Normal: { bg: "#f0faf8", border: "#2a9d8f", text: "#2a9d8f", badge: "#2a9d8f" }
  };

  const colors = alert
    ? alertColors[alert.alertLevel] || alertColors.Normal
    : null;

  return (
    <div style={{
      marginTop: "24px",
      background: "white",
      borderRadius: "14px",
      padding: "24px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "20px",
        flexWrap: "wrap", gap: "12px"
      }}>
        <div>
          <h3 style={{ color: "#8b0000", margin: "0 0 6px" }}>
            🚨 AI Emergency Alert Predictor
          </h3>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
            Analyzes critical stock, pending requests and donor availability
            to predict emergency situations
          </p>
        </div>
        <button
          onClick={getEmergencyAlert}
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: loading ? "#ccc" : "linear-gradient(135deg, #e63946, #c0392b)",
            color: "white", border: "none",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold", fontSize: "14px",
            boxShadow: loading ? "none" : "0 4px 12px rgba(230,57,70,0.3)"
          }}
        >
          {loading ? "🔄 Analyzing..." : "🚨 Analyze Emergency"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          textAlign: "center", padding: "40px",
          background: "#fff5f5", borderRadius: "10px"
        }}>
          <p style={{ fontSize: "32px", marginBottom: "12px" }}>🚨</p>
          <p style={{ color: "#e63946", fontSize: "15px", marginBottom: "4px" }}>
            AI is analyzing emergency situation...
          </p>
          <p style={{ color: "#999", fontSize: "13px" }}>
            Checking stock levels, pending requests and donor availability
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: "16px", background: "#fff5f5",
          borderRadius: "10px", border: "1px solid #fcc",
          color: "#e63946", fontSize: "14px"
        }}>
          ❌ {error}
        </div>
      )}

      {/* Alert results */}
      {alert && !loading && (
        <div style={{
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          borderRadius: "12px",
          padding: "24px"
        }}>
          {/* Alert level badge */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: "12px", marginBottom: "16px"
          }}>
            <span style={{
              background: colors.badge,
              color: "white",
              padding: "6px 16px",
              borderRadius: "20px",
              fontWeight: "bold",
              fontSize: "14px"
            }}>
              {alert.alertLevel === "Critical" ? "🔴" :
               alert.alertLevel === "High" ? "🟠" :
               alert.alertLevel === "Medium" ? "🟡" : "🟢"}{" "}
              {alert.alertLevel} Alert
            </span>
            <span style={{
              fontSize: "13px", color: "#666",
              fontWeight: "bold"
            }}>
              ⏰ Time to act: {alert.timeToAct}
            </span>
          </div>

          {/* Summary */}
          <p style={{
            fontSize: "15px", fontWeight: "bold",
            color: colors.text, marginBottom: "20px",
            lineHeight: "1.5"
          }}>
            {alert.summary}
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px"
          }}>
            {/* Immediate actions */}
            <div style={{
              background: "white",
              borderRadius: "10px",
              padding: "16px"
            }}>
              <p style={{
                fontWeight: "bold", color: "#333",
                marginBottom: "12px", fontSize: "14px"
              }}>
                ⚡ Immediate Actions Required
              </p>
              <div style={{ display: "grid", gap: "8px" }}>
                {alert.immediateActions.map((action, i) => (
                  <div key={i} style={{
                    display: "flex", gap: "10px",
                    alignItems: "flex-start"
                  }}>
                    <span style={{
                      width: "22px", height: "22px",
                      background: colors.badge,
                      color: "white",
                      borderRadius: "50%",
                      display: "flex", alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px", fontWeight: "bold",
                      flexShrink: 0, marginTop: "1px"
                    }}>
                      {i + 1}
                    </span>
                    <p style={{
                      margin: 0, fontSize: "13px",
                      color: "#444", lineHeight: "1.5"
                    }}>
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Predicted impact */}
            <div style={{
              background: "white",
              borderRadius: "10px",
              padding: "16px"
            }}>
              <p style={{
                fontWeight: "bold", color: "#333",
                marginBottom: "12px", fontSize: "14px"
              }}>
                📊 Predicted Impact (if no action)
              </p>
              <p style={{
                fontSize: "13px", color: "#555",
                lineHeight: "1.6", margin: 0
              }}>
                {alert.predictedImpact}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{
            fontSize: "11px", color: "#aaa",
            marginTop: "16px", textAlign: "center"
          }}>
            AI analysis is advisory only.
            Always consult medical professionals for emergency decisions.
          </p>
        </div>
      )}
    </div>
  );
}