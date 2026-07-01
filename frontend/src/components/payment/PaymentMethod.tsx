import React from "react";

interface Props {
  selectedMethod: string;
  setSelectedMethod: (method: string) => void;
}

const PaymentMethod: React.FC<Props> = ({ selectedMethod, setSelectedMethod }) => {
  // ID ini SUDAH BENAR dan sesuai dengan dokumentasi Midtrans
  // TODO: Tinggal lu ganti bagian 'logoSrc' dengan alamat gambar asli lu nanti
  const methods = [
    { id: "bca_va", title: "Transfer Bank BCA", subtitle: "Virtual Account", logoSrc: "/bca.png" },
    { id: "bni_va", title: "Transfer Bank BNI", subtitle: "Virtual Account", logoSrc: "/bni.png" },
    { id: "echannel", title: "Transfer Bank Mandiri", subtitle: "Virtual Account", logoSrc: "/mandiri.jpg" },
    { id: "gopay", title: "GoPay", subtitle: "E-Wallet", logoSrc: "/gopay.png" },
    { id: "qris", title: "QRIS", subtitle: "Semua E-Wallet", logoSrc: "/qris.png" },
  ];

  return (
    <div style={{ background: "#ffffff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px -10px rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column", width: "100%", boxSizing: "border-box" }}>
      
      <h3 style={{ margin: "0 0 24px 0", fontSize: "1.25rem", color: "#0f172a", fontWeight: "bold", borderBottom: "2px solid #f8f5ff", paddingBottom: "16px" }}>
        💳 Metode Pembayaran
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            style={{ 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              padding: "14px 16px", // Dikecilin biar lebih slim/compact
              border: selectedMethod === method.id ? "2px solid #7B3FE4" : "1px solid #cbd5e1", 
              borderRadius: "12px",
              backgroundColor: selectedMethod === method.id ? "#f8f5ff" : "#ffffff",
              transition: "all 0.2s ease-in-out",
              boxSizing: "border-box",
              width: "100%"
            }}
          >
            <input
              type="radio"
              checked={selectedMethod === method.id}
              readOnly 
              style={{ marginRight: "16px", width: "18px", height: "18px", accentColor: "#7B3FE4", cursor: "pointer", flexShrink: 0, margin: 0 }}
            />
            
            {/* WADAH LOGO GAMBAR */}
            <div style={{ 
              width: "48px", height: "32px", marginRight: "16px", display: "flex", 
              justifyContent: "center", alignItems: "center", flexShrink: 0 
            }}>
              <img 
                src={method.logoSrc} 
                alt={method.title} 
                style={{ width: "100%", height: "100%", objectFit: "contain" }} 
              />
            </div>

            {/* TEKS INFO METODE BAYAR */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <strong style={{ color: "#0f172a", fontSize: "0.95rem", fontWeight: 600 }}>
                {method.title}
              </strong>
              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                {method.subtitle}
              </span>
            </div>
            
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default PaymentMethod;