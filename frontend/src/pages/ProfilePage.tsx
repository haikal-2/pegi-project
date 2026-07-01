import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/profileService"; 
import {
  FaBus,
  FaStar,
  FaWalking,
  FaTrain,
  FaMapMarkedAlt,
  FaPen,
  FaLock,
} from "react-icons/fa";
import BadgeItem from "../components/BadgeItem";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./ProfilePage.css";
import TravelerSidebar from "../components/TravelerSidebar";

const ProfilePage: React.FC = () => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    kota: "",
    alamat: "",
    totalDistance: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then((data) => {
        console.log("=== DATA ASLI DARI BACKEND JAVA ===", data);
        if (data) {
          setFormData({
            // MAPPING SESUAI ENTITY User.java
            nama: data.fullName || data.name || "", 
            email: data.email || "",
            telepon: data.phone || "",
            kota: data.city || "",
            alamat: data.bio || "", // Karena ga ada address, kita numpang ke bio
            // Dummy distance karena di User.java belum ada field ini
            totalDistance: 1250, 
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil data profil:", error);
        setLoading(false);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 💡 PAYLOAD SUPER AMAN: Disesuaikan persis dengan User.java lu
      const payload = {
        fullName: formData.nama,
        phone: formData.telepon,
        city: formData.kota,
        bio: formData.alamat, // Titip alamat ke bio
      };
      
      await updateProfile(payload);
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error saat menyimpan:", error);
      alert("Gagal memperbarui profil. Cek console Java, pastikan tidak ada validasi yang gagal.");
    } finally {
      setIsSaving(false);
    }
  };

  const getTierInfo = (distance: number) => {
    if (distance >= 3000) {
      return {
        name: "GOLD MEMBER",
        nextTier: "MAX TIER",
        progress: 100,
        remaining: 0,
        cardClass: "tier-gold",
        barGradient: "linear-gradient(90deg, #ffe066, #f59e0b, #fff200)",
      };
    } else if (distance >= 1000) {
      return {
        name: "SILVER MEMBER",
        nextTier: "Gold Member",
        progress: ((distance - 1000) / 2000) * 100, 
        remaining: 3000 - distance,
        cardClass: "tier-silver",
        barGradient: "linear-gradient(90deg, #cbd5e1, #94a3b8, #e2e8f0)",
      };
    } else {
      return {
        name: "BRONZE MEMBER",
        nextTier: "Silver Member",
        progress: (distance / 1000) * 100,
        remaining: 1000 - distance,
        cardClass: "tier-bronze",
        barGradient: "linear-gradient(90deg, #ea580c, #f97316, #ffedd5)",
      };
    }
  };

  const tierInfo = getTierInfo(formData.totalDistance);

  const allBadges = [
    { id: 1, icon: <FaBus />, title: "First Trip", desc: "Perjalanan pertama Anda", reqDistance: 1 },
    { id: 2, icon: <FaStar />, title: "Explorer", desc: "Menempuh 500+ km", reqDistance: 500 },
    { id: 3, icon: <FaWalking />, title: "Adventurer", desc: "Menempuh 1.500+ km", reqDistance: 1500 },
    { id: 4, icon: <FaTrain />, title: "Globetrotter", desc: "Menempuh 5.000+ km", reqDistance: 5000 },
  ];

  if (loading) {
    return (
      <div className="profile-loading-container">
        <div className="profile-spinner"></div>
        <p>Sinkronisasi data dengan server Java...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="profile-layout">
          <TravelerSidebar activeMenu="profil" />

          <main className="profile-main">
            <header className="main-header">
              <h1>Profil Saya</h1>
              <p>Kelola informasi pribadi dan lihat pencapaian perjalanan Anda.</p>
            </header>

            <div className="content-grid">
              <div className="grid-left">
                <section className="card form-card">
                  <div className="card-header">
                    <div className="icon-circle bg-purple-light">
                      <FaPen className="text-purple" />
                    </div>
                    <h3>Informasi Profil</h3>
                  </div>

                  <form className="profile-form" onSubmit={handleSave}>
                    <div className="form-row">
                      <div className="input-group">
                        <label>Nama Lengkap</label>
                        <input
                          type="text"
                          name="nama"
                          value={formData.nama}
                          onChange={handleChange}
                          placeholder="Masukkan nama lengkap"
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          readOnly
                          className="readonly-input"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="input-group">
                        <label>Nomor Telepon</label>
                        <input
                          type="text"
                          name="telepon"
                          value={formData.telepon}
                          onChange={handleChange}
                          placeholder="Contoh: 081234567xx"
                        />
                      </div>
                      <div className="input-group">
                        <label>Kota Asal</label>
                        <input
                          type="text"
                          name="kota"
                          value={formData.kota}
                          onChange={handleChange}
                          placeholder="Masukkan kota asal"
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Alamat (Disimpan sbg Bio)</label>
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Tulis alamat domisili lengkap Anda"
                      ></textarea>
                    </div>
                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="btn-save" 
                        disabled={isSaving}
                      >
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </form>
                </section>

                <section className="banner-card">
                  <div className="banner-content">
                    <span className="badge-gold">PENAWARAN EKSKLUSIF</span>
                    <h3>Luxury Stay di Bandung</h3>
                    <p>Diskon spesial ekstra hemat khusus untuk member setia Pegi.</p>
                  </div>
                </section>
              </div>

              <div className="grid-right">
                <section className={`card gamification-card ${tierInfo.cardClass}`}>
                  <div className="card-pattern-stripes"></div>
                  <div className="card-glow-element"></div>
                  
                  <div className="tier-tag">
                    <span className="member-badge">{tierInfo.name}</span>
                  </div>
                  
                  <div className="gamification-content-wrapper">
                    <p className="gamification-title">Total Jarak Tempuh</p>
                    <h2 className="gamification-value">
                      {formData.totalDistance.toLocaleString("id-ID")}{" "}
                      <span>km via darat</span>
                    </h2>

                    <div className="progress-container">
                      <div className="progress-bar-bg">
                        <div
                          className="progress-fill-glow"
                          style={{
                            width: `${tierInfo.progress}%`,
                            background: tierInfo.barGradient,
                          }}
                        ></div>
                      </div>
                      <p className="progress-text">
                        {tierInfo.remaining > 0
                          ? `${tierInfo.remaining.toLocaleString("id-ID")} km lagi menuju tingkatan ${tierInfo.nextTier}`
                          : "Luar biasa! Anda berada di tingkat kasta tertinggi!"}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="card badge-list-card">
                  <div className="card-header-flex">
                    <h3>Badge Saya</h3>
                  </div>
                  <div className="badge-grid">
                    {allBadges.map((badge) => {
                      const isUnlocked = formData.totalDistance >= badge.reqDistance;

                      return (
                        <div
                          key={badge.id}
                          className={`badge-wrapper ${isUnlocked ? "unlocked" : "locked"}`}
                        >
                          <BadgeItem
                            icon={isUnlocked ? badge.icon : <FaLock />}
                            title={badge.title}
                            description={
                              isUnlocked
                                ? badge.desc
                                : `Terbuka otomatis di ${badge.reqDistance} km`
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="card plan-card">
                  <div className="icon-circle bg-purple-light">
                    <FaMapMarkedAlt className="text-purple" />
                  </div>
                  <h3>Rencana Berikutnya?</h3>
                  <p>Dapatkan rekomendasi rute kereta wisata terbaik.</p>
                  <a href="/">
                    <button type="button" className="btn-outline-purple">
                      Mulai Eksplorasi
                    </button>
                  </a>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;