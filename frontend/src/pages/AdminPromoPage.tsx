import React, { useState, useEffect } from "react";
import { FaBullhorn, FaSearch, FaTrash } from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import { getAllPromos, createPromo, updatePromo, deletePromo, uploadImage } from "../services/adminService";
import "./AdminPromoPage.css";

interface PromoCard {
  id: string;
  title: string;
  status: "Aktif" | "Draft" | "Berakhir";
  code: string;
  category: string;
  discount: string;
  validUntil: string;
  usageCount: number;
  usageLimit: number;
  img: string;
}

const AdminPromoPage: React.FC = () => {
  const [globalSearch, setGlobalSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  const [promos, setPromos] = useState<PromoCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<PromoCard>>({});

  const fetchPromos = async () => {
    setIsLoading(true);
    try {
      const response = await getAllPromos();
      setPromos(response.data);
    } catch (error) {
      console.error("Gagal mengambil data promo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleOpenAdd = () => {
    setModalType("add");
    setFormData({ title: "", code: "", category: "Tiket Pesawat", discount: "", status: "Draft", validUntil: "", usageLimit: 100, usageCount: 0, img: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (promo: PromoCard) => {
    setModalType("edit");
    setFormData(promo);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus promo ini?")) {
      try {
        await deletePromo(id);
        fetchPromos();
      } catch (error) {
        alert("Gagal menghapus promo.");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: "Aktif" | "Draft" | "Berakhir") => {
    const targetPromo = promos.find(p => p.id === id);
    if (targetPromo) {
      try {
        await updatePromo(id, { ...targetPromo, status: newStatus });
        fetchPromos();
      } catch (error) {
        alert("Gagal memperbarui status promo.");
      }
    }
  };

  const handleDuplicate = async (promo: PromoCard) => {
    const duplicatedPromo = {
      ...promo,
      title: `${promo.title} (Copy)`,
      status: "Draft",
      usageCount: 0,
    };
   
    delete (duplicatedPromo as any).id; 

    try {
      await createPromo(duplicatedPromo);
      fetchPromos();
      alert("Promo berhasil diduplikat menjadi Draft.");
    } catch (error) {
      alert("Gagal menduplikat promo.");
    }
  };

  // FUNGSI SIMPAN (TAMBAH/EDIT) API
  const handleSave = async () => {
    if (!formData.title?.trim() || !formData.code?.trim() || !formData.discount || !formData.validUntil) {
      alert("Peringatan: Harap lengkapi semua kolom sebelum menyimpan!");
      return;
    }

    try {
      if (modalType === "add") {
        await createPromo(formData);
      } else {
        if (formData.id) await updatePromo(formData.id, formData);
      }
      setIsModalOpen(false);
      fetchPromos();
      alert("Data promo berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan promo:", error);
      alert("Terjadi kesalahan saat menyimpan ke database.");
    }
  };

  // FUNGSI UPLOAD GAMBAR
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

  const filteredPromos = promos.filter((promo) => {
    const matchSearch = promo.title.toLowerCase().includes(localSearch.toLowerCase()) || promo.code.toLowerCase().includes(localSearch.toLowerCase());
    const matchCat = categoryFilter === "Semua Kategori" || promo.category === categoryFilter;
    const matchStatus = statusFilter === "Semua Status" || promo.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="admin-layout">
      <AdminSidebar activeMenu="promo" />

      <main className="admin-main">
        <AdminTopbar showSearch={false} searchQuery={globalSearch} setSearchQuery={setGlobalSearch} />

        <div className="promo-container">
          <div className="promo-header-section">
            <div className="title-area">
              <h1>Manajemen Promo</h1>
              <p>Kelola kampanye pemasaran, diskon, dan voucher perjalanan.</p>
            </div>
            <button className="btn-create-promo" onClick={handleOpenAdd}>
              <FaBullhorn /> Buat Promo Baru
            </button>
          </div>

          <div className="promo-toolbar">
            <div className="toolbar-left">
              <div className="local-search">
                <FaSearch className="text-gray" />
                <input type="text" placeholder="Cari nama promo atau kode..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} />
              </div>
              <select className="promo-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="Tiket Pesawat">Tiket Pesawat</option>
                <option value="Hotel">Hotel</option>
                <option value="Grup Wisata">Grup Wisata</option>
              </select>
              <select className="promo-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="Semua Status">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Draft">Draft</option>
                <option value="Berakhir">Berakhir</option>
              </select>
            </div>
          </div>

          {isLoading ? (
             <p style={{ textAlign: 'center', color: '#8f9bba', marginTop: '40px' }}>Memuat data promo dari database...</p>
          ) : (
            <div className="promo-cards-grid">
              {filteredPromos.map((promo) => {
                return (
                  <div className="promo-card" key={promo.id}>
                    <img src={promo.img || "https://via.placeholder.com/150"} alt={promo.title} className="p-card-img" />

                    <div className="p-card-info">
                      {/* INFO PROMO */}
                      <div className="p-card-title-row">
                        <h4>{promo.title}</h4>
                        <span className={`p-badge ${promo.status.toLowerCase()}`}>{promo.status}</span>
                      </div>
                      <div className="p-card-code-row">
                        <span className="code-box">{promo.code}</span>
                        <span className="dot">•</span>
                        <span className="text-gray sm-text">{promo.category}</span>
                      </div>
                      <div className="p-card-details">
                        <div>
                          <label>Potongan Harga</label>
                          <p className="fw-bold text-purple">{promo.discount}</p>
                        </div>
                        <div>
                          <label>{promo.status === "Berakhir" ? "Berakhir pada" : "Berlaku s/d"}</label>
                          <p className="fw-bold">{promo.validUntil}</p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="p-card-actions">
                        <button
                          className="btn-outline-primary"
                          onClick={() => {
                            if (promo.status === "Aktif") handleOpenEdit(promo);
                            else if (promo.status === "Draft") handleStatusChange(promo.id, "Aktif");
                            else handleDuplicate(promo);
                          }}
                        >
                          {promo.status === "Aktif" ? "Edit" : promo.status === "Draft" ? "Publikasikan" : "Duplikat"}
                        </button>

                        {promo.status === "Aktif" && (
                          <button className="btn-text text-red" onClick={() => handleStatusChange(promo.id, "Berakhir")}>
                            Hentikan
                          </button>
                        )}
                        {(promo.status === "Draft" || promo.status === "Berakhir") && (
                          <button className="btn-icon-transparent text-red" onClick={() => handleDelete(promo.id)} title="Hapus">
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredPromos.length === 0 && (
                 <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#8f9bba' }}>Tidak ada promo yang ditemukan.</p>
              )}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modalType === "add" ? "Buat Promo Baru" : "Edit Promo"}</h2>

            <div className="form-group">
              <label>Judul Promo</label>
              <input type="text" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Cth: Liburan Hemat" />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Kode Promo</label>
                <input type="text" value={formData.code || ""} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="Cth: HEMAT100" />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select value={formData.category || "Tiket Pesawat"} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="Tiket Pesawat">Tiket Pesawat</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Grup Wisata">Grup Wisata</option>
                  <option value="Semua Kategori">Semua Kategori</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Potongan Harga (Diskon %)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.discount ? formData.discount.toString().replace(/[^0-9]/g, "") : ""}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (val > 100) val = 100;
                  if (val < 0) val = 0;

                  setFormData({ ...formData, discount: val ? `${val}%` : "" });
                }}
                placeholder="Cth: 20"
              />
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label>Berlaku S/D</label>
                <input type="date" value={formData.validUntil || ""} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status || "Draft"} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value="Draft">Draft</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Berakhir">Berakhir</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Upload Banner Promo</label>
              <input type="file" accept="image/*" className="file-input" onChange={handleImageUpload} />
              {isUploadingImg && <p style={{color: '#4318ff', fontSize: '12px'}}>Mengunggah gambar ke server...</p>}
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
                Simpan Promo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromoPage;