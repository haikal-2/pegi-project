import React, { useState, useEffect } from "react";
import { FaPlus, FaStar, FaEdit, FaTrash, FaFilter, FaChartBar, FaLightbulb } from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import { getAllDestinations, createDestination, updateDestination, deleteDestination, uploadImage } from "../services/adminService";
import "./AdminDestinationPage.css";

interface Destination {
  id: string;
  name: string;
  rating: number;
  location: string;
  category: string;
  price: string;
  crowd: "Sepi" | "Sedang" | "Ramai";
  img: string;
}

const AdminDestinationPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [crowdFilter, setCrowdFilter] = useState("Semua Crowd");

  // STATE DATA UTAMA
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<Destination>>({});

  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      const response = await getAllDestinations();
      setDestinations(response.data);
    } catch (error) {
      console.error("Gagal mengambil data destinasi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Reset halaman ke 1 jika filter atau pencarian diubah admin
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, crowdFilter]);

  const filteredDestinations = destinations.filter((dest) => {
    const matchSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "Semua Kategori" || dest.category === categoryFilter;
    const matchCrowd = crowdFilter === "Semua Crowd" || dest.crowd === crowdFilter;
    return matchSearch && matchCategory && matchCrowd;
  });

  // --- LOGIKA PAGINATION ---
  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);
  const currentTableData = filteredDestinations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenAdd = () => {
    setModalType("add");
    setFormData({ name: "", location: "", category: "ALAM", price: "", crowd: "Sepi", rating: 0, img: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dest: Destination) => {
    setModalType("edit");
    setFormData(dest);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus destinasi ini?")) {
      try {
        await deleteDestination(id);
        fetchDestinations();
      } catch (error) {
        alert("Gagal menghapus destinasi.");
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.location?.trim() || !formData.category || !formData.price?.trim() || !formData.crowd || formData.rating === undefined || formData.rating === null || formData.rating < 0 || !formData.img) {
      alert("Peringatan: Harap lengkapi semua kolom dan unggah foto thumbnail sebelum menyimpan!");
      return;
    }

    try {
      if (modalType === "add") {
        await createDestination(formData);
      } else {
        if (formData.id) await updateDestination(formData.id, formData);
      }
      setIsModalOpen(false);
      fetchDestinations();
      alert("Data destinasi berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan destinasi:", error);
      alert("Terjadi kesalahan saat menyimpan ke database.");
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleResetFilter = () => {
    setSearchQuery("");
    setCategoryFilter("Semua Kategori");
    setCrowdFilter("Semua Crowd");
  };

  const totalDestinations = destinations.length;
  const avgRating = totalDestinations > 0 ? (destinations.reduce((acc, curr) => acc + Number(curr.rating), 0) / totalDestinations).toFixed(1) : "0.0";
  const topDestination = totalDestinations > 0 ? destinations.reduce((prev, current) => (prev.rating > current.rating ? prev : current)) : null;

  return (
    <div className="admin-layout">
      <AdminSidebar activeMenu="destinasi" />

      <main className="admin-main">
        <AdminTopbar showSearch={true} searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Cari destinasi..." />

        <div className="dest-content-grid">
          {/* DAFTAR DESTINASI */}
          <div className="dest-list-section">
            <div className="page-header">
              <div className="title-area">
                <h1>Manajemen Destinasi</h1>
                <p>Kelola data destinasi wisata, kategori, dan pemantauan tingkat kunjungan.</p>
              </div>
              <button className="btn-add-primary" onClick={handleOpenAdd}>
                <FaPlus /> Tambah Destinasi Baru
              </button>
            </div>

            <div className="filter-card">
              <div className="filter-left">
                <FaFilter className="text-gray" /> <span className="fw-600 text-dark">FILTER:</span>
                <select className="dest-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="Semua Kategori">Semua Kategori</option>
                  <option value="ALAM">Alam</option>
                  <option value="BUDAYA">Budaya</option>
                  <option value="KULINER">Kuliner</option>
                  <option value="HIBURAN">Hiburan</option>
                </select>
                <select className="dest-select" value={crowdFilter} onChange={(e) => setCrowdFilter(e.target.value)}>
                  <option value="Semua Crowd">Semua Crowd Level</option>
                  <option value="Sepi">Sepi</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Ramai">Ramai</option>
                </select>
              </div>
              <button className="btn-reset-filter" onClick={handleResetFilter} style={{ background: "transparent", color: "#4318FF", border: "none", fontWeight: 700, cursor: "pointer" }}>
                Reset Filter
              </button>
            </div>

            <div className="table-card-container">
              {isLoading ? (
                <p style={{ padding: "20px", textAlign: "center", color: "#8f9bba" }}>Memuat data destinasi dari database...</p>
              ) : (
                <>
                  <table className="dest-table">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Nama Destinasi</th>
                        <th>Wilayah</th>
                        <th>Kategori</th>
                        <th>Harga Tiket</th>
                        <th>Crowd Level</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTableData.map((dest) => (
                        <tr key={dest.id}>
                          <td>
                            <img src={dest.img || "https://via.placeholder.com/150"} alt={dest.name} className="dest-thumb" />
                          </td>
                          <td>
                            <span className="dest-name">{dest.name}</span>
                            <div className="dest-rating">
                              <FaStar className="text-yellow" /> {dest.rating}
                            </div>
                          </td>
                          <td className="text-gray">{dest.location}</td>
                          <td>
                            <span className="badge-cat">{dest.category}</span>
                          </td>
                          <td className="fw-600 text-dark">{dest.price}</td>
                          <td>
                            <span className={`badge-crowd ${dest.crowd.toLowerCase()}`}>{dest.crowd}</span>
                          </td>
                          <td>
                            <div className="action-icons">
                              <button className="icon-action edit" onClick={() => handleOpenEdit(dest)}>
                                <FaEdit />
                              </button>
                              <button className="icon-action delete" onClick={() => handleDelete(dest.id)}>
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {currentTableData.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                            Tidak ada destinasi yang ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* PAGINATION PANEL DINAMIS */}
                  <div className="table-footer">
                    <span className="text-gray">
                      Menampilkan halaman {currentPage} dari {totalPages || 1} ({filteredDestinations.length} total destinasi)
                    </span>
                    <div className="pagination-controls">
                      <button className="page-btn-text" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                        Sebelumnya
                      </button>
                      {[...Array(totalPages)].map((_, idx) => (
                        <button key={idx + 1} className={`page-btn ${currentPage === idx + 1 ? "active" : ""}`} onClick={() => setCurrentPage(idx + 1)}>
                          {idx + 1}
                        </button>
                      ))}
                      <button className="page-btn-text" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* PANEL KANAN: RINGKASAN */}
          <div className="dest-sidebar-section">
            <div className="summary-card">
              <div className="summary-header">
                <h3>Ringkasan</h3>
                <FaChartBar className="text-gray" />
              </div>
              <div className="summary-item">
                <p>TOTAL DESTINASI</p>
                <h2>{totalDestinations}</h2>
              </div>
              <hr className="summary-divider" />
              <div className="summary-item">
                <p>TERPOPULER</p>
                <h3 className="text-purple">{topDestination ? topDestination.name : "-"}</h3>
                <span className="text-gray sm-text">Rating Tertinggi</span>
              </div>
              <hr className="summary-divider" />
              <div className="summary-item">
                <p>RATA-RATA RATING</p>
                <h2>
                  {avgRating}
                  <span className="rating-max">/5.0</span>
                </h2>
              </div>
            </div>
            <div className="tips-card">
              <div className="tips-icon">
                <FaLightbulb />
              </div>
              <h4>Tips Admin</h4>
              <p>Pastikan untuk selalu memperbarui status Crowd Level setiap akhir pekan untuk akurasi data pengunjung.</p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL CRUD */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modalType === "add" ? "Tambah Destinasi Baru" : "Edit Destinasi"}</h2>
            <div className="form-group">
              <label>Nama Destinasi</label>
              <input type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label>Wilayah / Lokasi</label>
                <input type="text" value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select value={formData.category || "ALAM"} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="ALAM">ALAM</option>
                  <option value="BUDAYA">BUDAYA</option>
                  <option value="KULINER">KULINER</option>
                  <option value="HIBURAN">HIBURAN</option>
                </select>
              </div>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label>Harga Tiket</label>
                <input type="text" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Cth: Rp 50.000 / Gratis" />
              </div>
              <div className="form-group">
                <label>Crowd Level</label>
                <select value={formData.crowd || "Sepi"} onChange={(e) => setFormData({ ...formData, crowd: e.target.value as any })}>
                  <option value="Sepi">Sepi</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Ramai">Ramai</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Rating (0-5)</label>
              <input type="number" step="0.1" value={formData.rating || ""} onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Upload Foto Thumbnail</label>
              <input type="file" accept="image/*" className="file-input" onChange={handleThumbnailUpload} />
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

export default AdminDestinationPage;
