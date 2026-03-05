import React, { useState } from "react";
import { Link } from "react-router-dom";
import { List } from "lucide-react";
import "./sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Start collapsed

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLinkClick = () => {
    setIsOpen(false); // Collapse sidebar after link click
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? "⏪" : "⏩"}
      </button>
      <ul className="menu-list">
        <li>
          <Link to="/home" onClick={handleLinkClick}>
            <List /> {isOpen && "Home"}
          </Link>
        </li>
        <li>
          <Link to="/profilepage" onClick={handleLinkClick}>
            <List /> {isOpen && "Profile"}
          </Link>
        </li>
        <li>
          <Link to="/timetable" onClick={handleLinkClick}>
            <List /> {isOpen && "Timetable"}
          </Link>
        </li>
        <li>
          <Link to="/appointment" onClick={handleLinkClick}>
            <List /> {isOpen && "Appointment form"}
          </Link>
        </li>
        <li>
          <Link to="/shop" onClick={handleLinkClick}>
            <List /> {isOpen && "Shop"}
          </Link>
        </li>
        <li>
          <Link to="/cart" onClick={handleLinkClick}>
            <List /> {isOpen && "Cart"}
          </Link>
        </li>
        <li>
          <Link to="/orders" onClick={handleLinkClick}>
            <List /> {isOpen && "Orders"}
          </Link>
        </li>
        <li>
          <Link to="/chatbot" onClick={handleLinkClick}>
            <List /> {isOpen && "PharmaBot"}
          </Link>
        </li>
        <li>
          <Link to="/admin_inventory" onClick={handleLinkClick}>
            <List /> {isOpen && "Admin_Inventory"}
          </Link>
        </li>
        <li>
          <Link to="/aboutus" onClick={handleLinkClick}>
            <List /> {isOpen && "About Us"}
          </Link>
        </li>
        <li>
          <Link to="/login" onClick={handleLinkClick}>
            <List /> {isOpen && "Login"}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
