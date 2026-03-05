import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { useCart } from "../context/CartContext";
import "./shop.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Shop = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const navigate = useNavigate();
  const { addToCart, isLoggedIn } = useCart();

  useEffect(() => {
    fetch(`${API_URL}/api/medicines`)
      .then((res) => res.json())
      .then((data) => {
        setMedicines(Array.isArray(data) ? data : []);
        setFiltered(Array.isArray(data) ? data : []);
      })
      .catch(() => setFiltered([]));
  }, []);

  const handleSearch = () => {
    const result = medicines.filter((med) =>
      med.med_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (result.length === 0) {
      navigate("/requestmedicine");
    } else {
      setFiltered(result);
    }
  };

  const handleAddToCart = async (med) => {
    if (!isLoggedIn) {
      alert("Please log in to add items to cart.");
      navigate("/login");
      return;
    }
    setAddingId(med._id);
    const result = await addToCart(med._id, 1);
    setAddingId(null);
    if (result.success) {
      alert(`${med.med_name} added to cart.`);
    } else if (result.message) {
      alert(result.message);
    }
  };

  return (
    <div className="shop-layout">
      <Sidebar />
      <div className="shop-container">
        <div className="shop-header">
          <input
            type="text"
            placeholder="Search for a medicine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch} className="search-btn">
            🔍 Search
          </button>
          <button onClick={() => navigate("/cart")} className="cart-btn">
            🛒 Cart
          </button>
        </div>

        <div className="medicine-grid">
          {filtered.map((med, index) => (
            <div className="medicine-card" key={med._id || index}>
              <div>
                <div className="medicine-title">{med.med_name}</div>
                <div className="medicine-info">
                  Side effects: {med.side_effects || "—"}
                </div>
                <div className="medicine-info">
                  Available:{" "}
                  {med.med_quantity > 0 ? med.med_quantity : "Sold Out"}
                </div>
              </div>
              <div className="medicine-footer">
                <span className="price">₹{med.med_price ?? 0}</span>
                {med.med_quantity > 0 ? (
                  <button
                    className="add-btn"
                    onClick={() => handleAddToCart(med)}
                    disabled={addingId === med._id}
                  >
                    {addingId === med._id ? "Adding…" : "Add to Cart"}
                  </button>
                ) : (
                  <button
                    className="add-btn"
                    onClick={() => navigate("/requestmedicine")}
                  >
                    Request It
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
