
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatBox.css";
import ReactMarkdown from "react-markdown";
import { useCart } from "../context/CartContext";

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || "http://localhost:8000";

const MedicineCard = ({ msg, handleAddToCart, navigate }) => {
  const [qty, setQty] = useState(1);

  return (
    <div className="medicine-card-inner">
      <ReactMarkdown>{msg.text}</ReactMarkdown>
      <div className="medicine-actions">
        <label className="qty-label">
          Qty:
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
            className="qty-input"
          />
        </label>
        <button
          className="add-cart-btn"
          onClick={() => handleAddToCart(msg.medicineName, qty)}
        >
          Add to Cart
        </button>
        <button
          className="go-cart-btn"
          onClick={() => navigate("/cart")}
        >
          Go to Cart
        </button>
      </div>
    </div>
  );
};

const ChatBox = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addFromPrescription, isLoggedIn } = useCart();

  const handleAddToCart = async (medicineName, quantity) => {
    if (!isLoggedIn) {
      alert("Please login first to add medicines to your cart.");
      return;
    }
    const res = await addFromPrescription([{ name: medicineName, quantity }]);
    if (res.success) {
      const added = res.added || [];
      const notFound = res.notFound || [];
      if (added.length > 0) {
        alert(`✅ Added to cart: ${added.join(", ")}${notFound.length ? `\n⚠️ Not in inventory: ${notFound.join(", ")}` : ""}`);
      } else {
        alert(`⚠️ "${medicineName}" was not found in our inventory. Please search for it manually.`);
      }
    } else {
      alert(`Could not add: ${res.message || "Item not found in inventory."}`);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${FASTAPI_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input }),
      });
      const data = await res.json();
      const botMessage = { sender: "bot", text: data.reply || "No response." };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error:", err);
      setError("Could not reach the assistant. Check if the AI service is running.");
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I couldn't connect. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const sendImage = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("file", image);
    setLoading(true);
    setError("");
    try {
      const res1 = await fetch(`${FASTAPI_URL}/extract_vision/`, {
        method: "POST",
        body: formData,
      });

      if (!res1.ok) {
        throw new Error(`Vision AI is currently busy (Error ${res1.status}). Please try again in a few seconds.`);
      }

      const { medicines } = await res1.json();

      if (medicines && medicines.length > 0) {
        const validatedMessage = { sender: "bot", text: "Here are the medicines I found:" };
        setMessages((prev) => [...prev, validatedMessage]);

        // Fetch their descriptions
        const res3 = await fetch(`${FASTAPI_URL}/medicine_info/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicines: medicines.map(m => m.name) }),
        });

        let medicine_info = {};
        if (res3.ok) {
          const data = await res3.json();
          medicine_info = data.medicine_info || {};
        } else {
          console.warn("Could not fetch medicine descriptions due to backend rate limits.");
        }

        for (const m of medicines) {
          const desc = medicine_info[m.name] || "Use as directed.";
          const dosageTxt = m.dosage ? `\n\n**Dosage:** ${m.dosage}` : "";
          const freqTxt = m.frequency ? `\n\n**Frequency:** ${m.frequency}` : "";
          const msgText = `💊 **${m.name}**: ${desc}${dosageTxt}${freqTxt}`;

          const infoMessage = {
            sender: "system",
            text: msgText,
            medicineName: m.name
          };
          setMessages((prev) => [...prev, infoMessage]);
        }
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: "I couldn't identify any specific medicines in the image." }]);
      }


    } catch (err) {
      console.error("Image upload error:", err);
      setError(`Could not process image: ${err.message || "Is the OCR service running?"}`);
    } finally {
      setLoading(false);
    }
    setImage(null);
  };

  return (
    <div className="chat-cont">
      <h1>PharmaHub Assistant</h1>
      <div className="chattingbox">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === "user" ? "user" : "bot"} ${msg.medicineName ? "medicine-card" : ""}`}>
            {!msg.medicineName ? (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            ) : (
              <MedicineCard msg={msg} handleAddToCart={handleAddToCart} navigate={navigate} />
            )}
          </div>
        ))}
      </div>
      {error && <p className="chat-error" style={{ color: "#dc2626", fontSize: "14px", margin: "8px 0" }}>{error}</p>}
      <div className="inputbox">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>{loading ? "..." : "Send"}</button>
      </div>
      <div className="uploadingbox">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button onClick={sendImage} disabled={!image}>
          Upload Prescription
        </button>

      </div>
    </div>
  );
};

export default ChatBox;
