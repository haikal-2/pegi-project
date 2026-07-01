import React, { useState, useEffect } from "react";
import { FaUserFriends, FaUserCheck, FaUserShield, FaUserPlus, FaFilter, FaBan, FaCheckCircle } from "react-icons/fa";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "./AdminUserPage.css";

interface User {
  id: string;
  name: string;
  email: string;
  role: "PELANGGAN" | "ADMIN";
  status: "Aktif" | "Nonaktif";
  date: string;
  avatarUrl?: string;
  initials?: string;
}

const AdminUserPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua Peran");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Disesuaikan agar proporsional

  // Config Token Otorisasi untuk Backend Java
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // 🔄 Ambil Data Pengguna dari Java Backend
  const fetchUsers = async () => {
  setIsLoading(true);
  setError("");
  try {
    const response = await axios.get("http://localhost:8080/api/admin/users", getAuthConfig());
    console.log("Response dari backend:", response.data); // cek di console browser

    // Jika backend mengirim array langsung
    if (Array.isArray(response.data)) {
      setUsers(response.data);
    } 
    // Jika backend membungkus dalam field tertentu, sesuaikan nama field-nya
    else if (Array.isArray(response.data.content)) {
      setUsers(response.data.content);
    } else if (Array.isArray(response.data.data)) {
      setUsers(response.data.data);
    } else {
      console.error("Format data tidak dikenali:", response.data);
      setUsers([]); // fallback supaya tidak crash
      setError("Format data dari server tidak sesuai.");
    }
  } catch (err: any) {
    console.error("Gagal mengambil data pengguna:", err);
    setUsers([]); // pastikan tetap array walau error
    setError("Gagal memuat data dari server Java. Pastikan token valid.");
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🚫 Fungsi Ubah Status (Aktif / Nonaktif)
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const isDeactivating = currentStatus === "Aktif";
    const confirmMsg = isDeactivating 
      ? "Apakah Anda yakin ingin MENONAKTIFKAN pengguna ini? Mereka tidak akan bisa login." 
      : "Apakah Anda yakin ingin MENGAKTIFKAN KEMBALI pengguna ini?";

    if (window.confirm(confirmMsg)) {
      try {
        const newStatus = isDeactivating ? "Nonaktif" : "Aktif";
        // Tembak endpoint update status ke backend Java lu
        await axios.put(`http://localhost:8080/api/admin/users/${userId}/status`, { status: newStatus }, getAuthConfig());
        alert("Status pengguna berhasil diperbarui!");
        fetchUsers(); // Reload data
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat mengubah status pengguna ke database.");
      }
    }
  };

  // 🛡️ Fungsi Mengubah Role menjadi Admin
  const handleMakeAdmin = async (userId: string, userName: string) => {
    const confirmMsg = `Apakah Anda yakin ingin mengubah ${userName} menjadi ADMIN?`;

    if (window.confirm(confirmMsg)) {
      try {
        // Tembak endpoint update role ke backend Java lu
        await axios.put(`http://localhost:8080/api/admin/users/${userId}/role`, { role: "ADMIN" }, getAuthConfig());
        alert(`${userName} berhasil dijadikan Admin!`);
        fetchUsers(); 
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan pada database saat mengubah peran pengguna.");
      }
    }
  };

  // Filter Data Client-side
  const filteredUsers = users.filter((user) => {
    const matchSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Normalisasi huruf besar/kecil dari database
    const userRole = user.role?.toUpperCase();
    const matchRole = roleFilter === "Semua Peran" || userRole === roleFilter.toUpperCase();
    
    const userStatus = user.status === "ACTIVE" || user.status === "Aktif" ? "Aktif" : "Nonaktif";
    const matchStatus = statusFilter === "Semua Status" || userStatus === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  // Hitung Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentTableData = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleResetFilter = () => {
    setSearchQuery("");
    setRoleFilter("Semua Peran");
    setStatusFilter("Semua Status");
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Aktif" || u.status === "ACTIVE").length;
  const adminUsers = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="admin-layout">
      <AdminSidebar activeMenu="pengguna" />

      <main className="admin-main">
        <AdminTopbar showSearch={true} searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Cari nama atau email..." />

        <div className="user-management-content">
          <div className="page-header-flex">
            <div>
              <h1>Manajemen Pengguna</h1>
              <p>Kelola akses, peran, dan status akun pengguna Pegi Travel.</p>
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {/* ⚡ STATS GRID (LEBIH PADAT) */}
          <div className="stats-grid-4">
            <div className="stat-card-white">
              <div className="stat-card-header">
                <p>Total Pengguna</p>
                <div className="icon-box bg-purple-light text-purple"><FaUserFriends /></div>
              </div>
              <h2>{totalUsers.toLocaleString("id-ID")}</h2>
            </div>
            <div className="stat-card-white">
              <div className="stat-card-header">
                <p>Pengguna Aktif</p>
                <div className="icon-box bg-green-light text-green"><FaUserCheck /></div>
              </div>
              <h2>{activeUsers.toLocaleString("id-ID")}</h2>
            </div>
            <div className="stat-card-white">
              <div className="stat-card-header">
                <p>Administrator</p>
                <div className="icon-box bg-yellow-light text-yellow"><FaUserShield /></div>
              </div>
              <h2>{adminUsers.toLocaleString("id-ID")}</h2>
            </div>
            <div className="stat-card-white">
              <div className="stat-card-header">
                <p>Status Sinkronisasi</p>
                <div className="icon-box bg-green-light text-green"><FaCheckCircle /></div>
              </div>
              <h2 style={{ fontSize: "1.1rem", color: "#38a169", marginTop: "5px" }}>Connected</h2>
            </div>
          </div>

          {/* 🔍 FILTER BAR */}
          <div className="filter-bar">
            <div className="filter-left">
              <FaFilter className="text-gray" /> 
              <span className="fw-500">Filter:</span>
              <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="Semua Peran">Semua Peran</option>
                <option value="PELANGGAN">Pelanggan</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="Semua Status">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
            <button className="btn-reset-filter" onClick={handleResetFilter}>Reset Filter</button>
          </div>

          {/* 📊 TABEL UTAMA */}
          <div className="table-container-card">
            <div className="table-responsive-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>PENGGUNA</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>STATUS AKUN</th>
                    <th>REGISTRASI</th>
                    <th style={{ textAlign: "right" }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="table-loading">
                        <div className="table-spinner"></div>
                        <p>Menghubungi database Java...</p>
                      </td>
                    </tr>
                  ) : currentTableData.length > 0 ? (
                    currentTableData.map((user, idx) => {
                      const isAktif = user.status === "Aktif" || user.status === "ACTIVE";
                      return (
                        <tr key={idx}>
                          <td>
                            <div className="user-cell">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="user-avatar" />
                              ) : (
                                <div className="user-initials bg-purple-light text-purple">
                                  {user.initials || user.name?.substring(0, 2).toUpperCase() || "US"}
                                </div>
                              )}
                              <div className="user-name-group">
                                <span className="fw-semibold text-dark">{user.name}</span>
                                <span className="user-id">ID: #{user.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="text-gray">{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role?.toUpperCase() === "ADMIN" ? "role-admin" : "role-normal"}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <div className="status-cell">
                              <span className={`status-dot ${isAktif ? "dot-green" : "dot-red"}`}></span>
                              <span className={isAktif ? "text-green" : "text-red"}>
                                {isAktif ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                          </td>
                          <td className="text-gray">{user.date || "-"}</td>
                          <td>
                            <div className="action-buttons-group">
                              {isAktif ? (
                                <button className="btn-action btn-danger" onClick={() => handleToggleStatus(user.id, "Aktif")}>
                                  <FaBan /> Nonaktifkan
                                </button>
                              ) : (
                                <button className="btn-action btn-success" onClick={() => handleToggleStatus(user.id, "Nonaktif")}>
                                  <FaCheckCircle /> Aktifkan
                                </button>
                              )}

                              {user.role?.toUpperCase() !== "ADMIN" && (
                                <button className="btn-action btn-primary-action" onClick={() => handleMakeAdmin(user.id, user.name)}>
                                  <FaUserShield /> Jadikan Admin
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="empty-state-table">Tidak ada pengguna yang cocok dengan kriteria filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 📑 PAGINATION */}
            <div className="pagination-footer">
              <span className="text-gray">
                Halaman <strong>{currentPage}</strong> dari {totalPages || 1}
              </span>
              <div className="pagination-controls">
                <button className="page-btn" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                  &larr;
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button key={index + 1} className={`page-btn ${currentPage === index + 1 ? "active" : ""}`} onClick={() => setCurrentPage(index + 1)}>
                    {index + 1}
                  </button>
                ))}
                <button className="page-btn" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
                  &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserPage;