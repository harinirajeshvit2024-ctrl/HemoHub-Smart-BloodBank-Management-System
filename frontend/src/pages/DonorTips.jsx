import { useState } from "react";
import Sidebar from "../components/Sidebar";

const ALL_TIPS = [
  {
    category: "Before Donation",
    icon: "💧",
    color: "#2a9d8f",
    bg: "#f0faf8",
    tips: [
      "Drink at least 500ml of water 2 hours before donating.",
      "Eat a healthy meal before donation — avoid fatty foods.",
      "Get a good night's sleep before your donation day.",
      "Avoid alcohol for at least 24 hours before donating.",
      "Wear comfortable clothing with sleeves that roll up easily."
    ]
  },
  {
    category: "After Donation",
    icon: "🩹",
    color: "#8b0000",
    bg: "#fff5f5",
    tips: [
      "Rest for at least 10-15 minutes after donating.",
      "Drink extra fluids for the next 24-48 hours.",
      "Avoid heavy lifting or strenuous exercise for 24 hours.",
      "Keep the bandage on for at least 4-5 hours.",
      "Eat iron-rich foods like spinach, meat and beans to recover."
    ]
  },
  {
    category: "Eligibility Rules",
    icon: "✅",
    color: "#6c5ce7",
    bg: "#f5f3ff",
    tips: [
      "You must be between 18 and 65 years of age to donate.",
      "Minimum weight requirement is 50kg.",
      "You can donate whole blood every 90 days (3 months).",
      "You must not have donated blood in the last 3 months.",
      "You should be free of cold, flu or infection on donation day."
    ]
  },
  {
    category: "Health Benefits",
    icon: "❤️",
    color: "#e63946",
    bg: "#fff5f5",
    tips: [
      "Donating blood burns approximately 650 calories per donation.",
      "Regular donation reduces risk of heart disease.",
      "Blood donation stimulates production of new blood cells.",
      "It helps in detecting unknown health issues through screening.",
      "Donors often report feeling a sense of well-being after donating."
    ]
  },
  {
    category: "Important Facts",
    icon: "📊",
    color: "#f4a261",
    bg: "#fff9f5",
    tips: [
      "One donation can save up to 3 lives.",
      "India needs 5 crore units of blood every year.",
      "Only 1% of India's population donates blood voluntarily.",
      "Blood cannot be manufactured — only humans can donate.",
      "O- blood group is the universal donor — always in high demand."
    ]
  }
];

export default function DonorTips({ darkMode, setDarkMode }) {
  const menuItems = [
    { label: "Register Donation", path: "/donor/register" },
    { label: "Donation History", path: "/donor/history" },
    { label: "Health Tips", path: "/donor/tips" },
    { label: "Donation Camps", path: "/donor/camps" }
  ];

  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...ALL_TIPS.map(t => t.category)];

  const filtered = activeCategory === "All"
    ? ALL_TIPS
    : ALL_TIPS.filter(t => t.category === activeCategory);

  return (
    <div className="dashboard-container">
      <Sidebar
        role="Donor"
        menuItems={menuItems}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="main" style={{ padding: "30px" }}>
        <h1 style={{ color: "#8b0000", marginBottom: "8px" }}>
          💡 Health Tips
        </h1>
        <p style={{ color: "#666", marginBottom: "24px", fontSize: "14px" }}>
          Everything you need to know about blood donation
        </p>

        {/* Category filter */}
        <div style={{
          display: "flex", gap: "8px",
          marginBottom: "28px", flexWrap: "wrap"
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 18px",
                background: activeCategory === cat ? "#8b0000" : "white",
                color: activeCategory === cat ? "white" : "#555",
                border: "1px solid #ddd",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: activeCategory === cat ? "bold" : "normal",
                transition: "all 0.2s"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tips grid */}
        <div style={{ display: "grid", gap: "24px" }}>
          {filtered.map((section, i) => (
            <div key={i} style={{
              background: "white",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
              borderTop: `4px solid ${section.color}`
            }}>
              {/* Section header */}
              <div style={{
                display: "flex", alignItems: "center",
                gap: "10px", marginBottom: "18px"
              }}>
                <span style={{
                  fontSize: "28px",
                  width: "48px", height: "48px",
                  background: section.bg,
                  borderRadius: "12px",
                  display: "flex", alignItems: "center",
                  justifyContent: "center"
                }}>
                  {section.icon}
                </span>
                <h3 style={{
                  margin: 0, color: section.color,
                  fontSize: "18px", fontWeight: "bold"
                }}>
                  {section.category}
                </h3>
              </div>

              {/* Tips list */}
              <div style={{ display: "grid", gap: "10px" }}>
                {section.tips.map((tip, j) => (
                  <div key={j} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px 16px",
                    background: section.bg,
                    borderRadius: "8px"
                  }}>
                    <span style={{
                      width: "24px", height: "24px",
                      background: section.color,
                      color: "white",
                      borderRadius: "50%",
                      display: "flex", alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px", fontWeight: "bold",
                      flexShrink: 0, marginTop: "1px"
                    }}>
                      {j + 1}
                    </span>
                    <p style={{
                      margin: 0, fontSize: "14px",
                      color: "#333", lineHeight: "1.6"
                    }}>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}