import React, { useState } from "react"; // 1. Tambahkan useState di sini
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import ContactForm from "../components/payment/ContactForm";
import TravelerForm from "../components/payment/TravelerForm";
import PaymentMethod from "../components/payment/PaymentMethod";
import PaymentSummary from "../components/payment/PaymentSummary";

import "./PaymentPage.css";

const PaymentPage: React.FC = () => {
  // Ambil data dari state navigasi (dari halaman Destinasi / Hotel)
  const location = useLocation();
  const stateData = location.state || {};

  // Data dari URL (tetap dipertahankan untuk halaman Transportasi)
  const params = new URLSearchParams(window.location.search);
  
  // Modifikasi sedikit: Jika id tidak ada di URL, jadikan undefined (bukan 0) agar tidak error
  const transportIdFromUrl = params.get("id") ? Number(params.get("id")) : undefined;
  const selectedSeatsFromUrl = params.get("seats") ? params.get("seats")?.split(",").map(Number) : undefined;

  // Gabungkan data (prioritaskan URL, lalu fallback ke state)
  const finalTransportId = transportIdFromUrl || stateData.transportId;
  const finalSeats = selectedSeatsFromUrl || stateData.seats || [];

  // 2. BUAT STATE UNTUK METODE PEMBAYARAN
  // Default kita set ke "bca_va" agar tidak kosong jika user langsung klik bayar
  const [selectedMethod, setSelectedMethod] = useState("bca_va");

  return (
    <>
      <Navbar />

      <div className="payment-page">
        <div className="payment-left">
          <ContactForm />

          <TravelerForm seats={finalSeats} />

          {/* 3. Lempar state ke komponen Pemilihan Metode */}
          <PaymentMethod 
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
          />
        </div>

        <div className="payment-right">
          {/* 4. Sisipkan paymentMethod ke komponen Summary */}
          <PaymentSummary 
            transportId={finalTransportId} 
            seats={finalSeats} 
            {...stateData}                // <-- Taruh ini di atas
            paymentMethod={selectedMethod} // <-- WAJIB DI PALING BAWAH
          />
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default PaymentPage;