import React from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

import "./PaymentSuccessPage.css";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="payment-success-page">
        <div className="success-card">
          <div className="success-icon">✓</div>

          <h1>Pembayaran Berhasil</h1>

          <p>
            Terima kasih. Pemesanan Anda berhasil dibuat dan sedang diproses.
          </p>

          <div className="success-info">
            <div className="success-row">
              <span>Status</span>
              <strong className="paid">Berhasil Dibayar</strong>
            </div>

            <div className="success-row">
              <span>Tanggal</span>
              <strong>{new Date().toLocaleDateString("id-ID")}</strong>
            </div>

            <div className="success-row">
              <span>Waktu</span>
              <strong>{new Date().toLocaleTimeString("id-ID")}</strong>
            </div>
          </div>

          <div className="success-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/history")}
            >
              Lihat Booking Saya
            </button>

            <button className="secondary-btn" onClick={() => navigate("/")}>
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccessPage;
