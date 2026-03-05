import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import "./AddMedicineForm.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    med_name: "",
    med_desc: "",
    dosage: "",
    usage: "",
    side_effects: "",
    med_price: "",
    med_quantity: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMedicines = () => {
    fetch(`${API_URL}/api/medicines`)
      .then((res) => res.json())
      .then((data) => setMedicines(Array.isArray(data) ? data : []))
      .catch(() => setMedicines([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchMedicines();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      med_name: "",
      med_desc: "",
      dosage: "",
      usage: "",
      side_effects: "",
      med_price: "",
      med_quantity: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const url = editingId ? `${API_URL}/api/medicines/${editingId}` : `${API_URL}/api/medicines`;
    const method = editingId ? "PUT" : "POST";
    const body = editingId
      ? { ...formData, med_price: Number(formData.med_price), med_quantity: Number(formData.med_quantity) }
      : {
          med_name: formData.med_name,
          med_desc: formData.med_desc,
          dosage: formData.dosage,
          usage: formData.usage,
          side_effects: formData.side_effects,
          med_price: Number(formData.med_price) || 0,
          med_quantity: Number(formData.med_quantity) || 0,
        };
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.ok) {
          alert(editingId ? "Medicine updated." : "Medicine added.");
          resetForm();
          fetchMedicines();
        } else return res.json().then((d) => alert(d.message || "Failed"));
      })
      .catch(() => alert("Network error"))
      .finally(() => setSubmitting(false));
  };

  const handleEdit = (med) => {
    setFormData({
      med_name: med.med_name || "",
      med_desc: med.med_desc || "",
      dosage: med.dosage || "",
      usage: med.usage || "",
      side_effects: med.side_effects || "",
      med_price: med.med_price ?? "",
      med_quantity: med.med_quantity ?? "",
    });
    setEditingId(med._id);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this medicine?")) return;
    fetch(`${API_URL}/api/medicines/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) {
          alert("Deleted.");
          fetchMedicines();
          resetForm();
        } else alert("Failed to delete");
      })
      .catch(() => alert("Network error"));
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="medicine-form-container">
        <h2>{editingId ? "Edit Medicine" : "Add Medicine to Inventory"}</h2>
        <form onSubmit={handleSubmit} className="medicine-form">
          <label>Medicine Name</label>
          <input type="text" name="med_name" value={formData.med_name} onChange={handleChange} required />
          <label>Description</label>
          <input type="text" name="med_desc" value={formData.med_desc} onChange={handleChange} />
          <label>Dosage (e.g. 500mg)</label>
          <input type="text" name="dosage" value={formData.dosage} onChange={handleChange} />
          <label>Usage</label>
          <input type="text" name="usage" value={formData.usage} onChange={handleChange} />
          <label>Side Effects</label>
          <input type="text" name="side_effects" value={formData.side_effects} onChange={handleChange} />
          <label>Price (₹)</label>
          <input type="number" name="med_price" value={formData.med_price} onChange={handleChange} required />
          <label>Quantity</label>
          <input type="number" name="med_quantity" value={formData.med_quantity} onChange={handleChange} required />
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update" : "Add Medicine"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>

        <h3>Current Inventory ({medicines.length})</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="inventory-list">
            {medicines.map((med) => (
              <div key={med._id} className="inventory-item">
                <div>
                  <strong>{med.med_name}</strong> — ₹{med.med_price} — Qty: {med.med_quantity}
                </div>
                <div>
                  <button type="button" onClick={() => handleEdit(med)}>Edit</button>
                  <button type="button" onClick={() => handleDelete(med._id)} className="danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
