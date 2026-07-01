import React, { useState, useEffect } from "react";
import { FaPlus, FaBus, FaCheckCircle, FaWrench, FaTimesCircle, FaEdit, FaTrash } from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import { getAllTransports, createTransport, updateTransport, deleteTransport, uploadImage } from "../services/adminService";
import "./AdminTransportPage.css";

// --- Interfaces ---
interface Transport {
  id: string;
  name: string;
  detail: string;
  type: "BUS" | "KERETA" | "TRAVEL" | "SHUTTLE";
  route: string;
  price: string;
  capacity: string;
  status: "Aktif" | "Maintenance" | "Nonaktif";
  img: string;
}

const AdminTransportPage: React.FC = () => {
  const [globalSearch, setGlobalSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("Semua Jenis");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  const [transports, setTransports] = useState<Transport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<Transport>>({});

  const fetchTransports = async () => {
    setIsLoading(true);
    try {
      const response = await getAllTransports();
      setTransports(response.data);
    } catch (error) {
      console.error("Gagal mengambil data transportasi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransports();
  }, []);

  // Reset halaman ke 1 jika filter atau pencarian diubah admin
  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, typeFilter, statusFilter]);

  // Fungsi Buka Modal
  const handleOpenAdd = () => {
    setModalType("add");
    setFormData({ name: "", detail: "", type: "BUS", route: "", price: "", capacity: "", status: "Aktif", img: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (transport: Transport) => {
    setModalType("edit");
    setFormData(transport);
    setIsModalOpen(true);
  };

  // FUNGSI HAPUS KE API
  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus armada ini?")) {
      try {
        await deleteTransport(id);
        fetchTransports(); // Refresh data
      } catch (error) {
        alert("Gagal menghapus armada.");
      }
    }
  };

  // FUNGSI SIMPAN KE API
  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.detail?.trim() || !formData.type || !formData.route?.trim() || !formData.price?.trim() || !formData.capacity?.trim() || !formData.status || !formData.img) {
      alert("Peringatan: Harap lengkapi semua kolom dan unggah foto armada sebelum menyimpan!");
      return;
    }

    try {
      if (modalType === "add") {
        await createTransport(formData);
      } else {
        if (formData.id) await updateTransport(formData.id, formData);
      }
      setIsModalOpen(false);
      fetchTransports(); // Refresh data dari DB
      alert("Data armada berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan armada:", error);
      alert("Terjadi kesalahan saat menyimpan ke database.");
    }
  };

  // FUNGSI UPLOAD GAMBAR KE SERVER
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const uploadData = new FormData();
      uploadData.append("file", file);

      setIsUploadingImg(true);
      try {
        const response = await uploadImage(uploadData);
        setFormData({ ...formData, img: response.data });
      } catch (error) {
        alert("Gagal mengupload gambar ke server.");
      } finally {
        setIsUploadingImg(false);
      }
    }
  };

  // Logika Filter & Search
  const filteredTransports = transports.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(globalSearch.toLowerCase()) || t.route.toLowerCase().includes(globalSearch.toLowerCase());
    const matchType = typeFilter === "Semua Jenis" || t.type === typeFilter;
    const matchStatus = statusFilter === "Semua Status" || t.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // --- LOGIKA PAGINATION ---
  const totalPages = Math.ceil(filteredTransports.length / itemsPerPage);
  const currentTableData = filteredTransports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="admin-layout">
      <AdminSidebar activeMenu="transportasi" />

      <main className="admin-main">
        <AdminTopbar showSearch={true} searchQuery={globalSearch} setSearchQuery={setGlobalSearch} placeholder="Cari armada atau rute..." />

        <div className="transport-container">
          {/* HEADER */}
          <div className="page-header">
            <div className="title-area">
              <h1>Manajemen Transportasi</h1>
              <p>Kelola armada bus, travel, kereta, dan layanan shuttle antar kota.</p>
            </div>
            <button className="btn-primary" onClick={handleOpenAdd}>
              <FaPlus /> Tambah Transportasi Baru
            </button>
          </div>

          {/* STATS CARDS DINAMIS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon bg-purple-light text-purple">
                <FaBus />
              </div>
              <div className="stat-info">
                <p>Total Armada</p>
                <h3>{transports.length}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-green-light text-green">
                <FaCheckCircle />
              </div>
              <div className="stat-info">
                <p>Aktif</p>
                <h3>{transports.filter((t) => t.status === "Aktif").length}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-orange-light text-orange">
                <FaWrench />
              </div>
              <div className="stat-info">
                <p>Maintenance</p>
                <h3>{transports.filter((t) => t.status === "Maintenance").length}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-red-light text-red">
                <FaTimesCircle />
              </div>
              <div className="stat-info">
                <p>Nonaktif</p>
                <h3>{transports.filter((t) => t.status === "Nonaktif").length}</h3>
              </div>
            </div>
          </div>

          {/* FILTER & SORT */}
          <div className="filter-bar">
            <div className="filter-left">
              <select className="select-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="Semua Jenis">Jenis Transportasi</option>
                <option value="BUS">Bus</option>
                <option value="KERETA">Kereta</option>
                <option value="TRAVEL">Travel</option>
                <option value="SHUTTLE">Shuttle</option>
              </select>
              <select className="select-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="Semua Status">Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="table-card-container">
            {isLoading ? (
              <p style={{ padding: "30px", textAlign: "center", color: "#8f9bba" }}>Memuat data armada dari database...</p>
            ) : (
              <div className="table-responsive-wrapper">
                <div className="table-scroll-content">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Nama Transportasi</th>
                        <th>Jenis</th>
                        <th>Rute</th>
                        <th>Harga</th>
                        <th>Kapasitas</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* DIREPLACE DENGAN currentTableData */}
                      {currentTableData.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <img src={item.img || "https://via.placeholder.com/150"} alt={item.name} className="img-thumb" />
                          </td>
                          <td>
                            <span className="fw-bold d-block text-dark">{item.name}</span>
                            <span className="text-gray sm-text">{item.detail}</span>
                          </td>
                          <td>
                            <span className={`badge-type ${item.type.toLowerCase()}`}>{item.type}</span>
                          </td>
                          <td className="text-gray">{item.route}</td>
                          <td className="fw-bold text-dark">{item.price}</td>
                          <td className="text-gray">{item.capacity}</td>
                          <td>
                            <div className={`status-indicator ${item.status.toLowerCase()}`}>
                              <span className="dot"></span> {item.status}
                            </div>
                          </td>
                          <td>
                            <div className="action-icons">
                              <button className="icon-btn edit" onClick={() => handleOpenEdit(item)}>
                                <FaEdit />
                              </button>
                              <button className="icon-btn delete" onClick={() => handleDelete(item.id)}>
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {currentTableData.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                            Tidak ada data armada yang ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* PAGINATION DINAMIS */}
                  <div className="table-footer">
                    <span className="text-gray sm-text">
                      Menampilkan halaman {currentPage} dari {totalPages || 1} ({filteredTransports.length} total armada)
                    </span>
                    <div className="pagination-controls">
                      <button 
                        className="page-btn" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                      >
                        {"<"}
                      </button>

                      {[...Array(totalPages)].map((_, idx) => (
                        <button 
                          key={idx + 1} 
                          className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                          onClick={() => setCurrentPage(idx + 1)}
                        >
                          {idx + 1}
                        </button>
                      ))}

                      <button 
                        className="page-btn" 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        style={{ cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1 }}
                      >
                        {">"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL POPUP CRUD */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modalType === "add" ? "Tambah Transportasi Baru" : "Edit Transportasi"}</h2>

            <div className="form-group-row">
              <div className="form-group">
                <label>Nama Armada</label>
                <input type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Cth: Agra Mas Jetbus 3+" />
              </div>
              <div className="form-group">
                <label>Detail / Plat Nomor</label>
                <input type="text" value={formData.detail || ""} onChange={(e) => setFormData({ ...formData, detail: e.target.value })} placeholder="Cth: B 7123 VGA" />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Jenis</label>
                <select value={formData.type || "BUS"} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                  <option value="BUS">BUS</option>
                  <option value="KERETA">KERETA</option>
                  <option value="TRAVEL">TRAVEL</option>
                  <option value="SHUTTLE">SHUTTLE</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status || "Aktif"} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value="Aktif">Aktif</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Rute</label>
              <input type="text" value={formData.route || ""} onChange={(e) => setFormData({ ...formData, route: e.target.value })} placeholder="Cth: Jakarta - Solo" />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Harga Tiket</label>
                <input type="text" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Cth: Rp 250.000" />
              </div>
              <div className="form-group">
                <label>Kapasitas Kursi</label>
                <input type="text" value={formData.capacity || ""} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} placeholder="Cth: 45 Kursi" />
              </div>
            </div>

            <div className="form-group">
              <label>Upload Foto Armada</label>
              <input type="file" accept="image/*" className="file-input" onChange={handleImageUpload} />
              {isUploadingImg && <p style={{ color: "#4318ff", fontSize: "12px" }}>Mengunggah gambar ke server...</p>}
              {formData.img && !isUploadingImg && (
                <div className="upload-preview">
                  <img src={formData.img} alt="Preview" />
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                Batal
              </button>
              <button className="btn-save" onClick={handleSave}>
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransportPage;