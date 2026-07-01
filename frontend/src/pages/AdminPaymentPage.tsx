import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaEye, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "./AdminPaymentPage.css";
import { useTransaction } from "../context/TransactionContext";
// 1. IMPORT API UPDATE DATABASE
import { updatePaymentStatus } from "../services/adminService";

interface Transaction {
  id: string;
  txId: string;
  customerName: string;
  serviceType: "Hotel" | "Destinasi" | "Transportasi" | "Grup Wisata";
  serviceName: string;
  amount: string;
  date: string;
  status: "Menunggu" | "Berhasil" | "Ditolak";
  proofImg: string;
  isSplitBill?: boolean;
  totalGroupBill?: string;
  splitCount?: number;
}

const AdminPaymentPage: React.FC = () => {
  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [typeFilter, setTypeFilter] = useState("Semua Layanan");

  // 2. AMBIL refreshPayments UNTUK SINKRONISASI NOTIFIKASI
  const { transactions, refreshPayments } = useTransaction();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset halaman ke 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, statusFilter, typeFilter]);

  const handleOpenProof = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  // 3. FUNGSI APPROVE KE DATABASE
  const handleApprove = async (id: string) => {
    if (window.confirm("Terima pembayaran ini? Transaksi akan berstatus Berhasil.")) {
      try {
        await updatePaymentStatus(id, { status: "Berhasil" });
        refreshPayments(); // Tarik ulang data dari DB agar Notif & Tabel sinkron!
        setIsModalOpen(false);
      } catch (error) {
        alert("Gagal memverifikasi pembayaran.");
      }
    }
  };

  // 4. FUNGSI REJECT KE DATABASE
  const handleReject = async (id: string) => {
    if (window.confirm("Tolak pembayaran ini? Pelanggan akan diminta mengunggah ulang bukti transfer.")) {
      try {
        await updatePaymentStatus(id, { status: "Ditolak" });
        refreshPayments(); // Tarik ulang data dari DB agar Notif & Tabel sinkron!
        setIsModalOpen(false);
      } catch (error) {
        alert("Gagal menolak pembayaran.");
      }
    }
  };

  // Filter Logika
  const filteredTx = transactions.filter((t) => {
    const matchSearch = t.customerName.toLowerCase().includes(globalSearch.toLowerCase()) || t.txId.toLowerCase().includes(globalSearch.toLowerCase());
    const matchStatus = statusFilter === "Semua Status" || t.status === statusFilter;
    const matchType = typeFilter === "Semua Layanan" || t.serviceType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  // --- LOGIKA PAGINATION ---
  const totalPages = Math.ceil(filteredTx.length / itemsPerPage);
  const currentTableData = filteredTx.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-layout">
      <AdminSidebar activeMenu="pembayaran" />
      <main className="admin-main">
        <AdminTopbar showSearch={true} searchQuery={globalSearch} setSearchQuery={setGlobalSearch} placeholder="Cari ID Transaksi atau Nama..." />

        <div className="payment-container">
          <div className="page-header">
            <div className="title-area">
              <h1>Verifikasi Pembayaran</h1>
              <p>Cek dan validasi bukti transfer pelanggan untuk seluruh layanan Pegi Travel.</p>
            </div>
          </div>

          <div className="stats-grid-payment">
            <div className="stat-card">
              <div className="stat-icon bg-orange-light">
                <FaClock />
              </div>
              <div className="stat-info">
                <p>Menunggu Konfirmasi</p>
                <h3>{transactions.filter((t) => t.status === "Menunggu").length}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-green-light">
                <FaCheckCircle />
              </div>
              <div className="stat-info">
                <p>Pembayaran Berhasil</p>
                <h3>{transactions.filter((t) => t.status === "Berhasil").length}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-red-light">
                <FaTimesCircle />
              </div>
              <div className="stat-info">
                <p>Pembayaran Ditolak</p>
                <h3>{transactions.filter((t) => t.status === "Ditolak").length}</h3>
              </div>
            </div>
          </div>

          <div className="filter-bar">
            <span className="text-gray fw-bold">Filter:</span>
            <select className="select-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="Semua Status">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Berhasil">Berhasil</option>
              <option value="Ditolak">Ditolak</option>
            </select>
            <select className="select-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="Semua Layanan">Semua Layanan</option>
              <option value="Hotel">Hotel</option>
              <option value="Destinasi">Destinasi</option>
              <option value="Transportasi">Transportasi</option>
              <option value="Grup Wisata">Grup Wisata</option>
            </select>
          </div>

          <div className="table-card-container">
            <div className="table-responsive-wrapper">
              <div className="table-scroll-content">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID TRANSAKSI</th>
                      <th>PELANGGAN</th>
                      <th>DETAIL LAYANAN</th>
                      <th>TOTAL BAYAR</th>
                      <th>TANGGAL</th>
                      <th>STATUS</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* GUNAKAN currentTableData BUKAN filteredTx */}
                    {currentTableData.map((tx) => (
                      <tr key={tx.id}>
                        <td>
                          <span className="tx-id">{tx.txId}</span>
                        </td>
                        <td className="fw-bold text-dark">{tx.customerName}</td>
                        <td>
                          <span className="fw-bold text-dark d-block">{tx.serviceName}</span>
                          <span className="text-gray sm-text">{tx.serviceType}</span>
                        </td>
                        <td className="fw-bold text-dark">
                          {tx.amount}
                          {tx.isSplitBill && <span className="text-orange sm-text fw-bold d-block mt-5">💳 Split Bill (1/{tx.splitCount})</span>}
                        </td>
                        <td className="text-gray sm-text">{tx.date}</td>
                        <td>
                          <span className={`badge-status ${tx.status.toLowerCase()}`}>{tx.status}</span>
                        </td>
                        <td>
                          <div className="action-icons">
                            <button className="icon-btn view" onClick={() => handleOpenProof(tx)} title="Lihat Bukti">
                              <FaEye />
                            </button>
                            {/* Tombol aksi hanya muncul jika status masih Menunggu */}
                            {tx.status === "Menunggu" && (
                              <>
                                <button className="icon-btn approve" onClick={() => handleApprove(tx.id)} title="Terima">
                                  <FaCheck />
                                </button>
                                <button className="icon-btn reject" onClick={() => handleReject(tx.id)} title="Tolak">
                                  <FaTimes />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentTableData.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                          Tidak ada transaksi yang ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* PAGINATION DINAMIS */}
                <div className="table-footer">
                  <span className="text-gray sm-text">
                    Menampilkan halaman {currentPage} dari {totalPages || 1} ({filteredTx.length} transaksi)
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
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL LIHAT BUKTI */}
      {isModalOpen && selectedTx && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Bukti Pembayaran</h2>

            <div className="proof-image-container">
              <img src={selectedTx.proofImg} alt="Bukti Transfer" />
            </div>

            <div className="payment-details">
              <div className="detail-row">
                <span className="detail-label">ID Transaksi</span>
                <span className="detail-value tx-id">{selectedTx.txId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Pelanggan</span>
                <span className="detail-value">{selectedTx.customerName}</span>
              </div>
              {selectedTx.isSplitBill && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Metode Pembayaran</span>
                    <span className="detail-value text-orange">Split Bill ({selectedTx.splitCount} Orang)</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Tagihan Grup</span>
                    <span className="detail-value">{selectedTx.totalGroupBill}</span>
                  </div>
                </>
              )}
              <div className="detail-row">
                <span className="detail-label">{selectedTx.isSplitBill ? "Porsi Dibayar (Orang Ini)" : "Total Dibayar"}</span>
                <span className="detail-value fw-bold">{selectedTx.amount}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                Tutup
              </button>

              {/* Jika masih menunggu, admin bisa langsung verifikasi dari dalam modal */}
              {selectedTx.status === "Menunggu" && (
                <>
                  <button className="btn-reject" onClick={() => handleReject(selectedTx.id)}>
                    Tolak
                  </button>
                  <button className="btn-approve" onClick={() => handleApprove(selectedTx.id)}>
                    Verifikasi Diterima
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentPage;
