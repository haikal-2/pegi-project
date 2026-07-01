import React, { useState, useEffect, useRef } from "react";
import { Bell, UserCircle, LogOut, User as UserIcon, Settings, Calendar } from "lucide-react";
import axios from "axios";
import "./Navbar.css";

interface NavbarProps {
  username?: string;
  avatar?: string | null;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  username = "User",
  avatar = null,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(username);
  const [displayAvatar, setDisplayAvatar] = useState<string | null>(avatar);

  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const path = window.location.pathname;

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch profil asli dari database, bukan dari localStorage yang bisa basi
  const fetchProfileData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      setDisplayName("User");
      setDisplayAvatar(null);
      return;
    }

    setIsLoggedIn(true);

    try {
      const res = await axios.get("http://localhost:8080/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      // Prioritas: fullName > name > username, sesuai mapping yang sudah ada di ProfilePage
      setDisplayName(data.fullName || data.name || data.username || "User");
      setDisplayAvatar(data.avatar || null);
    } catch (error) {
      console.error("Gagal mengambil data profil untuk navbar:", error);
      // Kalau token invalid/expired, anggap belum login
      setIsLoggedIn(false);
    }

    // Dummy/Real Notifikasi dari database
    setNotifications([
      { id: 1, title: "Booking Sukses! 🎉", message: "Hotel Mulia Senayan berhasil dipesan.", time: "2 jam yang lalu", isRead: false },
      { id: 2, title: "Tiket Transportasi 🚌", message: "Bus Pahala Kencana berangkat besok pukul 08:30.", time: "5 jam yang lalu", isRead: false },
    ]);
  };

  useEffect(() => {
    fetchProfileData();

    // Tetap dengarkan perubahan storage untuk multi-tab sync
    const handleStorageChange = () => {
      fetchProfileData();
    };

    window.addEventListener("storage", handleStorageChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* LOGO BERUPA GAMBAR */}
        <div className="navbar-logo">
          <a href="/" className="navbar-logo-link">
            {/* TODO: Ganti src dengan path logo asli lu nanti */}
            <img src="/logo_pegi_72x72.jpeg" alt="Logo Pegi" className="navbar-logo-img" />
          </a>
        </div>

        {/* MENU */}
        <nav className="navbar-menu">
          <a href="/hotel-search" className={`navbar-link ${path === "/hotel-search" ? "active" : ""}`}>
            Hotel
          </a>
          <a href="/transport-search" className={`navbar-link ${path === "/transport-search" ? "active" : ""}`}>
            Transportasi
          </a>
          <a href="/destination-search" className={`navbar-link ${path === "/destination-search" ? "active" : ""}`}>
            Destinasi Wisata
          </a>
          <a href="/help-center" className={`navbar-link ${path === "/help-center" ? "active" : ""}`}>
            Pusat Bantuan
          </a>
        </nav>

        {/* RIGHT CONTROLS */}
        {isLoggedIn ? (
          <div className="navbar-user">

            {/* DROPDOWN NOTIFIKASI */}
            <div className="dropdown-wrapper" ref={notifRef}>
              <button
                className={`navbar-notification ${isNotifOpen ? "active-btn" : ""}`}
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                title="Notifikasi"
              >
                <Bell size={20} strokeWidth={2.2} />
                {notifications.some(n => !n.isRead) && <span className="notif-badge" />}
              </button>

              {isNotifOpen && (
                <div className="dropdown-menu notif-dropdown animate-fade-in">
                  <div className="dropdown-header">
                    <h3>Notifikasi Terbaru</h3>
                    <a href="/notifications" className="view-all-link">Lihat semua</a>
                  </div>
                  <div className="dropdown-body">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="notif-item">
                          <div className="notif-content">
                            <span className="notif-title">{notif.title}</span>
                            <p className="notif-msg">{notif.message}</p>
                            <span className="notif-time">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="notif-empty">Tidak ada notifikasi baru</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DROPDOWN PROFILE & LOGOUT */}
            <div className="dropdown-wrapper" ref={profileRef}>
              <div
                className={`navbar-profile ${isProfileOpen ? "active-profile" : ""}`}
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
              >
                {displayAvatar ? (
                  <img src={displayAvatar} alt={displayName} className="profile-avatar" />
                ) : (
                  <UserCircle size={34} strokeWidth={1.5} className="default-avatar-icon" />
                )}
                <span className="profile-name">{displayName}</span>
              </div>

              {isProfileOpen && (
                <div className="dropdown-menu profile-dropdown animate-fade-in">
                  <div className="user-dropdown-info">
                    <p className="user-info-name">{displayName}</p>
                    <p className="user-info-status">Akun Terverifikasi</p>
                  </div>
                  <hr className="dropdown-divider" />
                  <a href="/profile" className="dropdown-item">
                    <UserIcon size={16} />
                    <span>Profil Saya</span>
                  </a>
                  <a href="/history" className="dropdown-item">
                    <Calendar size={16} />
                    <span>Riwayat Booking</span>
                  </a>
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item btn-logout">
                    <LogOut size={16} />
                    <span>Keluar Aplikasi</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="navbar-auth">
            <a href="/register" className="btn-register">Daftar</a>
            <a href="/login" className="btn-login">Masuk</a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;