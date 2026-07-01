import React from 'react';
import { 
  FaHome, FaUsers, FaHotel, FaMapMarkerAlt, FaTag, FaBus, 
  FaGlobe, FaChartLine, FaSignOutAlt, 
  FaFileInvoiceDollar // <-- Tambahkan icon ini untuk menu Pembayaran
} from 'react-icons/fa';

interface AdminSidebarProps {
  activeMenu: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeMenu }) => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <img src="/public/logo_pegi_72x72.jpeg" alt="Logo Pegi" className="sidebar-logo" />
        <p>Enterprise Admin</p>
      </div>
      <nav className="admin-nav">
        <a href="/admin" className={`admin-nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}>
          <FaHome /> Dashboard
        </a>
        <a href="/admin/users" className={`admin-nav-item ${activeMenu === 'pengguna' ? 'active' : ''}`}>
          <FaUsers /> Pengguna
        </a>
        <a href="/admin/hotels" className={`admin-nav-item ${activeMenu === 'hotel' ? 'active' : ''}`}>
          <FaHotel /> Hotel
        </a>
        <a href="/admin/destinations" className={`admin-nav-item ${activeMenu === 'destinasi' ? 'active' : ''}`}>
          <FaMapMarkerAlt /> Destinasi
        </a>
        <a href="/admin/promos" className={`admin-nav-item ${activeMenu === 'promo' ? 'active' : ''}`}>
          <FaTag /> Promo
        </a>
        <a href="/admin/transport" className={`admin-nav-item ${activeMenu === 'transportasi' ? 'active' : ''}`}>
          <FaBus /> Transportasi
        </a>
        <a href="/admin/groups" className={`admin-nav-item ${activeMenu === 'grup' ? 'active' : ''}`}>
          <FaGlobe /> Grup Wisata
        </a>
        <a href="/admin/payments" className={`admin-nav-item ${activeMenu === 'pembayaran' ? 'active' : ''}`}>
          <FaFileInvoiceDollar /> Pembayaran
        </a>
        <a href="/admin/monitoring" className={`admin-nav-item ${activeMenu === 'monitoring' ? 'active' : ''}`}>
          <FaChartLine /> Monitoring
        </a>
      </nav>
      <div className="sidebar-bottom">
        <a href="/" className="admin-nav-item text-red"><FaSignOutAlt /> Keluar</a>
      </div>
    </aside>
  );
};

export default AdminSidebar;