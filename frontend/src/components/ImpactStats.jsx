export default function ImpactStats({ totalDonors, totalUnits, approved }) {
  const livesSaved = approved * 3;

  const stats = [
    {
      icon: "🩸",
      value: totalUnits,
      label: "Units in Stock",
      sub: "Ready for patients",
      color: "#8b0000",
      bg: "#fff5f5"
    },
    {
      icon: "👥",
      value: totalDonors,
      label: "Registered Donors",
      sub: "Heroes in our network",
      color: "#2a9d8f",
      bg: "#f0faf8"
    },
    {
      icon: "❤️",
      value: livesSaved,
      label: "Lives Impacted",
      sub: "Through our system",
      color: "#e63946",
      bg: "#fff5f5"
    },
    {
      icon: "✅",
      value: approved,
      label: "Requests Fulfilled",
      sub: "Patients helped",
      color: "#f4a261",
      bg: "#fff9f5"
    }
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "30px"
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: s.bg,
          borderRadius: "14px",
          padding: "20px",
          border: `1px solid ${s.color}22`,
          display: "flex",
          alignItems: "center",
          gap: "16px",
          transition: "transform 0.2s ease",
          cursor: "default"
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          <div style={{
            fontSize: "36px",
            width: "56px", height: "56px",
            background: "white",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 12px ${s.color}22`,
            flexShrink: 0
          }}>
            {s.icon}
          </div>
          <div>
            <h2 style={{
              margin: 0,
              color: s.color,
              fontSize: "28px",
              fontWeight: "bold",
              lineHeight: 1
            }}>
              {s.value}
            </h2>
            <p style={{
              margin: "4px 0 2px",
              fontWeight: "bold",
              fontSize: "14px",
              color: "#333"
            }}>
              {s.label}
            </p>
            <p style={{
              margin: 0,
              fontSize: "12px",
              color: "#888"
            }}>
              {s.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}