import { useState, useEffect } from "react";

const facts = [
  "🩸 Every 2 seconds, someone in India needs blood.",
  "💉 1 donation can save up to 3 lives.",
  "🏥 Only 1% of India's population donates blood.",
  "⏱ Blood has a shelf life of only 42 days.",
  "🆘 O- is the universal donor — always in critical demand.",
  "❤️ A healthy adult can donate blood every 90 days.",
  "🚨 Blood cannot be manufactured — only humans can donate.",
  "📊 India needs 5 crore units of blood annually.",
  "🌍 Voluntary donors are the safest source of blood.",
  "💪 Donating blood burns approximately 650 calories."
];

export default function BloodFactsTicker() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % facts.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: "#8b0000",
      color: "white",
      padding: "14px 20px",
      borderRadius: "10px",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 4px 12px rgba(139,0,0,0.25)"
    }}>
      <span style={{
        background: "white",
        color: "#8b0000",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "bold",
        whiteSpace: "nowrap",
        flexShrink: 0
      }}>
        DID YOU KNOW
      </span>
      <p style={{
        margin: 0,
        fontSize: "14px",
        fontWeight: "500",
        color: "white",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        lineHeight: "1.4"
      }}>
        {facts[current]}
      </p>
    </div>
  );
}