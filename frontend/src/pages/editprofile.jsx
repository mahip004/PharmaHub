import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import "./EditProfile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((user) => {
        if (user) {
          setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phone: user.phone || "",
            gender: user.gender || "",
            email: user.email || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [userId, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token || !userId) return;
    setSaving(true);
    fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (res.ok) {
          alert("Profile updated.");
          navigate("/profilepage");
        } else return res.json().then((d) => { alert(d.message || "Update failed"); });
      })
      .catch(() => alert("Network error"))
      .finally(() => setSaving(false));
  };

  if (!token) {
    return (
      <div className="edit-profile-page">
        <Sidebar />
        <div className="edit-profile-container"><p>Please log in.</p><button onClick={() => navigate("/login")}>Log In</button></div>
      </div>
    );
  }

  if (loading) return <div className="edit-profile-page"><Sidebar /><div className="edit-profile-container"><p>Loading...</p></div></div>;

  return (
    <div className="edit-profile-page">
      <Sidebar />
      <div className="edit-profile-container">
        <div className="edit-profile-card">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit} className="edit-form">
            <label>First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
            <label>Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
            <label>Phone Number</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
            <label>Email</label>
            <input type="email" value={formData.email || localStorage.getItem("email") || ""} disabled />
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
