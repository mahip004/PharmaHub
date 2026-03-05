import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./uploadprescription.css";
import { FiUploadCloud } from "react-icons/fi";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const UploadPrescription = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { addFromPrescription, isLoggedIn } = useCart();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setResult(null);
    setError("");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setFile(event.dataTransfer.files[0]);
    setResult(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!file && !text.trim()) {
      setError("Please upload a prescription image or enter text.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to upload prescriptions.");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      if (file) formData.append("prescription", file);
      if (text.trim()) formData.append("description", text.trim());

      const res = await axios.post(`${API_URL}/api/upload-prescription`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process prescription.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToCart = async () => {
    if (!result?.medicines?.length || !isLoggedIn) {
      alert("Please log in to add medicines to cart.");
      navigate("/login");
      return;
    }
    const medicines = result.medicines
      .filter((m) => m.matchedId)
      .map((m) => ({ medicineId: m.matchedId, quantity: 1 }));
    if (medicines.length === 0) {
      const byName = result.medicines.map((m) => ({ name: m.name, quantity: 1 }));
      const r = await addFromPrescription(byName);
      if (r.success) {
        alert("Added matching medicines to cart.");
        navigate("/cart");
      } else alert(r.message || "Could not add to cart.");
      return;
    }
    const r = await addFromPrescription(medicines);
    if (r.success) {
      alert("Added to cart.");
      navigate("/cart");
    } else alert(r.message || "Could not add to cart.");
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">Upload Your Prescription</h2>
      <div className="upload-card">
        <div
          className="upload-box"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <FiUploadCloud className="upload-icon" />
          <p className="upload-text">Drag & drop or click to upload</p>
          <small className="upload-format">Supports JPG, PNG, HEIC</small>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFileChange(e)}
          />
          {file && <p className="file-name">{file.name}</p>}
        </div>

        <div className="text-input-container">
          <textarea
            className="text-input"
            placeholder="Or paste prescription text / additional details"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="upload-error">{error}</p>}

      <button className="analyze-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing…" : "Upload & Extract Medicines"}
      </button>

      {result && (
        <div className="upload-result">
          <h3>Detected medicines</h3>
          <ul className="medicine-list">
            {result.medicines.map((m, i) => (
              <li key={i}>
                <strong>{m.name}</strong>
                {m.dosage && ` — ${m.dosage}`}
                {m.duration && <span className="duration-tag"> ({m.duration})</span>}
                <div className="status-badge">
                  {m.matchedId ? (
                    <span className="available">Available</span>
                  ) : (
                    <span className="not-available">Not Available</span>
                  )}
                </div>
                {m.matchedName && (
                  <span className="matched-details"> (₹{m.price})</span>
                )}
                {m.matchedId && (
                  <button
                    className="individual-add-btn"
                    onClick={() => {
                      addFromPrescription([{ medicineId: m.matchedId, quantity: 1 }])
                        .then(r => r.success ? alert("Added to cart") : alert("Failed"));
                    }}
                  >
                    Add to Cart
                  </button>
                )}
                {!m.matchedId && (
                  <button
                    className="request-link-btn"
                    onClick={() => navigate("/requestmedicine")}
                  >
                    Request this medicine
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button className="analyze-btn add-all-btn" onClick={handleAddAllToCart}>
            Add all to cart
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPrescription;
