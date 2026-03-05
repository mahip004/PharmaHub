import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { useCart } from "../context/CartContext";
import "./Checkout.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalAmount, isLoggedIn, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = () => localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [isLoggedIn, navigate, fetchCart]);

  useEffect(() => {
    if (!token()) return;
    fetch(`${API_URL}/api/addresses`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAddresses(data);
        if (data.length > 0 && !selectedAddress) {
          const defaultAddr = data.find((a) => a.isDefault) || data[0];
          setSelectedAddress(defaultAddr._id);
        }
      })
      .catch(() => setAddresses([]));
  }, [token()]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode || !newAddress.phone) {
      setError("Please fill all address fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ ...newAddress, isDefault: addresses.length === 0 }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses((prev) => [...prev, data]);
        setSelectedAddress(data._id);
        setNewAddress({ street: "", city: "", state: "", pincode: "", phone: "" });
        setError("");
      } else setError(data.message || "Failed to add address");
    } catch (_) {
      setError("Network error");
    }
    setLoading(false);
  };

  const handlePlaceOrder = async () => {
    const addr = addresses.find((a) => a._id === selectedAddress);
    if (!addr && !newAddress.street) {
      setError("Please select or add a delivery address.");
      return;
    }
    const shippingAddress = addr || newAddress;
    setLoading(true);
    setError("");
    try {
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            phone: shippingAddress.phone,
          },
          paymentMethod,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.message || "Failed to create order");
        setLoading(false);
        return;
      }

      if (paymentMethod === "card") {
        const stripeItems = (orderData.items || []).map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        }));
        const stripeRes = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({
            items: stripeItems.length ? stripeItems : items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
            orderId: orderData.orderId,
          }),
        });
        const stripeData = await stripeRes.json();
        if (stripeData.url) {
          window.location.href = stripeData.url;
          return;
        }
        if (stripeData.id) {
          try {
            const stripe = window.Stripe && window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
            if (stripe) await stripe.redirectToCheckout({ sessionId: stripeData.id });
            return;
          } catch (_) {}
        }
      }

      navigate(`/order-success?orderId=${orderData.orderId}`);
    } catch (e) {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  if (!isLoggedIn || items.length === 0) {
    if (items.length === 0 && isLoggedIn) navigate("/cart");
    return null;
  }

  return (
    <div className="shop-layout">
      <Sidebar />
      <div className="shop-container" style={{ maxWidth: "700px" }}>
        <h2>Checkout</h2>
        {error && <p className="checkout-error">{error}</p>}

        <section className="checkout-section">
          <h3>Delivery Address</h3>
          {addresses.map((a) => (
            <label key={a._id} className="address-option">
              <input
                type="radio"
                name="address"
                checked={selectedAddress === a._id}
                onChange={() => setSelectedAddress(a._id)}
              />
              <span>{a.street}, {a.city}, {a.state} - {a.pincode}, {a.phone}</span>
            </label>
          ))}
          <form onSubmit={handleAddAddress} className="new-address-form">
            <input
              placeholder="Street"
              value={newAddress.street}
              onChange={(e) => setNewAddress((p) => ({ ...p, street: e.target.value }))}
            />
            <input
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
            />
            <input
              placeholder="State"
              value={newAddress.state}
              onChange={(e) => setNewAddress((p) => ({ ...p, state: e.target.value }))}
            />
            <input
              placeholder="Pincode"
              value={newAddress.pincode}
              onChange={(e) => setNewAddress((p) => ({ ...p, pincode: e.target.value }))}
            />
            <input
              placeholder="Phone"
              value={newAddress.phone}
              onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))}
            />
            <button type="submit" disabled={loading}>Add Address</button>
          </form>
        </section>

        <section className="checkout-section">
          <h3>Payment</h3>
          <label className="address-option">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
            />
            <span>Card (Stripe)</span>
          </label>
          <label className="address-option">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "upi"}
              onChange={() => setPaymentMethod("upi")}
            />
            <span>UPI (mock)</span>
          </label>
          <label className="address-option">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            <span>Cash on Delivery</span>
          </label>
        </section>

        <div className="cart-footer">
          <strong>Total: ₹{totalAmount}</strong>
          <button
            className="cart-btn checkout-btn"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {paymentMethod === "card" ? "Pay with Card" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
