import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const role = sessionStorage.getItem("role") || "Donor";

const RESPONSES = {
  // Navigation
  "dashboard": {
    text: "Taking you to the dashboard!",
    action: (navigate, role) => navigate(`/${role.toLowerCase()}`)
  },
  "inventory": {
    text: "Opening Blood Inventory...",
    action: (navigate) => navigate("/admin/blood-inventory")
  },
  "donors": {
    text: "Opening Donor List...",
    action: (navigate) => navigate("/admin/donors")
  },
  "requests": {
    text: role === "Admin"
      ? "Opening Blood Requests..."
      : "Opening Pending Requests...",
    action: (navigate, role) => navigate(
      role === "Admin" ? "/admin/requests" : "/staff/pending"
    )
  },
  "camps": {
    text: "Opening Donation Camps...",
    action: (navigate, role) => navigate(
      role === "Admin" ? "/admin/camps" : "/donor/camps"
    )
  },
  "stats": {
    text: "Opening Dashboard Statistics...",
    action: (navigate) => navigate("/admin/dashboard-stats")
  },
  "donor match": {
    text: "Opening Smart Donor Match...",
    action: (navigate) => navigate("/admin/donor-match")
  },
  "audit": {
    text: "Opening Audit Logs...",
    action: (navigate) => navigate("/admin/audit-logs")
  },
  "register": {
    text: "Opening Donor Registration...",
    action: (navigate) => navigate("/donor/register")
  },
  "history": {
    text: "Opening your Donation History...",
    action: (navigate) => navigate("/donor/history")
  },
  "tips": {
    text: "Opening Health Tips...",
    action: (navigate) => navigate("/donor/tips")
  },
  "new request": {
    text: "Opening New Blood Request form...",
    action: (navigate) => navigate("/staff/request")
  },

  // Info questions
  "how to donate": {
    text: "To donate blood:\n1. Register as a donor\n2. Visit the camp or hospital\n3. Admin records your donation\n4. Your blood group stock increases automatically! 🩸"
  },
  "blood groups": {
    text: "The 8 blood groups are:\nA+, A-, B+, B-, O+, O-, AB+, AB-\n\nO- is the universal donor.\nAB+ is the universal recipient."
  },
  "eligible": {
    text: "You are eligible to donate if:\n✅ Age between 18-65\n✅ Weight at least 50kg\n✅ No donation in last 90 days\n✅ No active illness or infection"
  },
  "how often": {
    text: "You can donate whole blood every 90 days (3 months). This gives your body enough time to replenish the donated blood. 💪"
  },
  "after donation": {
    text: "After donating blood:\n💧 Drink plenty of water\n🍎 Eat iron-rich foods\n🚫 Avoid heavy exercise for 24 hours\n🩹 Keep bandage on for 4-5 hours"
  },
  "stock": {
    text: "You can check current blood stock in Blood Inventory. Levels below 10 units trigger a critical alert! 🚨"
  },
  "help": {
    text: "I can help you with:\n🔹 Navigate pages — say 'go to inventory'\n🔹 Blood donation info — say 'how to donate'\n🔹 Eligibility — say 'am I eligible'\n🔹 Health tips — say 'tips after donation'\n\nWhat do you need?"
  },
  "hello": { text: "Hello! 👋 I am HemoHub Assistant. Type 'help' to see what I can do!" },
  "hi": { text: "Hi there! 👋 How can I help you today? Type 'help' for options." },
  "thanks": { text: "You're welcome! 🩸 Every donation saves lives. Is there anything else I can help with?" },
  "bye": { text: "Goodbye! 👋 Thank you for being a blood donation hero! 🩸" }
};

const getResponse = (input) => {
  const lower = input.toLowerCase().trim();

  // Check exact or partial matches
  for (const key of Object.keys(RESPONSES)) {
    if (lower.includes(key)) {
      return RESPONSES[key];
    }
  }

  // Navigation shortcuts
  if (lower.includes("go to") || lower.includes("open") || lower.includes("show")) {
    for (const key of Object.keys(RESPONSES)) {
      if (lower.includes(key)) return RESPONSES[key];
    }
  }

  return {
    text: "I'm not sure about that. Type 'help' to see what I can help you with! 😊"
  };
};

export default function Chatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm HemoHub Assistant 🩸\nType 'help' to see what I can do, or ask me anything!"
    }
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const userRole = sessionStorage.getItem("role") || "Donor";

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    const response = getResponse(input);

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Bot reply with slight delay
    setTimeout(() => {
      setMessages(prev => [...prev, { from: "bot", text: response.text }]);

      // Execute navigation if needed
      if (response.action) {
        setTimeout(() => {
          response.action(navigate, userRole);
          setOpen(false);
        }, 800);
      }
    }, 400);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const quickButtons = [
    { label: "Help", msg: "help" },
    { label: "Blood Stock", msg: "stock" },
    { label: "Eligibility", msg: "eligible" },
    { label: "After Donation", msg: "after donation" }
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#8b0000",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "26px",
          boxShadow: "0 6px 20px rgba(139,0,0,0.4)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s ease"
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {open ? "✕" : "🩸"}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: "100px",
          right: "28px",
          width: "340px",
          height: "480px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #eee"
        }}>

          {/* Header */}
          <div style={{
            background: "#8b0000",
            padding: "16px 20px",
            color: "white"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "18px"
              }}>
                🩸
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "15px" }}>
                  HemoHub Assistant
                </p>
                <p style={{ margin: 0, fontSize: "12px", opacity: 0.85 }}>
                  Ask me anything or navigate
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "#f9f9f9"
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.from === "user" ? "flex-end" : "flex-start"
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: msg.from === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  background: msg.from === "user" ? "#8b0000" : "white",
                  color: msg.from === "user" ? "white" : "#333",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  whiteSpace: "pre-line"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick buttons */}
          <div style={{
            padding: "8px 12px",
            display: "flex", gap: "6px",
            flexWrap: "wrap",
            background: "white",
            borderTop: "1px solid #f0f0f0"
          }}>
            {quickButtons.map((btn, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(btn.msg);
                  setTimeout(() => {
                    const response = getResponse(btn.msg);
                    setMessages(prev => [
                      ...prev,
                      { from: "user", text: btn.msg },
                      { from: "bot", text: response.text }
                    ]);
                    if (response.action) {
                      setTimeout(() => {
                        response.action(navigate, userRole);
                        setOpen(false);
                      }, 800);
                    }
                  }, 100);
                }}
                style={{
                  padding: "4px 12px",
                  background: "#fff0f0",
                  color: "#8b0000",
                  border: "1px solid #fcc",
                  borderRadius: "16px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: "12px",
            background: "white",
            borderTop: "1px solid #f0f0f0",
            display: "flex", gap: "8px"
          }}>
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              style={{
                flex: 1, padding: "10px 14px",
                borderRadius: "20px",
                border: "1px solid #ddd",
                fontSize: "13px", outline: "none"
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                width: "38px", height: "38px",
                background: "#8b0000",
                color: "white", border: "none",
                borderRadius: "50%", cursor: "pointer",
                fontSize: "16px", display: "flex",
                alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}