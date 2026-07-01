import React from "react";
import { FaSearch, FaBell } from "react-icons/fa";
import { useTransaction } from "../context/TransactionContext"; // <-- Import Context
import "./AdminTopbar.css";

interface AdminTopbarProps {
  showSearch?: boolean;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  placeholder?: string;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ showSearch = false, searchQuery = "", setSearchQuery, placeholder = "Cari..." }) => {
  const { transactions, setIsNotifOpen } = useTransaction();
  const pendingCount = transactions.filter((t: any) => t.status === "Menunggu").length;

  return (
    <header className="admin-topbar">
      {showSearch ? (
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder={placeholder} value={searchQuery} onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)} />
        </div>
      ) : (
        <div className="topbar-left-spacer"></div>
      )}

      <div className="topbar-actions">
        <div className="topbar-icons">
          <button className="icon-btn" onClick={() => setIsNotifOpen(true)} style={{ position: 'relative' }}>
            <FaBell />
            {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
          </button>
        </div>

        <div className="topbar-divider"></div>

        <div className="admin-profile">
          <div className="admin-info">
            <span className="admin-name">Admin Pegi</span>
            <span className="admin-role">ADMIN</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;