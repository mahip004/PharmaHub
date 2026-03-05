import React, { useState } from "react";

const MedicineCard = ({ medicine }) => {
  const [quantity, setQuantity] = useState(1);
  const handleAddToCart = () => {
    alert(`${quantity} ${medicine.med_name}(s) added to cart`);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md text-center">
      <img
        src="../assets/image.png"
        alt={medicine.med_name}
        className="w-full h-40 object-cover mb-4 rounded"
      />
      {/* If you're storing image in DB later, use: src={medicine.image_url} */}
      <h2 className="text-lg font-bold">{medicine.med_name}</h2>
      <p className="text-sm text-gray-700 mb-1">{medicine.side_effects}</p>
      <p className="text-sm mb-1">Available: {medicine.med_desc}</p>
      <p className="text-sm font-semibold mb-2">Price: ₹{medicine.med_price}</p>

      {medicine.med_desc === "0" ? (
        <>
          <div className="text-red-500 font-bold mb-2">Sold Out</div>
          <button
            className="bg-yellow-500 text-white px-4 py-1 rounded"
            onClick={() => (window.location.href = "/requestmedicine")}
          >
            Request It
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="border p-1 w-20 text-center rounded"
          />
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicineCard;
