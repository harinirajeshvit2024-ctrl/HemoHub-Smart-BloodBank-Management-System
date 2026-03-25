import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import "../index.css";

// Sample data for charts
const donationData = [
  { month: "Jan", donations: 2 },
  { month: "Feb", donations: 3 },
  { month: "Mar", donations: 1 },
  { month: "Apr", donations: 4 },
  { month: "May", donations: 2 },
];

export default function DonorDashboard() {
  const navigate = useNavigate();
  const [donorData, setDonorData] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    contact: "",
  });

  const handleChange = (e) => setDonorData({ ...donorData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Registration Successful!");
    console.log(donorData);
  };

  const handleLogout = () => navigate("/");

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>HemoHub Donor</h2>
        <ul className="menu">
          <li>Register</li>
          <li>Donation History</li>
          <li>Blood Tips</li>
        </ul>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="main">
        <h1>Donor Dashboard</h1>

        {/* Stats Cards */}
        <div className="cards">
          <div className="stat-card" style={{ borderLeft: "5px solid #2ecc71" }}>
            <h4>Next Donation Date</h4>
            <h2>--</h2>
          </div>
          <div className="stat-card" style={{ borderLeft: "5px solid #e67e22" }}>
            <h4>Total Donations</h4>
            <h2>0</h2>
          </div>
        </div>

        {/* Donation Chart */}
        <div style={{ marginTop: "40px", height: "300px", background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>
          <h3>Donation History</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={donationData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="donations" stroke="#e74c3c" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="blood-grid" style={{ marginTop: "30px" }}>
          <div className="blood-card">
            <h3>Last Donation</h3>
            <p>10 Feb 2026</p>
          </div>
          <div className="blood-card">
            <h3>Blood Tips Read</h3>
            <p>5 Articles</p>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: "30px", maxWidth: "500px" }}>
          <input name="name" placeholder="Full Name" value={donorData.name} onChange={handleChange} required />
          <input name="age" placeholder="Age" type="number" value={donorData.age} onChange={handleChange} required />
          <input name="bloodGroup" placeholder="Blood Group" value={donorData.bloodGroup} onChange={handleChange} required />
          <input name="contact" placeholder="Contact Number" value={donorData.contact} onChange={handleChange} required />
          <button className="button" type="submit">Register</button>
        </form>
      </div>

      
    </div>
  );
}