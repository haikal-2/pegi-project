import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaFileDownload, FaMoneyBillWave, FaMobileAlt, FaUserFriends } from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import StatistikChart from "../components/StatistikChart";
import { getMonitoringStats } from "../services/adminService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminMonitoringPage.css";

// --- INTERFACE DIBERSIHKAN (Hanya yang digunakan) ---
interface MonitoringData {
  kpi: {
    revenue: string;
    totalBookings: number;
    totalUsers: number;
  };
  topHotels: Array<{
    id: string;
    name: string;
    location: string;
    revenue: string;
  }>;
  crowdLevels: Array<{
    id: string;
    location: string;
    percentage: number;
    colorClass: string;
  }>;
}

const AdminMonitoringPage: React.FC = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("2023-10-01");
  const [endDate, setEndDate] = useState("2023-10-31");

  const [stats, setStats] = useState<MonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await getMonitoringStats(startDate, endDate);
      setStats(response.data);
    } catch (error) {
      console.error("Gagal mengambil data monitoring:", error);
      // Fallback Data yang sudah disesuaikan
      setStats({
        kpi: { revenue: "Rp 0", totalBookings: 0, totalUsers: 0 },
        topHotels: [],
        crowdLevels: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyDateFilter = () => {
    setShowDatePicker(false);
    fetchStats();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Pilih Tanggal";
    const d = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return `${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // --- EXPORT PDF BERUPA TABEL RINGKASAN (TANPA CHART) ---
  const handleExportPDF = () => {
    if (!stats) {
      alert("Data belum siap, tunggu sebentar lalu coba lagi.");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- HEADER LAPORAN ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Laporan Monitoring Sistem Pegi", pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(
      `Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`,
      pageWidth / 2,
      25,
      { align: "center" }
    );
    doc.text(
      `Dicetak pada: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
      pageWidth / 2,
      30,
      { align: "center" }
    );

    let currentY = 40;

    // --- TABEL 1: RINGKASAN KPI ---
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Ringkasan Performa", 14, currentY);
    currentY += 4;

    autoTable(doc, {
      startY: currentY,
      head: [["Metrik", "Nilai"]],
      body: [
        ["Pendapatan Terpilih", stats.kpi.revenue],
        ["Total Booking", stats.kpi.totalBookings.toLocaleString("id-ID")],
        ["Total Pengguna Aktif", stats.kpi.totalUsers.toLocaleString("id-ID")],
      ],
      theme: "grid",
      headStyles: { fillColor: [67, 24, 255] }, // ungu sesuai tema admin
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    // @ts-ignore - lastAutoTable disediakan oleh plugin autoTable di runtime
    currentY = doc.lastAutoTable.finalY + 12;

    // --- TABEL 2: RANKING HOTEL TERATAS ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Ranking Hotel Teratas", 14, currentY);
    currentY += 4;

    if (stats.topHotels.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [["#", "Nama Hotel", "Lokasi", "Pendapatan"]],
        body: stats.topHotels.map((h, i) => [
          (i + 1).toString(),
          h.name,
          h.location,
          h.revenue,
        ]),
        theme: "grid",
        headStyles: { fillColor: [67, 24, 255] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      });
      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 12;
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120);
      doc.text("Belum ada transaksi hotel pada periode ini.", 14, currentY + 4);
      currentY += 14;
    }

    // --- TABEL 3: STATISTIK KERAMAIAN ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Statistik Tingkat Keramaian", 14, currentY);
    currentY += 4;

    if (stats.crowdLevels.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [["Lokasi Destinasi", "Tingkat Keramaian"]],
        body: stats.crowdLevels.map((c) => [c.location, `${c.percentage}%`]),
        theme: "grid",
        headStyles: { fillColor: [67, 24, 255] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      });
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120);
      doc.text("Tidak ada data keramaian destinasi.", 14, currentY + 4);
    }

    const today = new Date().toISOString().split("T")[0];
    doc.save(`Laporan-Monitoring-Pegi-${today}.pdf`);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activeMenu="monitoring" />

      <main className="admin-main">
        <AdminTopbar />

        <div className="monitoring-container">
          <div className="monitoring-header">
            <div className="title-area">
              <h1>Monitoring Sistem</h1>
              <p>Data performa real-time seluruh ekosistem Pegi.</p>
            </div>
            <div className="header-actions">
              <div className="date-picker-container">
                <button className="btn-outline-gray" onClick={() => setShowDatePicker(!showDatePicker)}>
                  <FaCalendarAlt className="text-gray" /> {formatDate(startDate)} - {formatDate(endDate)}
                </button>

                {showDatePicker && (
                  <div className="date-picker-popup">
                    <div className="dp-field">
                      <label>Tanggal Mulai</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="dp-field">
                      <label>Tanggal Selesai</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <button className="btn-primary dp-btn" onClick={handleApplyDateFilter}>
                      Terapkan Filter
                    </button>
                  </div>
                )}
              </div>

              <button className="btn-primary" onClick={handleExportPDF}>
                <FaFileDownload /> Cetak
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: "50px", textAlign: "center", color: "#8f9bba" }}>
              <h3>Menarik data analitik dari server...</h3>
            </div>
          ) : (
            <>
              {/* ROW 1: KPI CARDS (Tetap) */}
              <div className="kpi-grid" style={{ marginBottom: "20px" }}>
                <div className="kpi-card">
                  <div className="kpi-top">
                    <div className="kpi-icon bg-purple-light text-purple">
                      <FaMoneyBillWave />
                    </div>
                  </div>
                  <p className="kpi-label">Pendapatan Terpilih</p>
                  <h2 className="kpi-value">{stats?.kpi.revenue}</h2>
                </div>
                <div className="kpi-card">
                  <div className="kpi-top">
                    <div className="kpi-icon bg-pink-light text-pink">
                      <FaMobileAlt />
                    </div>
                  </div>
                  <p className="kpi-label">Total Booking</p>
                  <h2 className="kpi-value">{stats?.kpi.totalBookings.toLocaleString("id-ID")}</h2>
                </div>
                <div className="kpi-card">
                  <div className="kpi-top">
                    <div className="kpi-icon bg-orange-light text-orange">
                      <FaUserFriends />
                    </div>
                  </div>
                  <p className="kpi-label">Total Pengguna Aktif</p>
                  <h2 className="kpi-value">{stats?.kpi.totalUsers.toLocaleString("id-ID")}</h2>
                </div>
              </div>

              {/* ROW 2: CHART STATISTIK (Dibuat Full Width) */}
              <div style={{ width: "100%", marginBottom: "20px" }}>
                <div className="widget-card" style={{ padding: 0, overflow: "hidden" }}>
                  <div className="chart-dashboard-wrapper" style={{ width: "100%" }}>
                    <StatistikChart />
                  </div>
                </div>
              </div>

              {/* ROW 3: RANKING & CROWD LEVEL (Dibuat 2 Kolom Responsive) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
                
                {/* Ranking Hotel */}
                <div className="widget-card">
                  <h3 className="widget-title mb-20">Ranking Hotel Teratas</h3>
                  <div className="ranking-list">
                    {stats?.topHotels && stats.topHotels.length > 0 ? (
                      stats.topHotels.map((hotel, index) => (
                        <div className="ranking-item" key={hotel.id}>
                          <span className={`rank-num ${index === 0 ? "text-purple" : "text-gray"}`}>{String(index + 1).padStart(2, "0")}</span>
                          <div className="rank-info">
                            <h4>{hotel.name}</h4>
                            <p>{hotel.location}</p>
                          </div>
                          <div className="rank-stats">
                            <h4>{hotel.revenue}</h4>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray sm-text" style={{ textAlign: "center" }}>
                        Belum ada transaksi hotel.
                      </p>
                    )}
                  </div>
                </div>

                {/* Statistik Crowd Level */}
                <div className="widget-card">
                  <h3 className="widget-title mb-20">Statistik Tingkat Keramaian</h3>
                  <div className="crowd-stats-list">
                    {stats?.crowdLevels && stats.crowdLevels.length > 0 ? (
                      stats.crowdLevels.map((crowd) => (
                        <div className="crowd-item" key={crowd.id}>
                          <div className="crowd-header">
                            <span>{crowd.location}</span>
                            <span className={`text-${crowd.colorClass.split("-")[1]} fw-bold`}>{crowd.percentage}%</span>
                          </div>
                          <div className="progress-bg">
                            <div className={`progress-fill ${crowd.colorClass}`} style={{ width: `${crowd.percentage}%` }}></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray sm-text" style={{ textAlign: "center" }}>
                        Tidak ada data keramaian.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminMonitoringPage;