import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { apiFetch } from "../api";
import BloodForecast from "../components/BloodForecast";
import EmergencyPredictor from "../components/EmergencyPredictor";

export default function AdminDashboardStats() {
  const [stockData, setStockData] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [allDonors, setAllDonors] = useState([]);
  const [stats, setStats] = useState({
    totalUnits: 0,
    totalDonors: 0,
    pendingRequests: 0,
    criticalLow: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [stock, donors, requests] = await Promise.all([
          apiFetch("/stock"),
          apiFetch("/donors"),
          apiFetch("/requests")
        ]);

        const stockArray = stock.map(s => ({
          bloodGroup: s.bloodGroup,
          units: s.units
        }));
        setStockData(stockArray);
        setAllDonors(donors);
        setAllRequests(requests);

        const approved = requests.filter(r => r.status === "Approved").length;
        const pending = requests.filter(r => r.status === "Pending").length;
        const rejected = requests.filter(r => r.status === "Rejected").length;
        setRequestData([
          { name: "Approved", value: approved },
          { name: "Pending", value: pending },
          { name: "Rejected", value: rejected }
        ]);

        const totalUnits = stock.reduce((sum, s) => sum + s.units, 0);
        const criticalLow = stock.filter(s => s.units < 10).length;
        setStats({
          totalUnits,
          totalDonors: donors.length,
          pendingRequests: pending,
          criticalLow
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const COLORS = ["#4CAF50", "#FF9800", "#F44336"];

  if (loading) return (
    <div className="page-container">
      <p>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="page-container">
      <h2 className="page-title">Dashboard Statistics</h2>

      {/* Stats Cards */}
      <div className="cards" style={{ marginBottom: "30px" }}>
        {[
          { title: "Total Units Available", value: stats.totalUnits, color: "#8b0000" },
          { title: "Registered Donors", value: stats.totalDonors, color: "#2a9d8f" },
          { title: "Pending Requests", value: stats.pendingRequests, color: "#f4a261" },
          { title: "Critical Low Stock", value: stats.criticalLow, color: "#e63946" }
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{
            borderLeft: `5px solid ${s.color}`
          }}>
            <h4>{s.title}</h4>
            <h2 style={{ color: s.color }}>{s.value}</h2>
          </div>
        ))}
      </div>

      {/* Blood Stock Bar Chart */}
      <div style={{
        background: "white", padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        marginBottom: "24px"
      }}>
        <h3 style={{ marginBottom: "20px", color: "#8b0000" }}>
          🩸 Blood Stock Overview
        </h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bloodGroup" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="units" fill="#b71c1c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Request Status Pie Chart */}
      <div style={{
        background: "white", padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        marginBottom: "24px"
      }}>
        <h3 style={{ marginBottom: "20px", color: "#8b0000" }}>
          📋 Request Status Distribution
        </h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={requestData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {requestData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Blood Demand Forecast */}
      <BloodForecast
        stockData={stockData}
        requestData={allRequests}
      />

      {/* AI Emergency Predictor */}
      <EmergencyPredictor
        stockData={stockData}
        requestData={allRequests}
        donorData={allDonors}
      />
    </div>
  );
}