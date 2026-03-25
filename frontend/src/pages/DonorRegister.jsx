import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";

function DonorRegister({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const menuItems = [
    { label: "Register Donation", path: "/donor/register" },
    { label: "Donation History", path: "/donor/history" },
    { label: "Health Tips", path: "/donor/tips" },
    { label: "Donation Camps", path: "/donor/camps" }
  ];

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    bloodGroup: "",
    phone: "",
    city: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const age = Number(formData.age);
    const weight = Number(formData.weight);

    if (!formData.name || !formData.bloodGroup) {
      setError("Please fill all fields.");
      return;
    }
    if (age < 18 || age > 60) {
      setError("Age must be between 18 and 60.");
      return;
    }
    if (weight < 50) {
      setError("Weight must be at least 50kg.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/donors", {
        method: "POST",
        body: JSON.stringify({ ...formData, age, weight })
      });
      alert("Donor Registered Successfully!");
      navigate("/donor");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        role="Donor"
        menuItems={menuItems}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="main" style={{ padding: "30px" }}>
        <h1 style={{ color: "#8b0000", marginBottom: "24px" }}>
          🩸 Register Donation
        </h1>

        

        {/* REGISTRATION FORM */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          maxWidth: "700px"
        }}>
          <h2 style={{
            color: "#8b0000",
            marginBottom: "24px",
            fontSize: "20px"
          }}>
            Donor Details
          </h2>

          {error && (
            <p style={{
              color: "#e63946",
              background: "#fff5f5",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px"
            }}>
              ⚠ {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="donor-form">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="weight"
              placeholder="Weight (kg)"
              value={formData.weight}
              onChange={handleChange}
              required
            />

            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
            >
              <option value="">Select Blood Group</option>
              {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                gridColumn: "span 2",
                padding: "14px",
                background: loading ? "#ccc" : "#8b0000",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s"
              }}
            >
              {loading ? "Registering..." : "Register as Donor"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DonorRegister;