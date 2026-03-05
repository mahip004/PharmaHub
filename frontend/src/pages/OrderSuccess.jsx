import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/sidebar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        if (data && data.status === "pending" && sessionId) {
          fetch(`${API_URL}/api/orders/${orderId}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "paid" }),
          }).catch(() => {});
        }
      })
      .catch(() => setOrder(null));
  }, [orderId, sessionId]);

  return (
    <div className="shop-layout">
      <Sidebar />
      <div className="shop-container" style={{ maxWidth: "600px", textAlign: "center" }}>
        <h2>Order Confirmed</h2>
        {(sessionId || orderId) && (
          <p style={{ color: "var(--text-light)", margin: "1rem 0" }}>
            Thank you for your order. {orderId && `Order ID: ${orderId}`}
          </p>
        )}
        {order && (
          <div className="order-summary" style={{ textAlign: "left", margin: "1.5rem 0", padding: "1rem", background: "#f8fafc", borderRadius: "8px" }}>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
            <ul>
              {order.items?.map((item, i) => (
                <li key={i}>{item.name} × {item.quantity} — ₹{item.price * item.quantity}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          className="cart-btn checkout-btn"
          onClick={() => navigate("/shop")}
          style={{ marginRight: "0.5rem" }}
        >
          Continue Shopping
        </button>
        <button
          className="cart-btn"
          onClick={() => navigate("/profilepage")}
          style={{ background: "#64748b" }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
