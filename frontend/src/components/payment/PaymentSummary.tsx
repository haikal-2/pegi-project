import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTransportById } from "../../services/transportService";
import { validatePromo } from "../../services/promoService";
import type { TransportType } from "../../types/TransportType";

interface Props {
  transportId?: number;
  seats?: number[];
  destinationId?: number;
  destinationName?: string;
  ticketCount?: number;
  date?: string;
  totalPrice?: number;
  hotelId?: number;
  hotelName?: string;
  roomCount?: number;
  nightCount?: number;
  hotelPrice?: number;
  paymentMethod?: string;
}

const PaymentSummary: React.FC<Props> = ({
  transportId,
  seats = [],
  destinationId,
  destinationName,
  ticketCount,
  date,
  totalPrice = 0,
  hotelId,
  hotelName,
  roomCount,
  nightCount,
  paymentMethod,
  hotelPrice = 0,
}) => {
  const navigate = useNavigate();
  const [transport, setTransport] = useState<TransportType | null>(null);
  const [isLoadingTransport, setIsLoadingTransport] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // --- STATE PROMO ---
  const [promoCode, setPromoCode] = useState("");
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState("");

  useEffect(() => {
    if (transportId) {
      const fetchTransport = async () => {
        setIsLoadingTransport(true);
        try {
          const data = await getTransportById(transportId);
          if (data) setTransport(data);
        } catch (error) {
          console.error("Gagal mengambil data transport:", error);
        } finally {
          setIsLoadingTransport(false);
        }
      };
      fetchTransport();
    }
  }, [transportId]);

  const serviceFee = 5000;

  const handleApplyPromo = async (category: "Hotel" | "Tiket Pesawat", baseSubtotal: number) => {
    if (!promoCode.trim()) {
      setPromoMessage("Masukkan kode promo terlebih dahulu.");
      console.log("baseSubtotal dikirim:", baseSubtotal);
      return;
    }

    setIsCheckingPromo(true);
    setPromoMessage("");

    try {
      const result = await validatePromo(promoCode.trim().toUpperCase(), category, baseSubtotal);

      if (result.valid) {
        setPromoDiscount(result.discountAmount);
        setAppliedPromoCode(promoCode.trim().toUpperCase());
        setPromoMessage(`Promo berhasil diterapkan! Potongan Rp ${result.discountAmount.toLocaleString("id-ID")}`);
      } else {
        setPromoDiscount(0);
        setAppliedPromoCode("");
        setPromoMessage(result.message || "Kode promo tidak valid.");
      }
    } catch (error) {
      setPromoMessage("Gagal memeriksa kode promo.");
    } finally {
      setIsCheckingPromo(false);
    }
  };

  // --- HELPER AUTH ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // --- SIMPAN BOOKING SETELAH PEMBAYARAN SUKSES ---
  const createBookingAfterPayment = async (amount: number) => {
    const payload: any = {
      totalPrice: amount,
      status: "CONFIRMED",
    };

    if (destinationId) {
      payload.destination = { id: destinationId };
      payload.totalGuests = ticketCount || 1;
    } else if (hotelId) {
      payload.hotel = { id: hotelId };
      payload.totalGuests = roomCount || 1;
    } else if (transportId) {
      payload.totalGuests = seats.length || 1;
    }

    const response = await fetch("http://localhost:8080/api/bookings/confirm", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Gagal menyimpan data booking ke server");
    }

    return response.json();
  };

  const handlePayment = async (type: string, amount: number) => {
    try {
      setIsPaying(true);

      const getMidtransCode = (method?: string) => {
        if (!method) return "bca_va";
        const cleanMethod = method.toLowerCase().trim();
        switch (cleanMethod) {
          case "bca":
          case "bca_va":
            return "bca_va";
          case "mandiri":
          case "mandiri_va":
          case "echannel":
            return "echannel";
          case "bni":
          case "bni_va":
            return "bni_va";
          case "bri":
          case "bri_va":
            return "bri_va";
          case "gopay":
            return "gopay";
          case "qris":
            return "qris";
          default:
            return cleanMethod;
        }
      };

      const safePaymentMethod = getMidtransCode(paymentMethod);

      const response = await fetch("http://localhost:8080/api/payments/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalAmount: amount,
          paymentMethod: safePaymentMethod,
          promoCode: appliedPromoCode || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil token dari backend");
      }

      const data = await response.json();
      const snapToken = data.token;

      // @ts-ignore
      window.snap.pay(snapToken, {
        onSuccess: async function (result: any) {
          try {
            await createBookingAfterPayment(amount);
          } catch (err) {
            console.error("Booking gagal disimpan setelah pembayaran:", err);
          }
          navigate("/payment-success");
        },
        onPending: function (result: any) {
          alert("Silakan selesaikan pembayaran Anda sesuai instruksi Midtrans.");
        },
        onError: function (result: any) {
          alert("Pembayaran gagal diproses, silahkan coba lagi.");
        },
        onClose: function () {
          alert("Anda menutup halaman pembayaran sebelum menyelesaikan transaksi.");
        },
      });
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Gagal memproses pembayaran ke server.");
    } finally {
      setIsPaying(false);
    }
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    color: "#6B7280",
    fontSize: "14px",
    fontWeight: 500,
  };

  const valueStyle: React.CSSProperties = {
    color: "#111827",
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "right",
  };

  const promoBoxStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
  };

  const promoInputStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "14px",
  };

  const promoButtonStyle: React.CSSProperties = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#7B3FE4",
    color: "#fff",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  // 👇 INI YANG DIGANTI: Diubah jadi fungsi biasa, bukan komponen React
  const renderPromoInputBlock = (category: "Hotel" | "Tiket Pesawat", baseSubtotal: number) => (
    <>
      <div style={promoBoxStyle}>
        <input
          type="text"
          placeholder="Masukkan kode promo"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          style={promoInputStyle}
          disabled={isCheckingPromo || !!appliedPromoCode}
        />
        <button
          style={promoButtonStyle}
          onClick={() => handleApplyPromo(category, baseSubtotal)}
          disabled={isCheckingPromo || !!appliedPromoCode}
        >
          {isCheckingPromo ? "Memeriksa..." : appliedPromoCode ? "Terpasang" : "Pakai"}
        </button>
      </div>
      {promoMessage && (
        <p
          style={{
            fontSize: "13px",
            color: promoDiscount > 0 ? "#16A34A" : "#EF4444",
            marginTop: "-4px",
            marginBottom: "12px",
          }}
        >
          {promoMessage}
        </p>
      )}
    </>
  );

  // ==========================================
  // 1. TAMPILAN JIKA BOOKING DESTINASI
  // ==========================================
  if (destinationId) {
    const finalTotal = totalPrice - promoDiscount + serviceFee;
    return (
      <div className="payment-card">
        <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: 700 }}>Ringkasan Pesanan</h3>

        <div style={rowStyle}>
          <span style={labelStyle}>Tempat Wisata</span>
          <strong style={valueStyle}>{destinationName}</strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Tanggal Kunjungan</span>
          <strong style={valueStyle}>{date}</strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Jumlah Tiket</span>
          <strong style={valueStyle}>{ticketCount} Tiket</strong>
        </div>

        <hr style={{ border: "none", borderTop: "1px dashed #E5E7EB", margin: "16px 0" }} />

        {/* Panggil fungsinya di sini! */}
        {renderPromoInputBlock("Tiket Pesawat", totalPrice)}

        <hr style={{ border: "none", borderTop: "1px dashed #E5E7EB", margin: "16px 0" }} />

        <div style={rowStyle}>
          <span style={labelStyle}>Subtotal</span>
          <strong style={valueStyle}>Rp {totalPrice.toLocaleString("id-ID")}</strong>
        </div>
        {promoDiscount > 0 && (
          <div style={rowStyle}>
            <span style={labelStyle}>Diskon Promo</span>
            <strong style={{ ...valueStyle, color: "#16A34A" }}>
              - Rp {promoDiscount.toLocaleString("id-ID")}
            </strong>
          </div>
        )}
        <div style={rowStyle}>
          <span style={labelStyle}>Biaya Layanan</span>
          <strong style={valueStyle}>Rp {serviceFee.toLocaleString("id-ID")}</strong>
        </div>

        <div style={{ ...rowStyle, marginTop: "20px", marginBottom: "24px" }}>
          <span style={{ color: "#111827", fontSize: "16px", fontWeight: 700 }}>Total Pembayaran</span>
          <strong style={{ color: "#7B3FE4", fontSize: "20px", fontWeight: 800 }}>
            Rp {finalTotal.toLocaleString("id-ID")}
          </strong>
        </div>

        <button className="primary-btn" onClick={() => handlePayment("destination", finalTotal)} disabled={isPaying}>
          {isPaying ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </div>
    );
  }

  // ==========================================
  // 2. TAMPILAN JIKA BOOKING TRANSPORTASI 
  // ==========================================
  if (transportId) {
    if (isLoadingTransport || !transport) {
      return (
        <div className="payment-card" style={{ padding: "30px", textAlign: "center" }}>
          <h3>Ringkasan Pesanan</h3>
          <p style={{ color: "#6B7280" }}>Memuat Data Transportasi...</p>
        </div>
      );
    }

    const transportSubtotal = transport.priceValue * seats.length;
    const transportTotal = transportSubtotal + serviceFee;

    return (
      <div className="payment-card">
        <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: 700 }}>Ringkasan Pesanan</h3>

        <div style={rowStyle}>
          <span style={labelStyle}>Transport</span>
          <strong style={valueStyle}>{transport.company}</strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Rute</span>
          <strong style={valueStyle}>
            {transport.departureCity} → {transport.arrivalCity}
          </strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Kelas</span>
          <strong style={valueStyle}>{transport.classType}</strong>
        </div>

        <hr style={{ border: "none", borderTop: "1px dashed #E5E7EB", margin: "16px 0" }} />

        <div style={rowStyle}>
          <span style={labelStyle}>Kursi Dipilih</span>
          <strong style={valueStyle}>{seats.length > 0 ? seats.join(", ") : "-"}</strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Jumlah Penumpang</span>
          <strong style={valueStyle}>{seats.length} Orang</strong>
        </div>

        <hr style={{ border: "none", borderTop: "1px dashed #E5E7EB", margin: "16px 0" }} />

        <div style={rowStyle}>
          <span style={labelStyle}>Subtotal</span>
          <strong style={valueStyle}>Rp {transportSubtotal.toLocaleString("id-ID")}</strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Biaya Layanan</span>
          <strong style={valueStyle}>Rp {serviceFee.toLocaleString("id-ID")}</strong>
        </div>

        <div style={{ ...rowStyle, marginTop: "20px", marginBottom: "24px" }}>
          <span style={{ color: "#111827", fontSize: "16px", fontWeight: 700 }}>Total Pembayaran</span>
          <strong style={{ color: "#7B3FE4", fontSize: "20px", fontWeight: 800 }}>
            Rp {transportTotal.toLocaleString("id-ID")}
          </strong>
        </div>

        <button
          className="primary-btn"
          onClick={() => handlePayment("transport", transportTotal)}
          disabled={isPaying || seats.length === 0}
        >
          {isPaying ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </div>
    );
  }

  // ==========================================
  // 3. TAMPILAN JIKA BOOKING HOTEL
  // ==========================================
  if (hotelId) {
    const finalTotal = hotelPrice - promoDiscount + serviceFee;
    return (
      <div className="payment-card">
        <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: 700 }}>Ringkasan Pesanan</h3>

        <div style={rowStyle}>
          <span style={labelStyle}>Nama Hotel</span>
          <strong style={valueStyle}>{hotelName}</strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Durasi</span>
          <strong style={valueStyle}>
            {roomCount} Kamar, {nightCount} Malam
          </strong>
        </div>

        <hr style={{ border: "none", borderTop: "1px dashed #E5E7EB", margin: "16px 0" }} />

        {/* Panggil fungsinya di sini! */}
        {renderPromoInputBlock("Hotel", hotelPrice)}

        <hr style={{ border: "none", borderTop: "1px dashed #E5E7EB", margin: "16px 0" }} />

        <div style={rowStyle}>
          <span style={labelStyle}>Subtotal</span>
          <strong style={valueStyle}>Rp {hotelPrice.toLocaleString("id-ID")}</strong>
        </div>
        {promoDiscount > 0 && (
          <div style={rowStyle}>
            <span style={labelStyle}>Diskon Promo</span>
            <strong style={{ ...valueStyle, color: "#16A34A" }}>
              - Rp {promoDiscount.toLocaleString("id-ID")}
            </strong>
          </div>
        )}
        <div style={rowStyle}>
          <span style={labelStyle}>Biaya Layanan</span>
          <strong style={valueStyle}>Rp {serviceFee.toLocaleString("id-ID")}</strong>
        </div>

        <div style={{ ...rowStyle, marginTop: "20px", marginBottom: "24px" }}>
          <span style={{ color: "#111827", fontSize: "16px", fontWeight: 700 }}>Total Pembayaran</span>
          <strong style={{ color: "#7B3FE4", fontSize: "20px", fontWeight: 800 }}>
            Rp {finalTotal.toLocaleString("id-ID")}
          </strong>
        </div>

        <button className="primary-btn" onClick={() => handlePayment("hotel", finalTotal)} disabled={isPaying}>
          {isPaying ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </div>
    );
  }

  return (
    <div className="payment-card" style={{ textAlign: "center", padding: "40px 20px" }}>
      <h3 style={{ border: "none", marginBottom: "10px" }}>Ringkasan Pesanan</h3>
      <p style={{ color: "#EF4444", fontSize: "14px", margin: 0, fontWeight: 500 }}>
        Data pesanan tidak ditemukan.
      </p>
    </div>
  );
};

export default PaymentSummary;