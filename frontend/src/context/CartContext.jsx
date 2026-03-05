import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const fetchCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        setItems([]);
      }
    } catch (_) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (medicineId, quantity = 1) => {
      const token = getToken();
      if (!token) return { success: false, message: "Please login to add to cart" };
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ medicineId, quantity }),
        });
        const data = await res.json();
        if (res.ok) {
          setItems(data.items || []);
          return { success: true };
        }
        return { success: false, message: data.message || "Failed to add" };
      } catch (e) {
        return { success: false, message: "Network error" };
      }
    },
    []
  );

  const updateQuantity = useCallback(
    async (medicineId, quantity) => {
      const token = getToken();
      if (!token) return { success: false };
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ medicineId, quantity }),
        });
        const data = await res.json();
        if (res.ok) setItems(data.items || []);
        return { success: res.ok };
      } catch (_) {
        return { success: false };
      }
    },
    []
  );

  const removeFromCart = useCallback(
    async (medicineId) => {
      return updateQuantity(medicineId, 0);
    },
    [updateQuantity]
  );

  const addFromPrescription = useCallback(
    async (medicines) => {
      const token = getToken();
      if (!token) return { success: false, message: "Please login" };
      try {
        const res = await fetch(`${API_URL}/api/cart/add-from-prescription`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ medicines }),
        });
        const data = await res.json();
        if (res.ok) {
          setItems(data.items || []);
          return { success: true };
        }
        return { success: false, message: data.message };
      } catch (_) {
        return { success: false, message: "Network error" };
      }
    },
    []
  );

  const totalAmount = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        totalAmount,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        addFromPrescription,
        isLoggedIn: !!getToken(),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
