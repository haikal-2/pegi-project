import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaTrain,
  FaTicketAlt,
  FaBus,
  FaCalendarAlt,
  FaStar,
  FaChair,
  FaUserFriends,
  FaMapMarkerAlt,
  FaChevronDown,
  FaTimes
} from "react-icons/fa";
import "./BookingHistoryPage.css";
import type { BookingItem } from "../types/BookingType";
import { getBookings } from "../services/bookingService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TravelerSidebar from "../components/TravelerSidebar";

const BookingHistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Semua");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // State untuk Pop-Up (Modal)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await getBookings();
        if (response && response.data) {
          setBookings(response.data);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("Gagal mengambil data riwayat booking:", error);
        setFetchError("Akses ditolak atau sesi telah berakhir. Silakan login kembali.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getCategoryIcon = (category: string, title: string) => {
    if (category === "Hotel") return <FaBuilding />;
    if (category === "Tiket Wisata") return <FaTicketAlt />;
    if (category === "Transportasi") {
      if (
        title.toLowerCase().includes("kereta") ||
        title.toLowerCase().includes("taksaka")
      )
        return <FaTrain />;
      return <FaBus />;
    }
    return <FaTicketAlt />;
  };

  const getExtraIcon = (category: string) => {
    if (category === "Hotel") return <FaStar className="pegi-text-yellow" />;
    if (category === "Transportasi") return <FaChair />;
    if (category === "Tiket Wisata") return <FaUserFriends />;
    return <FaMapMarkerAlt />;
  };

  // 📸 Fungsi Ekstraksi Gambar dari Database
  const getDbImage = (booking: any) => {
    const imgUrl = booking.imageUrl || 
                   booking.hotel?.image || 
                   booking.hotel?.imageUrl || 
                   booking.image || 
                   booking.destination?.image;
    return imgUrl ? imgUrl : "https://via.placeholder.com/400x300?text=No+Image+Available";
  };

  // 🎨 Fungsi Render Visual (Gambar Normal ATAU Ikon Transportasi)
  const renderVisual = (booking: any, category: string, title: string) => {
    if (String(category).toLowerCase() === "transportasi") {
      const isTrain = String(title).toLowerCase().includes("kereta") || String(title).toLowerCase().includes("taksaka");
      return (
        <div className="pegi-transport-visual">
          {isTrain ? <FaTrain className="pegi-big-icon" /> : <FaBus className="pegi-big-icon" />}
          <span className="pegi-transport-text">{isTrain ? "Kereta Api" : "Bus / Travel"}</span>
        </div>
      );
    }
    return <img src={getDbImage(booking)} alt={title} />;
  };

  const filteredBookings =
    activeTab === "Semua"
      ? bookings
      : bookings.filter((b: any) => {
          const safeCat = b.category || (b.hotel_id ? "Hotel" : "Tiket Wisata");
          return safeCat === activeTab;
        });

  if (fetchError) {
    return (
      <>
        <Navbar />
        <div className="pegi-page-wrapper">
          <div className="pegi-profile-layout">
            <TravelerSidebar activeMenu="history" />
            <main className="pegi-profile-main" style={{ justifyContent: "center", alignItems: "center" }}>
              <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "12px", border: "1px solid #eaeaea" }}>
                <h2 style={{ color: "#ef4444", marginBottom: "15px" }}>Gagal Memuat Data</h2>
                <p style={{ color: "#64748b", marginBottom: "20px" }}>{fetchError}</p>
                <button onClick={() => window.location.href = "/login"} style={{ background: "#6366f1", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                  Ke Halaman Login
                </button>
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pegi-page-wrapper">
        <div className="pegi-profile-layout">
          <TravelerSidebar activeMenu="history" />

          <main className="pegi-profile-main">
            <div className="pegi-main-container">
              <header className="pegi-main-header">
                <h1>Riwayat Booking</h1>
                <p>Pantau status perjalanan dan transaksi Anda.</p>
              </header>

              <div className="pegi-filter-tabs">
                {["Semua", "Hotel", "Transportasi", "Tiket Wisata"].map(
                  (tab) => (
                    <button
                      key={tab}
                      className={`pegi-filter-btn ${activeTab === tab ? "active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>

              {isLoading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ color: "#8f9bba", fontWeight: "bold" }}>Mencari riwayat booking Anda di sistem...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", background: "#fff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                  <p style={{ color: "#64748b" }}>Tidak ada riwayat booking untuk kategori ini.</p>
                </div>
              ) : (
                <>
                  <div className="pegi-booking-list">
                    {filteredBookings.map((booking: any) => {
                      const safeCategory = booking.category || (booking.hotel_id ? "Hotel" : "Tiket Wisata");
                      const safeTitle = booking.title || (booking.hotel?.name) || (booking.destination?.name) || `Pesanan #${booking.id || '-'}`;
                      const safeStatus = booking.status || "PENDING";
                      const safeDate = booking.date || booking.booking_date || booking.bookingDate || "-";
                      const safeId = booking.bookingId || booking.id || "-";
                      const safePrice = booking.totalPrice || booking.total_price || 0;
                      const safeExtraText = booking.extraText || `${booking.totalGuests || booking.total_guests || 1} Tamu`;

                      return (
                        <div key={booking.id || Math.random()} className="pegi-card-item">
                          
                          <div className="pegi-card-image">
                            {/* Panggil fungsi visual dinamis di sini */}
                            {renderVisual(booking, safeCategory, safeTitle)}
                          </div>

                          <div className="pegi-card-info">
                            <div className="pegi-info-header">
                              <span className="pegi-category-label">
                                {getCategoryIcon(safeCategory, safeTitle)}{" "}
                                {String(safeCategory).toUpperCase()}
                              </span>
                              <span
                                className={`pegi-status-badge ${
                                  safeStatus.toUpperCase() === "CONFIRMED" || safeStatus.toUpperCase() === "SELESAI" 
                                    ? "pegi-badge-green" 
                                    : "pegi-badge-yellow"
                                }`}
                              >
                                {safeStatus}
                              </span>
                            </div>

                            <h3 className="pegi-booking-title">{safeTitle}</h3>
                            <p className="pegi-booking-id">ID: {safeId}</p>

                            <div className="pegi-info-footer">
                              <span className="pegi-info-item">
                                <FaCalendarAlt className="pegi-icon-grey" />{" "}
                                {String(safeDate).substring(0, 10)}
                              </span>
                              <span className="pegi-info-item">
                                {getExtraIcon(safeCategory)}{" "}
                                {safeExtraText}
                              </span>
                            </div>
                          </div>

                          <div className="pegi-card-action">
                            <div className="pegi-price-wrapper">
                              <p className="pegi-price-label">Total Pembayaran</p>
                              <p className="pegi-price-value">
                                Rp {Number(safePrice).toLocaleString("id-ID")}
                              </p>
                            </div>
                            <button 
                              className="pegi-btn-action"
                              onClick={() => setSelectedBooking({
                                ...booking, 
                                safeCategory, 
                                safeTitle, 
                                safeStatus, 
                                safeDate, 
                                safeId, 
                                safePrice, 
                                safeExtraText 
                              })}
                            >
                              {booking.buttonText || "Lihat Detail"}
                            </button>
                          </div>
                          
                        </div>
                      );
                    })}
                  </div>

                  {filteredBookings.length > 0 && (
                    <div className="pegi-load-more-container">
                      <button className="pegi-btn-load-more">
                        Tampilkan Lebih Banyak <FaChevronDown />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* 🔮 MODAL POP-UP DETAIL PESANAN */}
      {selectedBooking && (
        <div className="pegi-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="pegi-modal-content" onClick={(e) => e.stopPropagation()}>
            
            <div className="pegi-modal-header">
              <h2>Detail Pesanan</h2>
              <button className="pegi-modal-close" onClick={() => setSelectedBooking(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="pegi-modal-body">
              <div className="pegi-modal-image">
                {/* Panggil fungsi visual dinamis juga di modal ini */}
                {renderVisual(selectedBooking, selectedBooking.safeCategory, selectedBooking.safeTitle)}
                
                <div className={`pegi-modal-status ${
                    selectedBooking.safeStatus.toUpperCase() === "CONFIRMED" || selectedBooking.safeStatus.toUpperCase() === "SELESAI" 
                      ? "pegi-badge-green" 
                      : "pegi-badge-yellow"
                  }`}>
                  {selectedBooking.safeStatus}
                </div>
              </div>

              <div className="pegi-modal-details">
                <h3>{selectedBooking.safeTitle}</h3>
                <p className="pegi-modal-id">Booking ID: <strong>{selectedBooking.safeId}</strong></p>
                
                <hr className="pegi-modal-divider" />
                
                <div className="pegi-modal-grid">
                  <div className="pegi-grid-item">
                    <span>Kategori</span>
                    <strong>{selectedBooking.safeCategory}</strong>
                  </div>
                  <div className="pegi-grid-item">
                    <span>Tanggal</span>
                    <strong>{String(selectedBooking.safeDate).substring(0, 10)}</strong>
                  </div>
                  <div className="pegi-grid-item">
                    <span>Detail Ekstra</span>
                    <strong>{selectedBooking.safeExtraText}</strong>
                  </div>
                  <div className="pegi-grid-item">
                    <span>Total Pembayaran</span>
                    <strong className="pegi-text-purple">Rp {Number(selectedBooking.safePrice).toLocaleString("id-ID")}</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pegi-modal-footer">
              <button className="pegi-btn-close-modal" onClick={() => setSelectedBooking(null)}>Tutup</button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default BookingHistoryPage;