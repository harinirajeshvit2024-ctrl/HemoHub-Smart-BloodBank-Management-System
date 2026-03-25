import { useEffect, useState } from "react";

function BloodGroupCard({ group, units, maxUnits = 50 }) {
  const [barWidth, setBarWidth] = useState(0);
  const percent = Math.min((units / maxUnits) * 100, 100);
  const isLow = units < 10;
  const isMedium = units >= 10 && units < 20;
  const color = isLow ? "#e63946" : isMedium ? "#f4a261" : "#2a9d8f";

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(percent), 150);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div className={`blood-card ${isLow ? "low" : ""}`} style={{
      transition: "transform 0.2s ease",
      cursor: "default"
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <h3 style={{ color: "#8b0000", fontSize: "22px" }}>{group}</h3>
      <p style={{ fontSize: "18px", fontWeight: "bold", margin: "6px 0" }}>
        {units} Units
      </p>

      {/* Animated fill bar */}
      <div style={{
        background: "#f0f0f0",
        borderRadius: "4px",
        height: "8px",
        marginTop: "10px",
        overflow: "hidden"
      }}>
        <div style={{
          height: "100%",
          width: `${barWidth}%`,
          background: color,
          borderRadius: "4px",
          transition: "width 1.2s ease"
        }} />
      </div>

      {/* Status label */}
      <p style={{
        fontSize: "11px",
        marginTop: "6px",
        color: color,
        fontWeight: "bold"
      }}>
        {isLow ? "⚠ Critical Low" : isMedium ? "⚡ Medium" : "✅ Good"}
      </p>

      {isLow && <span className="alert">Low Stock</span>}
    </div>
  );
}

export default BloodGroupCard;