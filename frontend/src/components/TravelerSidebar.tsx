import React from "react";
import { FaUserCircle, FaHistory, FaHeart, FaUsers } from "react-icons/fa";
import "./TravelerSidebar.css"; 

interface TravelerSidebarProps {
  activeMenu: "profil" | "history" | "wishlist" | "grup";
}

const TravelerSidebar: React.FC<TravelerSidebarProps> = ({ activeMenu }) => {
  return (
    <aside className="profile-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-subtitle">WORKSPACE</span>
        <h2 className="sidebar-title">Traveler Area</h2>
      </div>

      <nav className="sidebar-nav">
        <a href="/profile" className={`nav-item ${activeMenu === "profil" ? "active" : ""}`}>
          <FaUserCircle className="nav-icon" /> Profil Saya
        </a>
        <a href="/history" className={`nav-item ${activeMenu === "history" ? "active" : ""}`}>
          <FaHistory className="nav-icon" /> Riwayat Booking
        </a>
        <a href="/wishlist" className={`nav-item ${activeMenu === "wishlist" ? "active" : ""}`}>
          <FaHeart className="nav-icon" /> Wishlist Saya
        </a>
        <a href="/grup" className={`nav-item ${activeMenu === "grup" ? "active" : ""}`}>
          <FaUsers className="nav-icon" /> Grup Perjalanan Saya
        </a>
      </nav>
    </aside>
  );
};

export default TravelerSidebar;
