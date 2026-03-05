import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserEdit, FaUpload, FaEye, FaShoppingBag } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import "./profilepage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setUser(await res.json());
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };
    Promise.all([fetchUser(), fetchOrders()]).finally(() => setLoading(false));
  }, [userId, token]);

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "User"
    : "";

  if (!token) {
    return (
      <div className="profile-container">
        <Sidebar />
        <div className="profile-card" style={{ marginLeft: "var(--sidebar-width, 60px)" }}>
          <p>Please log in to view your profile.</p>
          <button className="edit-btn" onClick={() => navigate("/login")}>Log In</button>
        </div>
      </div>
    );
  }

  if (loading && !user) return <div className="profile-container"><Sidebar /><div className="profile-card"><p>Loading...</p></div></div>;
  if (!user) return <div className="profile-container"><Sidebar /><div className="profile-card"><p>Failed to load profile.</p></div></div>;

  return (
    <div className="profile-container">
      <Sidebar />
      <div className="profile-card">
        <div className="profile-header">
          <h2>{displayName}</h2>
          <p className="username">@{user.email?.split("@")[0] || "user"}</p>
          <button className="edit-btn" onClick={() => navigate("/editprofile")}>
            <FaUserEdit /> Edit Profile
          </button>
        </div>

        <div className="profile-info">
          <p><strong>Phone:</strong> {user.phone || "—"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Gender:</strong> {user.gender || "—"}</p>
        </div>

        <div className="profile-buttons">
          <button className="upload-btn" onClick={() => navigate("/uploadprescription")}>
            <FaUpload /> Upload Prescription
          </button>
          <button className="show-btn" onClick={() => navigate("/showprescriptions")}>
            <FaEye /> Show Prescriptions
          </button>
          <button className="show-btn" onClick={() => navigate("/cart")}>
            <FaShoppingBag /> Cart
          </button>
        </div>

        {orders.length > 0 && (
          <div className="profile-orders">
            <h3>Recent Orders</h3>
            <ul>
              {orders.map((o) => (
                <li key={o._id}>
                  Order #{o._id?.slice(-6)} — ₹{o.totalAmount} — {o.status}
                  <button type="button" className="link-btn" onClick={() => navigate("/order-success?orderId=" + o._id)}>View</button>
                </li>
              ))}
            </ul>
            <button type="button" className="link-btn" onClick={() => navigate("/orders")}>See all orders</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
