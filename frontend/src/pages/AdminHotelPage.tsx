import React, { useState, useEffect } from "react";
import { FaPlus, FaStar, FaMapMarkerAlt, FaUtensils, FaSwimmingPool, FaEdit, FaTrash, FaWifi, FaDumbbell } from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import { getAllHotels, createHotel, updateHotel, deleteHotel, uploadImage } from "../services/adminService";
import "./AdminHotelPage.css";

interface RoomType {
  id: string;
  name: string;
  bed: string;
  image: string;
  price: number;
}

interface Hotel {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  totalRooms: number;
  restoCount?: number;
  facilities?: string[];
  img: string;
  gallery?: string[];
  description?: string;
  roomTypes?: RoomType[];
}

const AdminHotelPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<Hotel>>({});

  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const response = await getAllHotels();
      setHotels(response.data);
      if (response.data.length > 0 && !selectedHotel) {
        setSelectedHotel(response.data[0]);
      }
    } catch (error) {
      console.error("Gagal mengambil data hotel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredHotels = hotels.filter((hotel) => hotel.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const currentTableData = filteredHotels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenAdd = () => {
    setModalType("add");
    setFormData({
      name: "",
      category: "",
      location: "",
      totalRooms: 0,
      rating: 0,
      restoCount: 0,
      facilities: [],
      img: "",
      gallery: [],
      description: "",
      roomTypes: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (hotel: Hotel, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalType("edit");
    setFormData(hotel);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Apakah Anda yakin ingin menghapus hotel ini?")) {
      try {
        await deleteHotel(id);
        fetchHotels();
        if (selectedHotel?.id === id) setSelectedHotel(null);
      } catch (error) {
        alert("Gagal menghapus hotel.");
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category || !formData.location || !formData.description) {
      alert("Peringatan: Nama, Kategori, Lokasi, dan Deskripsi wajib diisi!");
      return;
    }

    try {
      if (modalType === "add") {
        await createHotel(formData);
      } else {
        if (formData.id) await updateHotel(formData.id, formData);
      }
      setIsModalOpen(false);
      fetchHotels();
      alert("Data hotel berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan hotel:", error);
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

  const handleAddRoomType = () => {
    const newRoom: RoomType = { id: Date.now().toString(), name: "", bed: "", image: "", price: 0 };
    setFormData({ ...formData, roomTypes: [...(formData.roomTypes || []), newRoom] });
  };

  const handleRoomTypeChange = (id: string, field: keyof RoomType, value: any) => {
    const updatedRooms = formData.roomTypes?.map((r) => (r.id === id ? { ...r, [field]: value } : r));
    setFormData({ ...formData, roomTypes: updatedRooms });
  };

  const handleRemoveRoomType = (id: string) => {
    setFormData({ ...formData, roomTypes: formData.roomTypes?.filter((r) => r.id !== id) });
  };

  const handleFacilityChange = (facility: string) => {
    const currentFacs = formData.facilities || [];
    setFormData({
      ...formData,
      facilities: currentFacs.includes(facility) ? currentFacs.filter((f) => f !== facility) : [...currentFacs, facility],
    });
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility) {
      case "pool":
        return <FaSwimmingPool />;
      case "restaurant":
        return <FaUtensils />;
      case "wifi":
        return <FaWifi />;
      case "gym":
        return <FaDumbbell />;
      default:
        return <FaStar />;
    }
  };

  const facilityLabelMap: Record<string, string> = {
    wifi: "WiFi Gratis",
    pool: "Kolam Renang",
    restaurant: "Restoran",
    gym: "Pusat Kebugaran",
  };

  const availableFacilitiesList = ["wifi", "pool", "restaurant", "gym"];

  return (
    <div className="admin-layout">
      <AdminSidebar activeMenu="hotel" />

      <main className="admin-main">
        <AdminTopbar showSearch={true} searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Cari nama hotel..." />

        <div className="hotel-content-grid">
          <div className="hotel-list-section">
            <div className="page-header">
              <div className="title-area">
                <h1>Manajemen Hotel</h1>
                <p>Kelola daftar properti, ketersediaan, dan informasi detail hotel.</p>
              </div>
              <button className="btn-add-hotel" onClick={handleOpenAdd}>
                <FaPlus /> Tambah Hotel Baru
              </button>
            </div>

            <div className="table-card-container">
              {isLoading ? (
                <p style={{ padding: "30px", textAlign: "center", color: "#64748b", fontWeight: "600" }}>Memuat data dari database...</p>
              ) : (
                <>
                  <table className="hotel-table">
                    <thead>
                      <tr>
                        <th>Hotel</th>
                        <th>Lokasi</th>
                        <th>Rating</th>
                        <th>Kamar</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTableData.map((hotel) => (
                        <tr key={hotel.id} className={selectedHotel?.id === hotel.id ? "active-row" : ""} onClick={() => setSelectedHotel(hotel)}>
                          <td>
                            <div className="hotel-cell">
                              <img src={hotel.img || "https://via.placeholder.com/150"} alt={hotel.name} />
                              <div className="hotel-info">
                                <span className="hotel-name">{hotel.name}</span>
                                <span className="hotel-cat">{hotel.category}</span>
                              </div>
                            </div>
                          </td>
                          <td className="text-gray">{hotel.location}</td>
                          <td>
                            <div className="rating-cell">
                              <FaStar className="text-yellow" /> {hotel.rating}
                            </div>
                          </td>
                          <td className="fw-bold text-dark">{hotel.totalRooms}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon edit" onClick={(e) => handleOpenEdit(hotel, e)}>
                                <FaEdit />
                              </button>
                              <button className="btn-icon delete" onClick={(e) => handleDelete(hotel.id, e)}>
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {currentTableData.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                            Tidak ada data hotel ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="table-footer">
                    <span className="text-gray sm-text">
                      Halaman {currentPage} dari {totalPages || 1} ({filteredHotels.length} total hotel)
                    </span>
                    <div className="pagination-controls">
                      <button className="page-btn" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                        {"<"}
                      </button>
                      {[...Array(totalPages)].map((_, idx) => (
                        <button key={idx + 1} className={`page-btn ${currentPage === idx + 1 ? "active" : ""}`} onClick={() => setCurrentPage(idx + 1)}>
                          {idx + 1}
                        </button>
                      ))}
                      <button className="page-btn" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
                        {">"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="hotel-preview-section">
            <div className="preview-header">
              <h3>Pratinjau Hotel</h3>
            </div>
            {selectedHotel ? (
              <div className="preview-card">
                <div className="preview-image-container">
                  <img src={selectedHotel.img || "https://via.placeholder.com/300"} alt="Detail" />
                  <div className="rating-float">
                    <FaStar /> {selectedHotel.rating}
                  </div>
                </div>
                <div className="preview-body">
                  <h2 className="preview-title">{selectedHotel.name}</h2>
                  <p className="preview-loc">
                    <FaMapMarkerAlt /> {selectedHotel.location}
                  </p>
                  <p className="preview-desc">{selectedHotel.description || "Belum ada deskripsi."}</p>
                  <div className="preview-stats-grid">
                    <div className="p-stat">
                      <span>{selectedHotel.totalRooms || 0}</span>
                      <label>KAMAR</label>
                    </div>
                    <div className="p-stat">
                      <span>{selectedHotel.roomTypes ? selectedHotel.roomTypes.length : 0}</span>
                      <label>TIPE</label>
                    </div>
                    <div className="p-stat">
                      <span>{selectedHotel.restoCount || 0}</span>
                      <label>RESTO</label>
                    </div>
                  </div>
                  <div className="preview-tags">
                    {selectedHotel.facilities && selectedHotel.facilities.length > 0 ? (
                      selectedHotel.facilities.map((fac, idx) => (
                        <span key={idx} className="tag">
                          {getFacilityIcon(fac)} {facilityLabelMap[fac] ?? fac}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray sm-text">Belum ada fasilitas.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="preview-card" style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                Pilih hotel dari tabel untuk melihat pratinjau detail.
              </div>
            )}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalType === "add" ? "Tambah Hotel Baru" : "Edit Hotel"}</h2>
            </div>
            
            <div className="modal-scroll-area">
              <h3 className="section-title">Informasi Dasar</h3>
              <div className="form-group-row">
                <div className="form-group">
                  <label>Nama Hotel</label>
                  <input type="text" placeholder="Cth: Hotel Indonesia Kempinski" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Kategori</label>
                  <input type="text" placeholder="Cth: Bintang 5" value={formData.category || ""} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Lokasi Lengkap</label>
                <input type="text" placeholder="Masukkan alamat lengkap hotel" value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tentang Akomodasi (Deskripsi)</label>
                <textarea rows={4} placeholder="Tuliskan deskripsi menarik tentang hotel ini..." value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
              </div>
              
              <div className="form-group-row">
                <div className="form-group">
                  <label>Jumlah Kamar</label>
                  <input type="number" value={formData.totalRooms || ""} onChange={(e) => setFormData({ ...formData, totalRooms: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Jml Restoran</label>
                  <input type="number" value={formData.restoCount || ""} onChange={(e) => setFormData({ ...formData, restoCount: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Rating Awal</label>
                  <input type="number" step="0.1" value={formData.rating || ""} onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} />
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: "15px" }}>
                <label>Fasilitas Populer</label>
                <div className="checkbox-group">
                  {availableFacilitiesList.map((fac) => (
                    <label key={fac} className="checkbox-label">
                      <input type="checkbox" checked={formData.facilities?.includes(fac) || false} onChange={() => handleFacilityChange(fac)} />
                      {facilityLabelMap[fac]}
                    </label>
                  ))}
                </div>
              </div>
              
              <hr className="modal-divider" />
              
              <h3 className="section-title">Media & Foto Utama</h3>
              <div className="form-group">
                <input type="file" accept="image/*" className="file-input" onChange={handleThumbnailUpload} />
                {isUploadingImg && <p className="upload-status text-primary">Mengunggah gambar ke server, mohon tunggu...</p>}
                {formData.img && !isUploadingImg && (
                  <div className="upload-preview">
                    <img src={formData.img} alt="Thumbnail" />
                  </div>
                )}
              </div>
              
              <hr className="modal-divider" />
              
              <div className="section-header-flex">
                <h3 className="section-title">Manajemen Tipe Kamar</h3>
                <button className="btn-add-sm" onClick={handleAddRoomType}>
                  <FaPlus /> Tambah Tipe Kamar
                </button>
              </div>
              
              {formData.roomTypes && formData.roomTypes.length === 0 ? (
                <div className="empty-text">Belum ada tipe kamar. Klik tombol tambah di atas.</div>
              ) : (
                <div className="room-types-list">
                  {formData.roomTypes?.map((room) => (
                    <div key={room.id} className="room-type-row">
                      <div className="form-group">
                        <label>Nama Kamar</label>
                        <input type="text" placeholder="Cth: Deluxe Room" value={room.name} onChange={(e) => handleRoomTypeChange(room.id, "name", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Tempat Tidur</label>
                        <input type="text" placeholder="Cth: 1 Double Bed" value={room.bed} onChange={(e) => handleRoomTypeChange(room.id, "bed", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>URL Gambar</label>
                        <input type="text" placeholder="https://..." value={room.image} onChange={(e) => handleRoomTypeChange(room.id, "image", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Harga (Rp)</label>
                        <input type="number" placeholder="0" value={room.price || ""} onChange={(e) => handleRoomTypeChange(room.id, "price", Number(e.target.value))} />
                      </div>
                      <button className="btn-remove-row" title="Hapus Kamar" onClick={() => handleRemoveRoomType(room.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                Batalkan
              </button>
              <button className="btn-save" onClick={handleSave}>
                Simpan Hotel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHotelPage;