import React, { useState } from "react";
import Sidebar from "../components/sidebar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CompleteInfo = () => {
  const [query, setQuery] = useState("");
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setMedicine(null);
    fetch(`${API_URL}/api/medicines/search?name=${encodeURIComponent(query.trim())}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setMedicine(data);
      })
      .catch(() => setMedicine(null))
      .finally(() => setLoading(false));
  };

  return (
    <div className="shop-layout">
      <Sidebar />
      <div className="shop-container" style={{ maxWidth: "700px" }}>
        <h2>Medicine Information</h2>
        <p>Search for uses, side effects, dosage, and more.</p>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
          <input
            type="text"
            placeholder="Enter medicine name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: "8px 12px" }}
          />
          <button type="submit" disabled={loading}>{loading ? "Searching..." : "Search"}</button>
        </form>
        {medicine && (
          <div className="medicine-info-card" style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "8px" }}>
            <h3>{medicine.med_name}</h3>
            <p><strong>Description:</strong> {medicine.med_desc || "—"}</p>
            <p><strong>Usage:</strong> {medicine.usage || "—"}</p>
            <p><strong>Dosage:</strong> {medicine.dosage || "—"}</p>
            <p><strong>Side effects:</strong> {medicine.side_effects || "—"}</p>
            <p><strong>Price:</strong> ₹{medicine.med_price ?? "—"} | <strong>In stock:</strong> {medicine.med_quantity ?? "—"}</p>
          </div>
        )}
        {!loading && query && medicine === null && (
          <p>No medicine found. Try another name or check the Shop.</p>
        )}
      </div>
    </div>
  );
};

export default CompleteInfo;
