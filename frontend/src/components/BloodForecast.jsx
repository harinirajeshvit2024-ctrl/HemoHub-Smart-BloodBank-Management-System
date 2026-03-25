import { useState } from "react";
import { apiFetch } from "../api";

export default function BloodForecast({ stockData, requestData }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 const getForecast = async () => {
  if (!stockData || stockData.length === 0) {
    alert("No stock data available.");
    return;
  }
  setLoading(true);
  setError(null);
  setForecast(null);

  try {
    const data = await apiFetch("/ai/forecast", {
      method: "POST",
      body: JSON.stringify({
        stock: stockData,
        requests: requestData || []
      })
    });
    setForecast(data.forecast);
  } catch (err) {
    console.error(err);
    setError("Could not generate forecast. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const riskColor = {
    High: "#e63946",
    Medium: "#f4a261",
    Low: "#2a9d8f"
  };

  const riskBg = {
    High: "#fff5f5",
    Medium: "#fff9f5",
    Low: "#f0faf8"
  };

  return (
    <div style={{
      marginTop: "30px",
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
            🤖 AI Blood Demand Forecast
          </h3>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
            Analyzes current stock + request history to predict shortages in next 7 days
          </p>
        </div>
        <button
          onClick={getForecast}
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: loading ? "#ccc" : "linear-gradient(135deg, #8b0000, #c0392b)",
            color: "white", border: "none",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold", fontSize: "14px",
            boxShadow: loading ? "none" : "0 4px 12px rgba(139,0,0,0.3)"
          }}
        >
          {loading ? "🔄 Analyzing..." : "▶ Run AI Forecast"}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          textAlign: "center", padding: "40px",
          background: "#f9f9f9", borderRadius: "10px"
        }}>
          <p style={{ fontSize: "32px", marginBottom: "12px" }}>🧠</p>
          <p style={{ color: "#666", fontSize: "15px", marginBottom: "4px" }}>
            AI is analyzing blood demand patterns...
          </p>
          <p style={{ color: "#999", fontSize: "13px" }}>
            This may take a few seconds
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          padding: "16px", background: "#fff5f5",
          borderRadius: "10px", border: "1px solid #fcc",
          color: "#e63946", fontSize: "14px"
        }}>
          ❌ {error}
        </div>
      )}

      {/* Forecast results */}
      {forecast && !loading && (
        <div>
          <p style={{
            fontSize: "13px", color: "#666",
            marginBottom: "16px", fontStyle: "italic"
          }}>
            Based on current stock levels and recent request patterns:
          </p>

          {forecast.length === 0 ? (
            <div style={{
              padding: "24px", textAlign: "center",
              background: "#f0faf8", borderRadius: "10px"
            }}>
              <p style={{ fontSize: "24px", marginBottom: "8px" }}>✅</p>
              <p style={{ color: "#2a9d8f", fontWeight: "bold" }}>
                All blood groups look stable for the next 7 days!
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {forecast.map((row, i) => (
                <div key={i} style={{
                  background: riskBg[row.riskLevel] || "#f9f9f9",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  borderLeft: `4px solid ${riskColor[row.riskLevel] || "#ccc"}`
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", flexWrap: "wrap", gap: "12px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      {/* Blood group badge */}
                      <div style={{
                        background: riskColor[row.riskLevel],
                        color: "white",
                        width: "52px", height: "52px",
                        borderRadius: "12px",
                        display: "flex", alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold", fontSize: "16px",
                        flexShrink: 0
                      }}>
                        {row.group}
                      </div>

                      <div>
                        <div style={{
                          display: "flex", alignItems: "center",
                          gap: "8px", marginBottom: "6px"
                        }}>
                          <span style={{
                            background: riskColor[row.riskLevel],
                            color: "white",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold"
                          }}>
                            {row.riskLevel === "High" ? "🔴" :
                             row.riskLevel === "Medium" ? "🟡" : "🟢"}{" "}
                            {row.riskLevel} Risk
                          </span>
                        </div>
                        <p style={{
                          margin: "0 0 4px",
                          fontSize: "13px", color: "#555"
                        }}>
                          📦 Current: <strong>{row.currentUnits} units</strong>
                          {" · "}
                          📈 Predicted demand: <strong>{row.predictedDemand} units</strong>
                        </p>
                        <p style={{
                          margin: 0, fontSize: "13px", color: "#777"
                        }}>
                          💡 {row.reason}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <div style={{
                      background: "white",
                      border: `1px solid ${riskColor[row.riskLevel]}44`,
                      borderRadius: "8px",
                      padding: "10px 14px",
                      maxWidth: "260px"
                    }}>
                      <p style={{
                        margin: "0 0 4px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        color: riskColor[row.riskLevel],
                        textTransform: "uppercase"
                      }}>
                        Recommended Action
                      </p>
                      <p style={{
                        margin: 0, fontSize: "13px", color: "#333"
                      }}>
                        {row.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <p style={{
            fontSize: "11px", color: "#aaa",
            marginTop: "16px", textAlign: "center"
          }}>
            AI predictions are based on current data patterns.
            Always verify with medical staff before taking action.
          </p>
        </div>
      )}
    </div>
  );
}