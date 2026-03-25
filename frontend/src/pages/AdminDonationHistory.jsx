import { useState, useEffect } from "react";

export default function AdminDonationHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedHistory =
      JSON.parse(localStorage.getItem("donationHistory")) || [];
    setHistory(storedHistory);
  }, []);

  return (
    <div className="page-container">
      <h2 className="page-title">Donation History</h2>

      {history.length === 0 ? (
        <p>No donation history available.</p>
      ) : (
        history.map((record) => (
          <div key={record.id} className="request-card">
            <p><strong>Name:</strong> {record.name}</p>
            <p><strong>Blood Group:</strong> {record.bloodGroup}</p>
            <p><strong>Date:</strong> {record.date}</p>
          </div>
        ))
      )}
    </div>
  );
}