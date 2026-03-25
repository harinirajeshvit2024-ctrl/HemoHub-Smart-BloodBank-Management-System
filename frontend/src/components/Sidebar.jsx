import { useNavigate, useLocation } from "react-router-dom";

const icons = {
  "Dashboard Stats": "📊",
  "Blood Inventory": "🩸",
  "Donor List": "👥",
  "Pending Requests": "📋",
  "Register Donation": "✍️",
  "Donation History": "📅",
  "Health Tips": "💡",
  "Donation Camps": "🏕️",
  "New Request": "➕",
  "Donor Match": "🎯",
  "Manage Camps": "🏕️",
  "Staff Dashboard": "🏠",
  "Audit Logs": "🔍",
};

export default function Sidebar({ role, menuItems, darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const roleIcon = role === "Admin" ? "🛡️" : role === "Donor" ? "🩸" : "👨‍⚕️";

  return (
   <div className="sidebar" style={{ position: "relative", minHeight: "100vh" }}>

      {/* Logo area */}
      <div>
        <div style={{
          padding: "24px 20px",
          borderBottom: "1px solid rgba(139,0,0,0.2)",
          marginBottom: "8px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px"
          }}>
            <div style={{
              width: "36px", height: "36px",
              background: "linear-gradient(135deg, #8b0000, #ff1a1a)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 0 12px rgba(139,0,0,0.5)"
            }}>
              🩸
            </div>
            <div>
              <p style={{
                margin: 0,
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: "700",
                fontSize: "20px",
                color: "white",
                letterSpacing: "2px"
              }}>
                HEMO<span style={{ color: "#ff4444" }}>HUB</span>
              </p>
              <p style={{
                margin: 0,
                fontSize: "10px",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "1px"
              }}>
                BLOOD BANK SYSTEM
              </p>
            </div>
          </div>

          {/* Role badge */}
          <div style={{
            background: "rgba(139,0,0,0.2)",
            border: "1px solid rgba(139,0,0,0.3)",
            borderRadius: "8px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{ fontSize: "18px" }}>{roleIcon}</span>
            <div>
              <p style={{
                margin: 0, fontSize: "13px",
                fontWeight: "600", color: "white"
              }}>
                {role}
              </p>
              <p style={{
                margin: 0, fontSize: "10px",
                color: "rgba(255,255,255,0.4)"
              }}>
                {sessionStorage.getItem("username") || "user"}
              </p>
            </div>
            {/* Live indicator */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{
                width: "6px", height: "6px",
                background: "#00ff88",
                borderRadius: "50%",
                boxShadow: "0 0 6px #00ff88",
                animation: "pulse 2s infinite"
              }} />
              <span style={{ fontSize: "9px", color: "#00ff88" }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <ul style={{ listStyle: "none", padding: "0 12px", margin: 0 }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li
                key={index}
                onClick={() => navigate(item.path)}
                style={{
                  padding: "10px 12px",
                  marginBottom: "2px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  background: isActive
                    ? "rgba(139,0,0,0.4)"
                    : "transparent",
                  borderLeft: isActive
                    ? "2px solid #ff4444"
                    : "2px solid transparent",
                  transition: "all 0.15s ease",
                  color: isActive
                    ? "white"
                    : "rgba(255,255,255,0.55)",
                  fontSize: "13px",
                  fontWeight: isActive ? "600" : "400"
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(139,0,0,0.15)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                  }
                }}
              >
                <span style={{ fontSize: "15px", flexShrink: 0 }}>
                  {icons[item.label] || "•"}
                </span>
                {item.label}
                {isActive && (
                  <div style={{
                    marginLeft: "auto",
                    width: "4px", height: "4px",
                    background: "#ff4444",
                    borderRadius: "50%"
                  }} />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(139,0,0,0.2)" }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: "100%",
            padding: "9px",
            marginBottom: "8px",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "12px",
            transition: "all 0.2s"
          }}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "9px",
            background: "rgba(139,0,0,0.2)",
            color: "#ff6b6b",
            border: "1px solid rgba(139,0,0,0.3)",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(139,0,0,0.4)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(139,0,0,0.2)"}
        >
          🚪 Logout
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}