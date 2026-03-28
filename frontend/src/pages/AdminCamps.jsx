import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";

export default function AdminCamps({ darkMode, setDarkMode }) {
  const menuItems = [
  { label: "Dashboard Stats",  path: "/admin/dashboard-stats" },
  { label: "Blood Inventory",  path: "/admin/blood-inventory" },
  { label: "Donor List",       path: "/admin/donors" },
  { label: "Pending Requests", path: "/admin/requests" },
  { label: "Donor Match",      path: "/admin/donor-match" },
  { label: "Manage Camps",     path: "/admin/camps" },
  { label: "Audit Logs",       path: "/admin/audit-logs" }
];

  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    location: "",
    address: "",
    city: "",
    date: "",
    organizer: "",
    maxSlots: 50
  });

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const data = await apiFetch("/camps");
      setCamps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location || !form.city || !form.date) {
      alert("Please fill location, city and date.");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/camps", {
        method: "POST",
        body: JSON.stringify(form)
      });
      await fetchCamps();
      setForm({
        location: "", address: "", city: "",
        date: "", organizer: "", maxSlots: 50
      });
      setShowForm(false);
      alert("Camp created successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this camp?")) return;
    try {
      await apiFetch(`/camps/${id}`, { method: "DELETE" });
      setCamps(camps.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatus = (camp) => {
    const now = new Date();
    const campDate = new Date(camp.date);
    if (campDate < now) return { label: "Completed", color: "#aaa" };
    const diff = Math.ceil((campDate - now) / (1000 * 60 * 60 * 24));
    if (diff <= 3) return { label: `In ${diff} day(s)`, color: "#e63946" };
    return { label: `In ${diff} days`, color: "#2a9d8f" };
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        role="Admin"
        menuItems={menuItems}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="main" style={{ padding: "30px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "24px",
          flexWrap: "wrap", gap: "12px"
        }}>
          <div>
            <h1 style={{ color: "#8b0000", margin: 0 }}>🏕️ Manage Camps</h1>
            <p style={{ color: "#666", margin: "4px 0 0", fontSize: "14px" }}>
              Create and manage blood donation camps
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "12px 24px",
              background: showForm ? "#666" : "#8b0000",
              color: "white", border: "none",
              borderRadius: "8px", cursor: "pointer",
              fontWeight: "bold", fontSize: "14px"
            }}
          >
            {showForm ? "✕ Cancel" : "+ Add New Camp"}
          </button>
        </div>

        {/* Add Camp Form */}
        {showForm && (
          <div style={{
            background: "white", borderRadius: "12px",
            padding: "24px", marginBottom: "24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            borderTop: "4px solid #8b0000"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#8b0000" }}>
              New Donation Camp
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px"
              }}>
                <div>
                  <label style={{
                    display: "block", marginBottom: "6px",
                    fontSize: "13px", fontWeight: "bold", color: "#555"
                  }}>
                    Camp Name / Location *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vijaya Health Center"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    required
                    style={{
                      width: "100%", padding: "12px",
                      borderRadius: "8px", border: "1px solid #ddd",
                      fontSize: "14px", boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: "block", marginBottom: "6px",
                    fontSize: "13px", fontWeight: "bold", color: "#555"
                  }}>
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chennai"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    required
                    style={{
                      width: "100%", padding: "12px",
                      borderRadius: "8px", border: "1px solid #ddd",
                      fontSize: "14px", boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: "block", marginBottom: "6px",
                    fontSize: "13px", fontWeight: "bold", color: "#555"
                  }}>
                    Full Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Main Street, Vadapalani"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    style={{
                      width: "100%", padding: "12px",
                      borderRadius: "8px", border: "1px solid #ddd",
                      fontSize: "14px", boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: "block", marginBottom: "6px",
                    fontSize: "13px", fontWeight: "bold", color: "#555"
                  }}>
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    required
                    style={{
                      width: "100%", padding: "12px",
                      borderRadius: "8px", border: "1px solid #ddd",
                      fontSize: "14px", boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: "block", marginBottom: "6px",
                    fontSize: "13px", fontWeight: "bold", color: "#555"
                  }}>
                    Organizer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HemoHub Team"
                    value={form.organizer}
                    onChange={e => setForm({ ...form, organizer: e.target.value })}
                    style={{
                      width: "100%", padding: "12px",
                      borderRadius: "8px", border: "1px solid #ddd",
                      fontSize: "14px", boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: "block", marginBottom: "6px",
                    fontSize: "13px", fontWeight: "bold", color: "#555"
                  }}>
                    Max Slots
                  </label>
                  <input
                    type="number"
                    value={form.maxSlots}
                    onChange={e => setForm({ ...form, maxSlots: Number(e.target.value) })}
                    style={{
                      width: "100%", padding: "12px",
                      borderRadius: "8px", border: "1px solid #ddd",
                      fontSize: "14px", boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: "20px",
                  width: "100%", padding: "14px",
                  background: submitting ? "#ccc" : "#8b0000",
                  color: "white", border: "none",
                  borderRadius: "8px", cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "bold", fontSize: "15px"
                }}
              >
                {submitting ? "Creating..." : "Create Camp"}
              </button>
            </form>
          </div>
        )}

        {/* Camps List */}
        {loading ? (
          <p>Loading camps...</p>
        ) : camps.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px",
            background: "white", borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}>
            <p style={{ fontSize: "40px", marginBottom: "12px" }}>🏕️</p>
            <p style={{ color: "#666", fontSize: "16px" }}>
              No camps created yet.
            </p>
            <p style={{ color: "#999", fontSize: "14px" }}>
              Click "Add New Camp" to create one.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {camps.map(camp => {
              const status = getStatus(camp);
              const slotsLeft = camp.maxSlots - camp.registered.length;
              const isFull = slotsLeft <= 0;

              return (
                <div key={camp._id} style={{
                  background: "white", borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderLeft: `4px solid ${status.color}`
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", flexWrap: "wrap", gap: "12px"
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: "flex", alignItems: "center",
                        gap: "10px", marginBottom: "8px", flexWrap: "wrap"
                      }}>
                        <h3 style={{ margin: 0, color: "#8b0000" }}>
                          {camp.location}
                        </h3>
                        <span style={{
                          background: `${status.color}20`,
                          color: status.color,
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}>
                          {status.label}
                        </span>
                        {isFull && (
                          <span style={{
                            background: "#f8d7da",
                            color: "#721c24",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold"
                          }}>
                            FULL
                          </span>
                        )}
                      </div>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "8px"
                      }}>
                        <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                          📍 {camp.address || camp.city}
                        </p>
                        <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                          🏙️ {camp.city}
                        </p>
                        <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                          📅 {new Date(camp.date).toLocaleString("en-IN", {
                            year: "numeric", month: "long",
                            day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                        {camp.organizer && (
                          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                            👤 {camp.organizer}
                          </p>
                        )}
                      </div>

                      {/* Slots progress bar */}
                      <div style={{ marginTop: "12px" }}>
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          fontSize: "12px", color: "#666", marginBottom: "4px"
                        }}>
                          <span>Registrations</span>
                          <span>
                            {camp.registered.length} / {camp.maxSlots} slots
                          </span>
                        </div>
                        <div style={{
                          background: "#f0f0f0", borderRadius: "4px",
                          height: "8px", overflow: "hidden"
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${(camp.registered.length / camp.maxSlots) * 100}%`,
                            background: isFull ? "#e63946" : "#2a9d8f",
                            borderRadius: "4px",
                            transition: "width 0.5s ease"
                          }} />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(camp._id)}
                      style={{
                        padding: "8px 16px",
                        background: "#fff0f0",
                        color: "#e63946",
                        border: "1px solid #fcc",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "13px"
                      }}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}