import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaPlus,
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaImage
} from "react-icons/fa";
import "./GrupList.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TravelerSidebar from "../components/TravelerSidebar";

interface TravelGroup {
  id: number | string;
  title: string;
  status: string;
  statusColor: string;
  location: string;
  date: string;
  members: number;
  img: string;
}

interface HighlightData {
  title: string;
  status: string;
  countdown: number;
  location: string;
  img: string;
  avatars: string[];
  extraMembers: number;
}

interface LoyaltyData {
  points: string;
  message: string;
}

const GrupList: React.FC = () => {
  const [groups, setGroups] = useState<TravelGroup[]>([]);
  const [highlight, setHighlight] = useState<HighlightData | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [sortOrder, setSortOrder] = useState("terbaru");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TravelGroup>>({});
  
  const API_BASE_URL = "http://localhost:8080/api"; 

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        // 💡 Ambil token dari localStorage (Pastikan saat login, token disimpan dengan key "token")
        const token = localStorage.getItem("token"); 
        
        const authHeaders = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        // A. Tarik Data Grup dengan Auth
        const resGroups = await fetch(`${API_BASE_URL}/groups`, {
          method: "GET",
          headers: authHeaders
        });
        
        if (!resGroups.ok) {
          if (resGroups.status === 403) throw new Error("Akses ditolak (403): Sesi telah habis atau Anda belum login.");
          throw new Error("Gagal mengambil data grup dari server.");
        }
        
        const dataGroups = await resGroups.json();
        
        // Mapping data dari backend ke format yang dibutuhkan UI Frontend
        const mappedGroups = dataGroups.map((group: any) => ({
          id: group.id,
          title: group.name || "Grup Tanpa Nama",
          // Jika description dari backend berisi lokasi/tanggal, kita tampilkan disitu, jika tidak kita pakai default
          location: group.description?.includes("Lokasi:") ? group.description.split("Lokasi:")[1]?.split(",")[0]?.trim() : "Lokasi Belum Ditentukan",
          date: "-",
          members: 1, 
          status: group.groupType === "PRIVATE" ? "Mendatang" : "Aktif",
          statusColor: group.groupType === "PRIVATE" ? "#4318FF" : "#E58E00",
          img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80"
        }));

        setGroups(mappedGroups || []);

        // B. Tarik Data Highlight (Abaikan error jika belum ada endpoint ini di backend)
        try {
          const resHighlight = await fetch(`${API_BASE_URL}/groups/highlight`, { headers: authHeaders });
          if (resHighlight.ok) {
            const dataHighlight = await resHighlight.json();
            setHighlight(dataHighlight);
          }
        } catch (e) {
          console.log("Endpoint highlight belum tersedia");
        }

        // C. Tarik Data Loyalty (Abaikan error jika belum ada endpoint ini di backend)
        try {
          const resLoyalty = await fetch(`${API_BASE_URL}/user/loyalty`, { headers: authHeaders });
          if (resLoyalty.ok) {
            const dataLoyalty = await resLoyalty.json();
            setLoyalty(dataLoyalty);
          }
        } catch (e) {
          console.log("Endpoint loyalty belum tersedia");
        }

      } catch (error: any) {
        console.error("Koneksi Backend Gagal:", error);
        setFetchError(error.message || "Gagal terhubung ke database. Pastikan server backend sedang berjalan dan Anda sudah login.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      location: "",
      date: "",
      members: 1,
      status: "Mendatang",
      img: "",
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, img: imageUrl });
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.location || !formData.date)
      return alert("Lengkapi form terlebih dahulu!");
    
    // 💡 PENYESUAIAN FORMAT DATA UNTUK BACKEND JAVA
    const payloadKeBackend = {
      name: formData.title,
      description: `Lokasi: ${formData.location}, Tanggal: ${formData.date}, Jumlah Anggota: ${formData.members}`,
      groupType: formData.status === "Mendatang" ? "PRIVATE" : "PUBLIC"
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payloadKeBackend),
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error("Akses ditolak. Anda harus login.");
        throw new Error("Gagal POST ke backend");
      }
      
      const savedGroup = await response.json();
      
      // Gabungkan balikan dari backend dengan data UI supaya langsung tampil rapi tanpa refresh
      const newGroupUI: TravelGroup = {
        id: savedGroup.id || Date.now(),
        title: savedGroup.name || formData.title,
        location: formData.location || "Lokasi",
        date: formData.date || "-",
        members: formData.members || 1,
        status: formData.status || "Mendatang",
        statusColor: formData.status === "Aktif" ? "#E58E00" : (formData.status === "Selesai" ? "#8F9BBA" : "#4318FF"),
        img: formData.img || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80",
      };

      setGroups([newGroupUI, ...groups]);
      setIsModalOpen(false);
      
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal menyimpan ke database. Pastikan backend aktif dan Anda login!");
    }
  };

  const processedGroups = groups
    .filter((grup) => {
      const matchSearch =
        grup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grup.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter =
        filterStatus === "Semua" ? true : grup.status === filterStatus;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortOrder === "abjad") return a.title.localeCompare(b.title);
      else if (sortOrder === "terlama") return Number(a.id) - Number(b.id);
      else return Number(b.id) - Number(a.id);
    });

  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <div className="traveler-layout">
          <TravelerSidebar activeMenu="grup" />

          <main className="traveler-main">
            <div className="page-header">
              <div>
                <h1>Grup Perjalanan Saya</h1>
                <p>Kelola perjalanan bersama keluarga dan kolega Anda.</p>
              </div>
              <button className="btn-create-group" onClick={handleOpenAdd}>
                <FaPlus /> Buat Grup
              </button>
            </div>

            {fetchError ? (
               <div style={{ textAlign: "center", padding: "40px", background: "#fee2e2", borderRadius: "12px", color: "#991b1b", border: "1px solid #f87171" }}>
                 <h2>Oops, Terjadi Kesalahan!</h2>
                 <p>{fetchError}</p>
               </div>
            ) : (
              <>
                {(highlight || loyalty) && (
                  <div className="highlight-grid">
                    {highlight && (
                      <div className="highlight-card bromo-card">
                        <div className="bromo-info">
                          <span className="status-badge-orange">{highlight.status}</span>
                          <h2>{highlight.title}</h2>
                          <p>
                            Berangkat dalam <strong className="text-purple">{highlight.countdown} hari</strong> lagi.
                          </p>
                          <div className="bromo-meta">
                            <div className="avatar-group">
                              {highlight.avatars?.map((avatar, index) => (
                                <img key={index} src={avatar} alt="Member" />
                              ))}
                              {highlight.extraMembers > 0 && (
                                <div className="avatar-more">+{highlight.extraMembers}</div>
                              )}
                            </div>
                            <div className="bromo-location">
                              <span className="meta-label">Lokasi</span>
                              <span className="meta-value">{highlight.location}</span>
                            </div>
                          </div>
                        </div>
                        <img src={highlight.img} alt="Highlight Cover" className="bromo-img" />
                      </div>
                    )}

                    {loyalty && (
                      <div className="highlight-card loyalty-card">
                        <div className="loyalty-icon">
                          <FaStar />
                        </div>
                        <h3>Loyalty Points</h3>
                        <p>{loyalty.message}</p>
                        <div className="points-display">
                          <h1>{loyalty.points}</h1> <span>PegiPoints</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="toolbar">
                  <div className="search-bar">
                    <FaSearch className="text-gray" />
                    <input
                      type="text"
                      placeholder="Cari nama grup atau tujuan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="toolbar-actions">
                    <select
                      className="filter-select-grup"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Mendatang">Mendatang</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                    <select
                      className="filter-select-grup"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="terbaru">Terbaru</option>
                      <option value="terlama">Terlama</option>
                      <option value="abjad">Abjad (A-Z)</option>
                    </select>
                  </div>
                </div>

                <div className="groups-grid">
                  {isLoading ? (
                    <div className="empty-message">Mengambil data grup Anda dari database...</div>
                  ) : processedGroups.length > 0 ? (
                    processedGroups.map((grup) => (
                      <div className="group-card" key={grup.id}>
                        <div className="card-img-wrapper">
                          <img src={grup.img} alt={grup.title} />
                        </div>
                        <div className="card-body">
                          <div className="card-title-row">
                            <h3>{grup.title}</h3>
                            <span style={{ color: grup.statusColor, fontWeight: "bold", fontSize: "12px" }}>
                              {grup.status}
                            </span>
                          </div>
                          <div className="card-meta-list">
                            <p><FaMapMarkerAlt className="text-gray" /> {grup.location}</p>
                            <p><FaCalendarAlt className="text-gray" /> {grup.date}</p>
                            <p><FaUsers className="text-gray" /> {grup.members} Anggota</p>
                          </div>
                          <button
                            className="btn-detail-grup"
                            onClick={() => (window.location.href = `/obrolan/${grup.id}`)}
                          >
                            Lihat Detail Grup
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-message">Belum ada grup. Yuk buat sekarang!</div>
                  )}

                  {!isLoading && (
                    <div className="create-new-card" onClick={handleOpenAdd}>
                      <div className="create-icon"><FaPlus /></div>
                      <h3>Mulai Perjalanan Baru</h3>
                      <p>Buat grup baru dan berpetualang bersama.</p>
                      <button className="btn-text-purple">Tambah Sekarang</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>

        {isModalOpen && (
          <div className="modal-overlay-grup">
            <div className="modal-content-grup">
              <h2>Buat Grup Baru</h2>

              <div className="form-group-grup">
                <label>Nama Grup</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Cth: Liburan Keluarga Bali"
                />
              </div>

              <div className="form-group-grup">
                <label>Tujuan / Lokasi</label>
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Cth: Ubud, Bali"
                />
              </div>

              <div className="form-group-row-grup">
                <div className="form-group-grup">
                  <label>Tanggal Perjalanan</label>
                  <input
                    type="text"
                    value={formData.date || ""}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="Cth: 12 - 18 Okt 2024"
                  />
                </div>
                <div className="form-group-grup">
                  <label>Jumlah Anggota</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.members || 1}
                    onChange={(e) => setFormData({ ...formData, members: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group-grup">
                <label>Status</label>
                <select
                  value={formData.status || "Mendatang"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Mendatang">Mendatang</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div className="form-group-grup">
                <label>Gambar Cover (Opsional)</label>
                <div className="file-upload-wrapper">
                  <label htmlFor="file-upload" className="custom-file-btn">
                    <FaImage style={{ marginRight: '8px' }}/> Pilih File Gambar
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                {formData.img && (
                  <div className="preview-image-container">
                    <img src={formData.img} alt="Preview Cover" />
                  </div>
                )}
              </div>

              <div className="modal-actions-grup">
                <button className="btn-cancel-grup" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button className="btn-save-grup" onClick={handleSave}>
                  Simpan Grup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default GrupList;