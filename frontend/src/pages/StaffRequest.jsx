import { useState } from "react";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";

export default function StaffRequest({ darkMode, setDarkMode }) {
  const menuItems = [
    { label: "Staff Dashboard", path: "/staff/dashboard" },
    { label: "New Request", path: "/staff/request" },
    { label: "Pending Requests", path: "/staff/pending" }
  ];

  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    units: "",
    urgency: "Normal"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientName.trim()) {
      alert("Please enter patient name.");
      return;
    }
    if (!formData.bloodGroup) {
      alert("Please select a blood group.");
      return;
    }
    if (!formData.units || parseInt(formData.units) < 1) {
      alert("Please enter valid units.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        patientName: formData.patientName.trim(),
        bloodGroup: formData.bloodGroup,
        units: parseInt(formData.units),
        urgency: formData.urgency
      };

      console.log("Sending request payload:", payload);

      await apiFetch("/requests", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      alert("✅ Request submitted successfully!");
      setFormData({ patientName: "", bloodGroup: "", units: "", urgency: "Normal" });
    } catch (err) {
      console.error("Submit error:", err);
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        role="Staff"
        menuItems={menuItems}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <div className="main" style={{ padding: "30px" }}>
        <h1 style={{ color: "#8b0000", marginBottom: "24px" }}>
          New Blood Request
        </h1>

        <div className="form-card" style={{ maxWidth: "500px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block", marginBottom: "6px",
                fontSize: "13px", fontWeight: "bold", color: "#555"
              }}>
                Patient Name *
              </label>
              <input
                type="text"
                name="patientName"
                placeholder="Patient full name"
                value={formData.patientName}
                onChange={handleChange}
                required
                style={{
                  width: "100%", padding: "12px",
                  borderRadius: "8px", border: "1px solid #ddd",
                  fontSize: "14px", boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block", marginBottom: "6px",
                fontSize: "13px", fontWeight: "bold", color: "#555"
              }}>
                Blood Group *
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                style={{
                  width: "100%", padding: "12px",
                  borderRadius: "8px", border: "1px solid #ddd",
                  fontSize: "14px", boxSizing: "border-box"
                }}
              >
                <option value="">-- Select Blood Group --</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block", marginBottom: "6px",
                fontSize: "13px", fontWeight: "bold", color: "#555"
              }}>
                Units Required *
              </label>
              <input
                type="number"
                name="units"
                placeholder="Number of units needed"
                value={formData.units}
                onChange={handleChange}
                required
                min="1"
                style={{
                  width: "100%", padding: "12px",
                  borderRadius: "8px", border: "1px solid #ddd",
                  fontSize: "14px", boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block", marginBottom: "6px",
                fontSize: "13px", fontWeight: "bold", color: "#555"
              }}>
                Urgency Level
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                style={{
                  width: "100%", padding: "12px",
                  borderRadius: "8px", border: "1px solid #ddd",
                  fontSize: "14px", boxSizing: "border-box"
                }}
              >
                <option value="Normal">Normal</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "#ccc" : "#8b0000",
                color: "white", border: "none",
                borderRadius: "8px", fontSize: "16px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}