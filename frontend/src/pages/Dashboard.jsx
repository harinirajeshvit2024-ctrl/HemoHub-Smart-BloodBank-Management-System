import { useNavigate } from "react-router-dom";
import { bloodInventory, dashboardStats } from "../data/bloodData";
import StatCard from "../components/StatCard";
import BloodGroupCard from "../components/BloodGroupCard";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => navigate("/");

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>HemoHub Admin</h2>
        <ul className="menu">
          <li>Dashboard Overview</li>
          <li>Blood Inventory</li>
          <li>Registered Donors</li>
          <li>Pending Requests</li>
        </ul>
        <button className="button" onClick={() => navigate("/admin")}>Home</button>
        <button className="button" onClick={handleLogout}>Logout</button>
      </div>

      <div className="main" style={{ padding: "30px" }}>
        <h1 style={{ color: "#8b0000", marginBottom: "20px" }}>Admin Dashboard</h1>
        <div className="cards">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.id} title={stat.title} value={stat.value} />
          ))}
        </div>

        <div className="blood-grid" style={{ marginTop: "30px" }}>
          {bloodInventory.map((b) => (
            <BloodGroupCard key={b.group} group={b.group} units={b.units} />
          ))}
        </div>
      </div>
    </div>
  );
}