import { useState, useEffect } from "react";
import { apiFetch } from "../api";

export default function EmergencyBanner() {
  const [criticalGroups, setCriticalGroups] = useState([]);

  useEffect(() => {
    apiFetch("/stock")
      .then(data => {
        const critical = data.filter(s => s.units < 10);
        setCriticalGroups(critical);
      })
      .catch(() => {});
  }, []);

  if (criticalGroups.length === 0) return null;

  return (
    <div style={{
      backgroundColor: "#c0392b",
      borderRadius: "10px",
      padding: "16px 22px",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      boxShadow: "0 6px 20px rgba(192,57,43,0.5)",
      border: "none",
      position: "relative",
      zIndex: 10
    }}>

      {/* Pulsing dot */}
      <div style={{
        width: "14px",
        height: "14px",
        backgroundColor: "white",
        borderRadius: "50%",
        flexShrink: 0,
        boxShadow: "0 0 0 4px rgba(255,255,255,0.3)"
      }} />

      <div style={{ flex: 1 }}>

        {/* Title */}
        <p style={{
          margin: "0 0 6px 0",
          fontWeight: "700",
          color: "#ffffff",
          fontSize: "15px",
          letterSpacing: "0.5px",
          textShadow: "none",
          opacity: 1
        }}>
          🚨 CRITICAL STOCK ALERT — Immediate action required
        </p>

        {/* Subtitle */}
        <div style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "6px"
        }}>
          <span style={{
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "500",
            opacity: 1
          }}>
            Critically low blood groups:
          </span>
          {criticalGroups.map(g => (
            <span
              key={g.bloodGroup}
              style={{
                backgroundColor: "#ffffff",
                color: "#c0392b",
                padding: "3px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "700",
                display: "inline-block"
              }}
            >
              {g.bloodGroup} — {g.units} left
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}