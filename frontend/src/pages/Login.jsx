import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!role || !username || !password) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }
      sessionStorage.setItem("token", data.token);
sessionStorage.setItem("role", data.role);
sessionStorage.setItem("username", data.username);

      if (data.role === "Admin") navigate("/admin");
      else if (data.role === "Staff") navigate("/staff");
      else navigate("/donor");
    } catch {
      alert("Cannot reach server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* ECG ANIMATION - keeping exactly as you have it */}
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

      {/* BLOOD RIPPLE BACKGROUND - keeping exactly as you have it */}
      <div className="blood-pool"></div>

      {/* LOGIN CARD */}
      <div className="card">
        <h2 className="title">HemoHub</h2>
        <p className="subtitle">Smart Blood Bank Management System</p>

        <select
          className="select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option>Admin</option>
          <option>Donor</option>
          <option>Staff</option>
        </select>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

       <button
          className="button"
          onClick={handleLogin}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>

        {/* Link to register */}
        <p style={{ marginTop: "16px", fontSize: "14px", color: "#555" }}>
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{ color: "#8b0000", cursor: "pointer", fontWeight: "bold" }}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;