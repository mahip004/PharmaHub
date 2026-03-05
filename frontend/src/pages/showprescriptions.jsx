import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ShowPrescriptions.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ShowPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/prescriptions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPrescriptions(Array.isArray(data) ? data : []))
      .catch(() => setPrescriptions([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="show-prescriptions-container">
        <h2>Your Uploaded Prescriptions</h2>
        <p>Loading...</p>
      </div>
    );
  }

  const token = localStorage.getItem("token");
  if (!token) {
    return (
      <div className="show-prescriptions-container">
        <h2>Your Uploaded Prescriptions</h2>
        <p>Please log in to view your prescriptions.</p>
        <button className="auth-button" onClick={() => navigate("/login")}>
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="show-prescriptions-container">
      <h2>Your Uploaded Prescriptions</h2>
      <div className="prescriptions-list">
        {prescriptions.length > 0 ? (
          prescriptions.map((prescription) => (
            <div key={prescription._id} className="prescription-card">
              <div className="prescription-text-container">
                {prescription.medicines?.length > 0 && (
                  <p className="prescription-medicines">
                    <strong>Medicines:</strong>{" "}
                    {prescription.medicines.map((m) => m.name).join(", ")}
                  </p>
                )}
                <p className="prescription-text">
                  {prescription.extractedText || "No extracted text."}
                </p>
                <p className="prescription-date">
                  {formatDate(prescription.createdAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No prescriptions found. Upload one from the Upload Prescription page.</p>
        )}
      </div>
    </div>
  );
};

export default ShowPrescriptions;
