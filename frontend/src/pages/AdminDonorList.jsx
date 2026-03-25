import { useState, useEffect } from "react";
import { apiFetch } from "../api";

export default function AdminDonorList() {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState({});

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const data = await apiFetch("/donors");
      setDonors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteDonor = async (id) => {
    if (!window.confirm("Delete this donor?")) return;
    try {
      await apiFetch(`/donors/${id}`, { method: "DELETE" });
      setDonors(donors.filter(d => d._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const recordDonation = async (donor) => {
    if (!window.confirm(
      `Record actual donation for ${donor.name} (${donor.bloodGroup})?\n\nThis will:\n✅ Add 1 unit of ${donor.bloodGroup} to blood stock\n✅ Update donor last donation date`
    )) return;

    setRecording(prev => ({ ...prev, [donor._id]: true }));
    try {
      await apiFetch(`/donors/${donor._id}/record-donation`, {
        method: "PATCH"
      });
      alert(`✅ Donation recorded for ${donor.name}!\n1 unit of ${donor.bloodGroup} added to stock.`);
      fetchDonors();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setRecording(prev => ({ ...prev, [donor._id]: false }));
    }
  };

  const getDaysSince = (lastDonation) => {
    if (!lastDonation) return null;
    return Math.floor(
      (new Date() - new Date(lastDonation)) / (1000 * 60 * 60 * 24)
    );
  };

  const isEligible = (lastDonation) => {
    if (!lastDonation) return true;
    return getDaysSince(lastDonation) >= 90;
  };

  const filtered = donors.filter(d =>
    d.bloodGroup.toLowerCase().includes(search.toLowerCase()) ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.city || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="page-container"><p>Loading donors...</p></div>
  );

  return (
    <div className="page-container">
      <h2 className="page-title">Registered Donors</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, blood group or city..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          marginBottom: "20px", padding: "12px",
          width: "100%", borderRadius: "8px",
          border: "1px solid #ddd", fontSize: "14px",
          boxSizing: "border-box"
        }}
      />

      {/* Summary */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "12px", marginBottom: "24px"
      }}>
        {[
          { label: "Total Donors", value: donors.length, color: "#8b0000" },
          {
            label: "Eligible Now",
            value: donors.filter(d => isEligible(d.lastDonation)).length,
            color: "#2a9d8f"
          },
          {
            label: "Not Eligible",
            value: donors.filter(d => !isEligible(d.lastDonation)).length,
            color: "#f4a261"
          }
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{
            borderLeft: `4px solid ${s.color}`,
            padding: "14px"
          }}>
            <h4 style={{ fontSize: "12px" }}>{s.label}</h4>
            <h2 style={{ color: s.color, fontSize: "22px" }}>{s.value}</h2>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>No donors found.</p>
      ) : (
        filtered.map(donor => {
          const eligible = isEligible(donor.lastDonation);
          const daysSince = getDaysSince(donor.lastDonation);
          const daysLeft = donor.lastDonation
            ? Math.max(0, 90 - daysSince)
            : 0;

          return (
            <div key={donor._id} className="request-card" style={{
              borderLeft: `4px solid ${eligible ? "#2a9d8f" : "#f4a261"}`
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", flexWrap: "wrap", gap: "12px"
              }}>
                <div className="request-info" style={{ flex: 1 }}>
                  <div>
                    <strong style={{ fontSize: "16px" }}>{donor.name}</strong>
                    {" "}
                    <span style={{
                      background: eligible ? "#d4edda" : "#fff3cd",
                      color: eligible ? "#155724" : "#856404",
                      padding: "2px 8px", borderRadius: "12px",
                      fontSize: "11px", fontWeight: "bold"
                    }}>
                      {eligible ? "✅ Eligible" : `⏳ ${daysLeft} days left`}
                    </span>
                  </div>
                  <div>
                    <strong>Blood Group:</strong>{" "}
                    <span style={{
                      color: "#8b0000",
                      fontWeight: "bold",
                      fontSize: "16px"
                    }}>
                      {donor.bloodGroup}
                    </span>
                  </div>
                  <div><strong>Age:</strong> {donor.age}</div>
                  <div><strong>City:</strong> {donor.city || "—"}</div>
                  <div><strong>Phone:</strong> {donor.phone || "—"}</div>
                  <div>
                    <strong>Last Donated:</strong>{" "}
                    {donor.lastDonation
                      ? new Date(donor.lastDonation).toLocaleDateString("en-IN")
                      : "Never donated"}
                  </div>
                  <div>
                    <strong>Registered:</strong>{" "}
                    {new Date(donor.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{
                  display: "flex", flexDirection: "column",
                  gap: "8px", alignItems: "flex-end"
                }}>
                  <button
                    onClick={() => recordDonation(donor)}
                    disabled={!eligible || recording[donor._id]}
                    style={{
                      padding: "10px 16px",
                      background: eligible ? "#2a9d8f" : "#ccc",
                      color: "white", border: "none",
                      borderRadius: "8px",
                      cursor: eligible ? "pointer" : "not-allowed",
                      fontWeight: "bold", fontSize: "13px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {recording[donor._id]
                      ? "Recording..."
                      : eligible
                      ? "🩸 Record Donation"
                      : "⏳ Not Eligible"}
                  </button>

                  <button
                    className="btn btn-reject"
                    onClick={() => deleteDonor(donor._id)}
                    style={{ fontSize: "13px" }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}