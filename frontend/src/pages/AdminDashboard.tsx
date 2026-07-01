import React, { useState, useEffect } from "react";
import { FaUsers, FaMapMarkerAlt, FaTicketAlt, FaMoneyBillWave } from "react-icons/fa";
import axios from "axios";
import "./AdminDashboard.css";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from '../components/AdminTopbar';
import StatistikChart from "../components/StatistikChart";

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Guard: jangan kirim request kalau token tidak ada
      if (!token) {
        setError("Sesi tidak ditemukan. Silakan login sebagai admin terlebih dahulu.");
        setIsLoading(false);
        return;
      }

      const res = await axios.get("http://localhost:8080/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setDashboardData(res.data);
    } catch (err: any) {
      console.error("Gagal mengambil data dashboard:", err);
      if (err.response?.status === 403) {
        setError("Akses ditolak. Pastikan kamu login sebagai admin.");
      } else {
        setError("Gagal memuat data dari server. Pastikan backend Java berjalan.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  fetchDashboard();
}, []);

  const getStatIcon = (title: string) => {
    if (!title) return <FaUsers />;
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("pengguna")) return <FaUsers />;
    if (lowerTitle.includes("booking") || lowerTitle.includes("pesanan")) return <FaTicketAlt />;
    if (lowerTitle.includes("destinasi") || lowerTitle.includes("wisata")) return <FaMapMarkerAlt />;
    if (lowerTitle.includes("pendapatan") || lowerTitle.includes("uang")) return <FaMoneyBillWave />;
    return <FaUsers />;
  };

  if (isLoading) {
    return (
      <div className="admin-layout">
        <AdminSidebar activeMenu="dashboard" />
        <main className="admin-main">
          <AdminTopbar />
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Memuat data dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // Fallback data kosong kalau server belum ngirim data yang pas
  const stats = dashboardData?.stats || [
    { title: "Total Pengguna", value: "0", color: "text-purple" },
    { title: "Total Booking", value: "0", color: "text-green" },
    { title: "Destinasi Aktif", value: "0", color: "text-yellow" },
    { title: "Pendapatan", value: "Rp 0", color: "text-red" }
  ];
  const popularDestinations = dashboardData?.popularDestinations || [];
  const recentBookings = dashboardData?.recentBookings || [];
  const newUsers = dashboardData?.newUsers || [];

  return (
    <div className="admin-layout">
      <AdminSidebar activeMenu="dashboard" />

      {/* MAIN CONTENT AREA */}
      <main className="admin-main">
        <AdminTopbar />

        <div className="dashboard-content">
          <div className="dashboard-header">
            <div>
              <h1>Dashboard Overview</h1>
              <p>Pantau performa dan aktivitas platform Pegi hari ini.</p>
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {/* 1. STATS GRID */}
          <div className="stats-grid">
            {stats.map((stat: any, idx: number) => (
              <div key={idx} className="stat-card">
                <div className={`stat-icon-wrapper ${stat.color || 'text-purple'}`}>
                  {getStatIcon(stat.title)}
                </div>
                <div className="stat-details">
                  <p className="stat-title">{stat.title}</p>
                  <h2 className="stat-value">{stat.value}</h2>
                </div>
              </div>
            ))}
          </div>

          {/* 2. MIDDLE GRID */}
          <div className="middle-grid">
            <div className="admin-card">
              <h3>Statistik Pemesanan</h3>
              <StatistikChart />
            </div>

            <div className="admin-card">
              <h3>Destinasi Terpopuler</h3>
              {popularDestinations.length > 0 ? (
                <div className="popular-list">
                  {popularDestinations.map((dest: any, idx: number) => (
                    <div key={idx} className="popular-item">
                      <img src={dest.img || "https://placehold.co/100x100"} alt={dest.name} />
                      <div className="popular-info">
                        <span className="dest-name">{dest.name}</span>
                        <div className="progress-bg">
                          <div className="progress-fill" style={{ width: `${dest.percent || 0}%` }}></div>
                        </div>
                      </div>
                      <span className="dest-percent">{dest.percent || 0}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">Belum ada data destinasi.</p>
              )}
            </div>
          </div>

          {/* 3. BOTTOM GRID */}
          <div className="bottom-grid">
            <div className="admin-card table-card">
              <div className="card-header-flex">
                <h3>Aktivitas Booking Terbaru</h3>
                <a href="/admin/payments" className="link-purple">Lihat Semua</a>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID BOOKING</th>
                      <th>PENGGUNA</th>
                      <th>DESTINASI</th>
                      <th>STATUS</th>
                      <th>JUMLAH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length > 0 ? (
                      recentBookings.map((bk: any, idx: number) => (
                        <tr key={idx}>
                          <td className="fw-500 text-dark">#{bk.id}</td>
                          <td>
                            <div className="user-cell">
                              <span className={`user-init ${bk.color || 'bg-purple-light'}`}>
                                {bk.user?.charAt(0).toUpperCase() || "U"}
                              </span>
                              {bk.user}
                            </div>
                          </td>
                          <td>{bk.dest}</td>
                          <td>
                            <span className={`status-badge ${bk.status === "Sukses" || bk.status === "SUCCESS" ? "badge-green" : bk.status === "Menunggu" || bk.status === "PENDING" ? "badge-yellow" : "badge-red"}`}>
                              {bk.status}
                            </span>
                          </td>
                          <td className="fw-500 text-dark">{bk.amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="empty-state text-center">Belum ada transaksi terbaru.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-card">
              <h3>Pengguna Baru</h3>
              {newUsers.length > 0 ? (
                <div className="new-users-list">
                  {newUsers.map((user: any, idx: number) => (
                    <div key={idx} className="new-user-item">
                      <img src={user.img || "https://placehold.co/100x100"} alt={user.name} />
                      <div className="new-user-info">
                        <p className="user-name">{user.name}</p>
                        <p className="user-time">{user.time || "Baru saja"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state" style={{marginBottom: "20px"}}>Belum ada pengguna baru.</p>
              )}
              <a href="/admin/users">
                <button className="btn-outline-full">Lihat Direktori Pengguna</button>
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;