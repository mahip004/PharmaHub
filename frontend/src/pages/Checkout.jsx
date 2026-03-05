import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { useCart } from "../context/CartContext";
import PaymentModal from "../components/PaymentModal";
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
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);

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

  // Step 1: Create the order in our backend
  const createOrder = async () => {
    const addr = addresses.find((a) => a._id === selectedAddress);
    if (!addr && !newAddress.street) {
      setError("Please select or add a delivery address.");
      return null;
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
        return null;
      }
      return orderData.orderId;
    } catch (_) {
      setError("Something went wrong.");
      setLoading(false);
      return null;
    }
  };

  const handlePlaceOrder = async () => {
    const orderId = await createOrder();
    if (!orderId) return;

    if (paymentMethod === "cod") {
      // COD: straight to success
      navigate(`/order-success?orderId=${orderId}`);
      return;
    }

    // Online: show demo payment modal
    setPendingOrderId(orderId);
    setLoading(false);
    setShowPaymentModal(true);
  };

  // Called when PaymentModal reports success
  const handlePaymentSuccess = (txnId) => {
    setShowPaymentModal(false);
    navigate(`/order-success?orderId=${pendingOrderId}&txn=${txnId}`);
  };

  if (!isLoggedIn || items.length === 0) {
    if (items.length === 0 && isLoggedIn) navigate("/cart");
    return null;
  }

  return (
    <>
      {showPaymentModal && (
        <PaymentModal
          amount={totalAmount}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

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
                <span>
                  {a.street}, {a.city}, {a.state} - {a.pincode}, {a.phone}
                </span>
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
              <button type="submit" disabled={loading}>
                Add Address
              </button>
            </form>
          </section>

          <section className="checkout-section">
            <h3>Payment Method</h3>
            <label className="address-option">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
              <span>💳 Online Payment — Card / UPI</span>
            </label>
            <label className="address-option">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <span>🚚 Cash on Delivery</span>
            </label>
          </section>

          <div className="cart-footer">
            <strong>Total: ₹{totalAmount}</strong>
            <button
              className="cart-btn checkout-btn"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : paymentMethod === "online"
                  ? `Pay ₹${totalAmount}`
                  : "Place Order (COD)"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
