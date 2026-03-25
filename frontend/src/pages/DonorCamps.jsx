import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";

export default function DonorCamps({ darkMode, setDarkMode }) {
  const menuItems = [
    { label: "Register Donation", path: "/donor/register" },
    { label: "Donation History", path: "/donor/history" },
    { label: "Health Tips", path: "/donor/tips" },
    { label: "Donation Camps", path: "/donor/camps" }
  ];

  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});
  const [registering, setRegistering] = useState({});

  const username = sessionStorage.getItem("username") || "donor";

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

  // Countdown timer — updates every second
  useEffect(() => {
    const tick = () => {
      const newTimeLeft = {};
      camps.forEach(camp => {
        const total = new Date(camp.date) - new Date();
        if (total <= 0) {
          newTimeLeft[camp._id] = null;
          return;
        }
        const days    = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours   = Math.floor((total / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const seconds = Math.floor((total / 1000) % 60);
        newTimeLeft[camp._id] = { days, hours, minutes, seconds };
      });
      setTimeLeft(newTimeLeft);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [camps]);

  const handleRegister = async (campId) => {
    setRegistering(prev => ({ ...prev, [campId]: true }));
    try {
      await apiFetch(`/camps/${campId}/register`, {
        method: "PATCH",
        body: JSON.stringify({ username })
      });
      await fetchCamps();
    } catch (err) {
      alert(err.message);
    } finally {
      setRegistering(prev => ({ ...prev, [campId]: false }));
    }
  };

  const handleUnregister = async (campId) => {
    setRegistering(prev => ({ ...prev, [campId]: true }));
    try {
      await apiFetch(`/camps/${campId}/unregister`, {
        method: "PATCH",
        body: JSON.stringify({ username })
      });
      await fetchCamps();
    } catch (err) {
      alert(err.message);
    } finally {
      setRegistering(prev => ({ ...prev, [campId]: false }));
    }
  };

  const upcomingCamps = camps.filter(c => new Date(c.date) > new Date());
  const pastCamps = camps.filter(c => new Date(c.date) <= new Date());

  return (
    <div className="dashboard-container">
      <Sidebar
        role="Donor"
        menuItems={menuItems}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="main" style={{ padding: "30px" }}>
        <h1 style={{ color: "#8b0000", marginBottom: "8px" }}>
          🏕️ Donation Camps
        </h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Register for upcoming blood donation camps near you
        </p>

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
              No upcoming camps right now.
            </p>
            <p style={{ color: "#999", fontSize: "14px" }}>
              Check back soon!
            </p>
          </div>
        ) : (
          <>
            {/* Upcoming camps */}
            {upcomingCamps.length > 0 && (
              <>
                <h2 style={{
                  color: "#333", fontSize: "18px",
                  marginBottom: "16px"
                }}>
                  Upcoming Camps ({upcomingCamps.length})
                </h2>
                <div style={{ display: "grid", gap: "20px", marginBottom: "40px" }}>
                  {upcomingCamps.map(camp => {
                    const isRegistered = camp.registered.includes(username);
                    const isFull = camp.registered.length >= camp.maxSlots;
                    const slotsLeft = camp.maxSlots - camp.registered.length;
                    const t = timeLeft[camp._id];

                    return (
                      <div key={camp._id} style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "24px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        borderTop: `4px solid ${isRegistered ? "#2a9d8f" : "#8b0000"}`
                      }}>
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          flexWrap: "wrap", gap: "16px"
                        }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              color: "#8b0000", margin: "0 0 8px",
                              fontSize: "18px"
                            }}>
                              {camp.location}
                            </h3>

                            <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                              📍 {camp.address || camp.city}
                            </p>
                            <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                              🏙️ {camp.city}
                            </p>
                            <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                              📅 {new Date(camp.date).toLocaleString("en-IN", {
                                year: "numeric", month: "long",
                                day: "numeric", hour: "2-digit", minute: "2-digit"
                              })}
                            </p>
                            {camp.organizer && (
                              <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                                👤 Organized by {camp.organizer}
                              </p>
                            )}

                            {/* Slots */}
                            <p style={{
                              fontSize: "13px", margin: "8px 0 4px",
                              color: isFull ? "#e63946" : "#2a9d8f",
                              fontWeight: "bold"
                            }}>
                              {isFull ? "❌ Camp Full" : `✅ ${slotsLeft} slots remaining`}
                            </p>

                            {/* Progress bar */}
                            <div style={{
                              background: "#f0f0f0", borderRadius: "4px",
                              height: "6px", width: "200px", overflow: "hidden"
                            }}>
                              <div style={{
                                height: "100%",
                                width: `${(camp.registered.length / camp.maxSlots) * 100}%`,
                                background: isFull ? "#e63946" : "#2a9d8f",
                                borderRadius: "4px"
                              }} />
                            </div>
                          </div>

                          <div style={{
                            display: "flex", flexDirection: "column",
                            alignItems: "flex-end", gap: "12px"
                          }}>
                            {/* Countdown */}
                            {t && (
                              <div style={{
                                background: "#fff5f5",
                                borderRadius: "10px",
                                padding: "12px 16px",
                                textAlign: "center"
                              }}>
                                <p style={{
                                  fontSize: "11px", color: "#8b0000",
                                  fontWeight: "bold", marginBottom: "6px"
                                }}>
                                  ⏳ STARTS IN
                                </p>
                                <div style={{
                                  display: "flex", gap: "8px",
                                  alignItems: "center"
                                }}>
                                  {[
                                    { val: t.days, label: "d" },
                                    { val: t.hours, label: "h" },
                                    { val: t.minutes, label: "m" },
                                    { val: t.seconds, label: "s" }
                                  ].map(({ val, label }) => (
                                    <div key={label} style={{ textAlign: "center" }}>
                                      <div style={{
                                        background: "#8b0000",
                                        color: "white",
                                        borderRadius: "6px",
                                        padding: "4px 8px",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        minWidth: "32px"
                                      }}>
                                        {String(val).padStart(2, "0")}
                                      </div>
                                      <div style={{
                                        fontSize: "10px",
                                        color: "#666",
                                        marginTop: "2px"
                                      }}>
                                        {label}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Register button */}
                            {isRegistered ? (
                              <div style={{ textAlign: "center" }}>
                                <p style={{
                                  color: "#2a9d8f", fontWeight: "bold",
                                  fontSize: "14px", marginBottom: "6px"
                                }}>
                                  ✅ You're registered!
                                </p>
                                <button
                                  onClick={() => handleUnregister(camp._id)}
                                  disabled={registering[camp._id]}
                                  style={{
                                    padding: "8px 16px",
                                    background: "white",
                                    color: "#e63946",
                                    border: "1px solid #e63946",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "13px"
                                  }}
                                >
                                  Cancel Registration
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRegister(camp._id)}
                                disabled={isFull || registering[camp._id]}
                                style={{
                                  padding: "12px 24px",
                                  background: isFull ? "#ccc" : "#8b0000",
                                  color: "white", border: "none",
                                  borderRadius: "8px",
                                  cursor: isFull ? "not-allowed" : "pointer",
                                  fontWeight: "bold", fontSize: "14px"
                                }}
                              >
                                {registering[camp._id]
                                  ? "Registering..."
                                  : isFull
                                  ? "Camp Full"
                                  : "Register for Camp"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Past camps */}
            {pastCamps.length > 0 && (
              <>
                <h2 style={{
                  color: "#999", fontSize: "16px",
                  marginBottom: "16px"
                }}>
                  Past Camps
                </h2>
                <div style={{ display: "grid", gap: "12px" }}>
                  {pastCamps.map(camp => (
                    <div key={camp._id} style={{
                      background: "#f9f9f9",
                      borderRadius: "12px", padding: "20px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      opacity: 0.7
                    }}>
                      <h3 style={{ color: "#999", margin: "0 0 6px" }}>
                        {camp.location}
                      </h3>
                      <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>
                        📅 {new Date(camp.date).toLocaleDateString("en-IN", {
                          year: "numeric", month: "long", day: "numeric"
                        })} · {camp.city} · {camp.registered.length} attended
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}