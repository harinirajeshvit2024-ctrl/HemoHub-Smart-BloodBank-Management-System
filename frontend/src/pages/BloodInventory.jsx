import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Sidebar from "../components/Sidebar";

export default function BloodInventory() {
  const menuItems = [
    { label: "Dashboard Stats", path: "/admin/dashboard-stats" },
    { label: "Blood Inventory", path: "/admin/blood-inventory" },
    { label: "Donor List", path: "/admin/donors" },
    { label: "Pending Requests", path: "/admin/requests" }
  ];

  const [bloodData, setBloodData] = useState([
    { group: "A+", units: 10 },
    { group: "B+", units: 8 },
    { group: "O+", units: 15 },
    { group: "AB+", units: 5 },
  ]);

  const [newGroup, setNewGroup] = useState("");
  const [newUnits, setNewUnits] = useState("");

  const COLORS = ["#8b0000", "#b22222", "#dc143c", "#ff4d4d", "#a52a2a"];

  const handleAdd = () => {
    if (!newGroup || !newUnits) return alert("Fill all fields");

    const existing = bloodData.find(item => item.group === newGroup);

    if (existing) {
      setBloodData(
        bloodData.map(item =>
          item.group === newGroup
            ? { ...item, units: item.units + parseInt(newUnits) }
            : item
        )
      );
    } else {
      setBloodData([...bloodData, { group: newGroup, units: parseInt(newUnits) }]);
    }

    setNewGroup("");
    setNewUnits("");
  };

  const handleDelete = (group) => {
    setBloodData(bloodData.filter(item => item.group !== group));
  };

  return (
    <div className="dashboard-container">
      <Sidebar role="Admin" menuItems={menuItems} />

      <div className="main" style={{ padding: "30px" }}>
        <h1 style={{ color: "#8b0000" }}>Blood Inventory</h1>

        {/* Add Section */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Blood Group (A+, O-, etc)"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
          />

          <input
            type="number"
            placeholder="Units"
            value={newUnits}
            onChange={(e) => setNewUnits(e.target.value)}
          />

          <button onClick={handleAdd}>Add / Update</button>
        </div>

        {/* Table */}
        <table border="1" cellPadding="10" style={{ marginBottom: "30px" }}>
          <thead>
            <tr>
              <th>Blood Group</th>
              <th>Units</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bloodData.map((item, index) => (
              <tr key={index}>
                <td>{item.group}</td>
                <td>{item.units}</td>
                <td>
                  <button
                    style={{ background: "darkred", color: "white" }}
                    onClick={() => handleDelete(item.group)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pie Chart */}
        <PieChart width={400} height={300}>
          <Pie
            data={bloodData}
            dataKey="units"
            nameKey="group"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {bloodData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}