import React, { useState, useEffect } from "react";
import { FaPlus, FaMapMarkerAlt, FaUserPlus, FaEdit, FaTrash } from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import { getAllGroups, createGroup, updateGroup, deleteGroup, getRecentActivities } from "../services/adminService";
import "./AdminGroupPage.css";

interface TourGroup {
  id: string;
  name: string;
  createdAt: string;
  img: string;
  leaderName: string;
  leaderTier: string;
  currentMembers: number;
  maxMembers: number;
  destination: string;
  status: "Aktif" | "Menunggu" | "Selesai";
}

interface Activity {
  id: string;
  userName: string;
  groupName: string;
  time: string;
}

const AdminGroupPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  // --- STATE DATA DINAMIS ---
  const [groups, setGroups] = useState<TourGroup[]>([]);
  // 1. INI BARIS YANG TERLEWAT: Wadah untuk menyimpan data aktivitas dari database
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<TourGroup>>({});

  // FUNGSI TARIK DATA DARI DATABASE
  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await getAllGroups();
      setGroups(response.data);
    } catch (error) {
      console.error("Gagal mengambil data grup wisata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await getRecentActivities();
      setActivities(response.data); // Sekarang error setActivities sudah hilang!
    } catch (error) {
      console.error("Gagal mengambil aktivitas terbaru:", error);
    }
  };

  // 2. KODE GANDA DIBERSIHKAN: Cukup satu useEffect untuk memanggil data awal
  useEffect(() => {
    fetchGroups();
    fetchActivities();
  }, []);

  // Reset pagination saat pencarian atau filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleOpenAdd = () => {
    setModalType("add");
    setFormData({ name: "", leaderName: "", destination: "", currentMembers: 0, maxMembers: 20, status: "Menunggu", leaderTier: "Silver Member" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group: TourGroup) => {
    setModalType("edit");
    setFormData(group);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus grup ini?")) {
      try {
        await deleteGroup(id);
        fetchGroups();
      } catch (error) {
        alert("Gagal menghapus grup.");
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.leaderName?.trim() || !formData.destination?.trim() || !formData.maxMembers || formData.maxMembers <= 0 || !formData.status) {
      alert("Peringatan: Harap lengkapi semua kolom dengan benar sebelum menyimpan!");
      return;
    }

    try {
      if (modalType === "add") {
        const newGroup = {
          ...formData,
          createdAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
          img: formData.img || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=150&q=80",
          currentMembers: formData.currentMembers || 0,
        };
        await createGroup(newGroup);
      } else {
        if (formData.id) await updateGroup(formData.id, formData);
      }
      setIsModalOpen(false);
      fetchGroups(); // Refresh database
      alert("Data grup berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan grup:", error);
      alert("Terjadi kesalahan saat menyimpan ke database.");
    }
  };

  // Filter Data
  const filteredGroups = groups.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) || g.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "Semua Status" || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // --- LOGIKA PAGINATION ---
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const currentTableData = filteredGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- PERHITUNGAN ANALITIK DINAMIS ---
  const totalGroupsCount = groups.length;
  const activeGroupsCount = groups.filter((g) => g.status === "Aktif").length;

  // Menghitung rata-rata anggota
  const totalMembers = groups.reduce((acc, g) => acc + (g.currentMembers || 0), 0);
  const avgMembers = totalGroupsCount > 0 ? Math.round(totalMembers / totalGroupsCount) : 0;

  // Mencari destinasi terfavorit (Paling banyak muncul)
  const destList = groups.map((g) => g.destination);
  const favoriteDest = destList.length > 0 ? destList.sort((a, b) => destList.filter((v) => v === a).length - destList.filter((v) => v === b).length).pop() : "-";

  return (
    <div className="admin-layout">
      <AdminSidebar activeMenu="grup" />

      <main className="admin-main">
        <AdminTopbar showSearch={true} searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Cari nama grup, ketua, atau destinasi..." />

        <div className="group-content-grid">
          {/* KOLOM KIRI: DAFTAR GRUP */}
          <div className="group-list-section">
            <div className="page-header">
              <div className="title-area">
                <h1>Manajemen Grup Wisata</h1>
                <p>Pantau dan kelola aktivitas komunitas dalam ekosistem perjalanan Anda secara real-time.</p>
              </div>
              <button className="btn-primary" onClick={handleOpenAdd}>
                <FaPlus /> Buat Grup Baru
              </button>
            </div>

            <div className="filter-bar-group">
              <span className="text-gray fw-bold">Filter:</span>
              <select className="select-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="Semua Status">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div className="table-card-container">
              {isLoading ? (
                <p style={{ padding: "30px", textAlign: "center", color: "#8f9bba" }}>Memuat data grup dari database...</p>
              ) : (
                <>
                  <div className="table-responsive-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>FOTO & NAMA GRUP</th>
                          <th>KETUA GRUP</th>
                          <th>ANGGOTA</th>
                          <th>TUJUAN WISATA</th>
                          <th>STATUS</th>
                          <th>AKSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTableData.map((group) => (
                          <tr key={group.id}>
                            <td>
                              <div className="group-info-cell">
                                <img src={group.img || "https://via.placeholder.com/150"} alt={group.name} className="group-avatar" />
                                <div>
                                  <span className="fw-bold text-dark d-block">{group.name}</span>
                                  <span className="text-gray sm-text">{group.createdAt}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="fw-bold text-dark d-block">{group.leaderName}</span>
                              <span className="text-gray sm-text">{group.leaderTier}</span>
                            </td>
                            <td>
                              <span className="member-badge">
                                {group.currentMembers}/{group.maxMembers}
                              </span>
                            </td>
                            <td>
                              <div className="dest-cell">
                                <FaMapMarkerAlt className="text-purple" />
                                <span className="text-dark fw-600">{group.destination}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${group.status.toLowerCase()}`}>{group.status}</span>
                            </td>
                            <td>
                              <div className="action-icons">
                                <button className="icon-btn edit" onClick={() => handleOpenEdit(group)}>
                                  <FaEdit />
                                </button>
                                <button className="icon-btn delete" onClick={() => handleDelete(group.id)}>
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {currentTableData.length === 0 && (
                          <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                              Tidak ada grup yang ditemukan.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION DINAMIS */}
                  <div className="table-footer">
                    <span className="text-gray sm-text">
                      Menampilkan halaman {currentPage} dari {totalPages || 1} ({filteredGroups.length} total grup)
                    </span>
                    <div className="pagination-controls">
                      <button
                        className="page-btn"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
                      >
                        {"<"}
                      </button>
                      {[...Array(totalPages)].map((_, idx) => (
                        <button key={idx + 1} className={`page-btn ${currentPage === idx + 1 ? "active" : ""}`} onClick={() => setCurrentPage(idx + 1)}>
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        className="page-btn"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        style={{ cursor: currentPage === totalPages || totalPages === 0 ? "not-allowed" : "pointer", opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1 }}
                      >
                        {">"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: SIDEBAR MONITORING */}
          <div className="group-sidebar-section">
            {/* Analitik Komunitas */}
            <div className="widget-card">
              <h3 className="widget-title">Analitik Komunitas</h3>
              <div className="analytics-grid">
                <div className="analytic-box">
                  <p>Total Grup</p>
                  <h2 className="text-purple">{totalGroupsCount}</h2>
                </div>
                <div className="analytic-box">
                  <p className="text-green">Grup Aktif</p>
                  <h2 className="text-green">{activeGroupsCount}</h2>
                </div>
                <div className="analytic-box">
                  <p className="text-orange">Rata-rata Anggota</p>
                  <h2 className="text-orange">{avgMembers}</h2>
                </div>
                <div className="analytic-box">
                  <p className="text-purple-light">Destinasi Favorit</p>
                  <h2 className="text-purple" style={{ fontSize: "18px" }}>
                    {favoriteDest}
                  </h2>
                </div>
              </div>
            </div>

            <div className="widget-card">
              <h3 className="widget-title mb-15">Aktivitas Terbaru</h3>
              <div className="activity-list">
                {activities.length > 0 ? (
                  activities.map((act) => (
                    <div className="activity-item" key={act.id}>
                      <div className="act-icon bg-blue-light text-blue">
                        <FaUserPlus />
                      </div>
                      <div className="act-content">
                        <p>
                          <strong>{act.userName}</strong> bergabung ke grup <strong className="text-purple">{act.groupName}</strong>
                        </p>
                        <span>{act.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray sm-text" style={{ textAlign: "center" }}>
                    Belum ada aktivitas terbaru dari pengguna.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL POPUP CRUD */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modalType === "add" ? "Buat Grup Baru" : "Edit Grup"}</h2>

            <div className="form-group">
              <label>Nama Grup</label>
              <input type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Cth: Bali Explorers 2024" />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Nama Ketua Grup</label>
                <input type="text" value={formData.leaderName || ""} onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tujuan Wisata</label>
                <input type="text" value={formData.destination || ""} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Anggota Saat Ini</label>
                <input type="number" value={formData.currentMembers || 0} onChange={(e) => setFormData({ ...formData, currentMembers: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Maksimal Anggota</label>
                <input type="number" value={formData.maxMembers || 0} onChange={(e) => setFormData({ ...formData, maxMembers: Number(e.target.value) })} />
              </div>
            </div>

            <div className="form-group">
              <label>Status Grup</label>
              <select value={formData.status || "Menunggu"} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                <option value="Aktif">Aktif</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                Batal
              </button>
              <button className="btn-save" onClick={handleSave}>
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGroupPage;
