import { useEffect, useRef, useState } from "react";

function StatCard({ title, value, color }) {
  const [display, setDisplay] = useState(0);
  const start = useRef(null);

  useEffect(() => {
    const target = Number(value);
    if (!target) return;
    const duration = 1200;
    start.current = null;
    const step = (timestamp) => {
      if (!start.current) start.current = timestamp;
      const progress = Math.min((timestamp - start.current) / duration, 1);
      setDisplay(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <div className="stat-card" style={{
      borderLeft: `5px solid ${color || "#8b0000"}`,
      transition: "transform 0.2s ease",
      cursor: "default"
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <h4>{title}</h4>
      <h2>{display}</h2>
    </div>
  );
}

export default StatCard;