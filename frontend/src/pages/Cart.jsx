import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { useCart } from "../context/CartContext";
import "./shop.css";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { items, loading, totalAmount, updateQuantity, removeFromCart, fetchCart, isLoggedIn } = useCart();

  useEffect(() => {
    if (isLoggedIn) fetchCart();
  }, [isLoggedIn, fetchCart]);

  if (!isLoggedIn) {
    return (
      <div className="shop-layout">
        <Sidebar />
        <div className="shop-container cart-page">
          <h2>Your Cart</h2>
          <p className="cart-login-msg">Please log in to view and manage your cart.</p>
          <button className="cart-btn" onClick={() => navigate("/login")}>
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="shop-layout">
        <Sidebar />
        <div className="shop-container cart-page">
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-layout">
      <Sidebar />
      <div className="shop-container cart-page">
        <h2>Your Cart</h2>
        {items.length === 0 ? (
          <>
            <p className="cart-empty">Your cart is empty. Add medicines from Shop or from your prescription.</p>
            <button className="cart-btn" onClick={() => navigate("/shop")}>
              Go to Shop
            </button>
          </>
        ) : (
          <>
            <div className="cart-list">
              {items.map((item) => (
                <div className="cart-item" key={item.medicineId?._id || item.medicineId}>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price} each</div>
                  <div className="cart-item-qty">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.medicineId?._id || item.medicineId, Math.max(0, (item.quantity || 1) - 1))}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.medicineId?._id || item.medicineId, (item.quantity || 1) + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-total">₹{(item.price || 0) * (item.quantity || 0)}</div>
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.medicineId?._id || item.medicineId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <strong>Total: ₹{totalAmount}</strong>
              <button className="cart-btn checkout-btn" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
