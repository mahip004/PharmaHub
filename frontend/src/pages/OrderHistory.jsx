import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="shop-layout">
        <Sidebar />
        <div className="shop-container">
          <p>Please log in to view order history.</p>
          <button onClick={() => navigate("/login")}>Log In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-layout">
      <Sidebar />
      <div className="shop-container">
        <h2>Order History</h2>
        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <ul className="order-history-list">
            {orders.map((o) => (
              <li key={o._id} className="order-history-item">
                <div>
                  <strong>Order #{String(o._id).slice(-8)}</strong> — ₹{o.totalAmount} — {o.status}
                </div>
                <div>
                  {o.items?.length > 0 && (
                    <span>{o.items.map((i) => i.name).join(", ")}</span>
                  )}
                </div>
                <button type="button" onClick={() => navigate("/order-success?orderId=" + o._id)}>View</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
