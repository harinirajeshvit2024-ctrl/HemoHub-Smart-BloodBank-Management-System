import { useState, useEffect } from "react";
import { apiFetch } from "../api";

export default function AdminBloodInventory() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGroup, setNewGroup] = useState("");
  const [newUnits, setNewUnits] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    apiFetch("/stock")
      .then(data => { setStock(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const handleAdd = async () => {
    if (!newGroup || !newUnits) return alert("Fill all fields");
    setAdding(true);
    try {
      await apiFetch("/stock", {
        method: "POST",
        body: JSON.stringify({ bloodGroup: newGroup, units: Number(newUnits) })
      });
      const updated = await apiFetch("/stock");
      setStock(updated);
      setNewGroup("");
      setNewUnits("");
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const getColor = (units) => {
    if (units < 10) return "#e63946";
    if (units < 20) return "#f4a261";
    return "#2a9d8f";
  };

  if (loading) return (
    <div className="page-container"><p>Loading inventory...</p></div>
  );

  return (
    <div className="page-container">
      <h2 className="page-title">Blood Stock Inventory</h2>

      {/* Add stock */}
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        marginBottom: "30px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <select
          value={newGroup}
          onChange={e => setNewGroup(e.target.value)}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" }}
        >
          <option value="">Select Blood Group</option>
          {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Units to add"
          value={newUnits}
          onChange={e => setNewUnits(e.target.value)}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", width: "140px" }}
        />
        <button
          onClick={handleAdd}
          disabled={adding}
          style={{
            padding: "10px 20px",
            background: "#8b0000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {adding ? "Adding..." : "Add Stock"}
        </button>
      </div>

      {/* Stock grid */}
      <div className="blood-grid">
        {stock.map(item => (
          <div key={item._id} className="blood-card" style={{
            borderTop: `4px solid ${getColor(item.units)}`
          }}>
            <h3 style={{ color: "#8b0000", fontSize: "24px" }}>{item.bloodGroup}</h3>
            <p style={{ fontSize: "20px", fontWeight: "bold", margin: "8px 0" }}>
              {item.units} units
            </p>
            <div style={{
              background: "#f0f0f0",
              borderRadius: "4px",
              height: "8px",
              overflow: "hidden",
              marginTop: "10px"
            }}>
              <div style={{
                height: "100%",
                width: `${Math.min((item.units / 50) * 100, 100)}%`,
                background: getColor(item.units),
                borderRadius: "4px",
                transition: "width 1s ease"
              }} />
            </div>
            <p style={{
              fontSize: "12px",
              color: getColor(item.units),
              fontWeight: "bold",
              marginTop: "6px"
            }}>
              {item.units < 10 ? "⚠ Critical Low" : item.units < 20 ? "⚡ Medium" : "✅ Good"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}