import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    // Basic validations
    if (!formData.name || !formData.username || !formData.password || !formData.role) {
      setError("Please fill all fields.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          role: formData.role
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      alert("Account created successfully! Please login.");
      navigate("/");
    } catch {
      setError("Cannot reach server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* ECG ANIMATION — same as login page */}
      <div className="ecg-container">
        <svg viewBox="0 0 1000 100" className="ecg-svg">
          <path
            d="M0 50 L100 50 L130 20 L160 80 L190 30 L220 50 L300 50
               L330 20 L360 80 L390 30 L420 50 L500 50 L530 20 L560 80
               L590 30 L620 50 L1000 50"
            className="ecg-line"
          />
        </svg>
      </div>

      {/* BLOOD RIPPLE BACKGROUND — same as login page */}
      <div className="blood-pool"></div>

      {/* REGISTER CARD */}
      <div className="card" style={{ width: "420px" }}>
        <h2 className="title">HemoHub</h2>
        <p className="subtitle">Create your account</p>

        {error && (
          <p style={{
            color: "#e63946",
            background: "#fff5f5",
            padding: "10px",
            borderRadius: "6px",
            fontSize: "14px",
            marginBottom: "10px"
          }}>
            {error}
          </p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />

        <select
          className="select"
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="">Select Role</option>
          <option value="Admin">Admin</option>
          <option value="Donor">Donor</option>
          <option value="Staff">Staff</option>
        </select>

        <input
          type="password"
          name="password"
          placeholder="Password (min 6 characters)"
          value={formData.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <button
          className="button"
          onClick={handleRegister}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Creating Account..." : "CREATE ACCOUNT"}
        </button>

        {/* Link back to login */}
        <p style={{ marginTop: "16px", fontSize: "14px", color: "#555" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            style={{ color: "#8b0000", cursor: "pointer", fontWeight: "bold" }}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;