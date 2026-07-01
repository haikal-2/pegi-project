import React, { useState } from "react";

interface Traveler {
  seat: number;
  fullName: string;
  identityNumber: string;
}

interface Props {
  seats: number[];
}

const TravelerForm: React.FC<Props> = ({ seats }) => {
  // State otomatis terbuat sebanyak jumlah kursi/tiket yang dipesan
  const [travelers, setTravelers] = useState<Traveler[]>(
    seats.map((seat) => ({
      seat,
      fullName: "",
      identityNumber: "",
    }))
  );

  const handleChange = (index: number, field: keyof Traveler, value: string) => {
    const updated = [...travelers];
    updated[index] = { ...updated[index], [field]: value };
    setTravelers(updated);
  };

  // Kalau tidak ada kursi yang dilempar, sembunyikan form ini
  if (!seats || seats.length === 0) return null;

  return (
    <div style={{ background: "#ffffff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px -10px rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column", width: "100%", boxSizing: "border-box" }}>
      <h3 style={{ margin: "0 0 24px 0", fontSize: "1.25rem", color: "#0f172a", fontWeight: "bold", borderBottom: "2px solid #f8f5ff", paddingBottom: "16px" }}>
        👥 Detail Traveler
      </h3>

      {/* Melakukan looping form sesuai jumlah traveler/kursi */}
      {travelers.map((traveler, index) => (
        <div key={traveler.seat || index} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "24px", borderRadius: "14px", marginBottom: index === travelers.length - 1 ? "0" : "24px", display: "flex", flexDirection: "column" }}>
          
          {/* Header Card (Traveler 1, Traveler 2, dst) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "16px" }}>
            <h4 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a", fontWeight: "bold" }}>Traveler {index + 1}</h4>
            <span style={{ background: "#f3e8ff", color: "#7b3fe4", padding: "6px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold", whiteSpace: "nowrap" }}>
              Kursi {traveler.seat}
            </span>
          </div>

          {/* Form Inputs (Nama & NIK) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", width: "100%" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>Nama Lengkap</label>
              <input
                type="text"
                placeholder="Sesuai KTP / Paspor"
                value={traveler.fullName}
                onChange={(e) => handleChange(index, "fullName", e.target.value)}
                style={{ 
                  height: "48px", borderRadius: "10px", border: "1px solid #cbd5e1", 
                  padding: "0 16px", fontSize: "0.95rem", outline: "none", 
                  width: "100%", boxSizing: "border-box", background: "#fff", color: "#0f172a" 
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>Nomor Identitas</label>
              <input
                type="text"
                placeholder="NIK / Paspor"
                value={traveler.identityNumber}
                onChange={(e) => handleChange(index, "identityNumber", e.target.value)}
                style={{ 
                  height: "48px", borderRadius: "10px", border: "1px solid #cbd5e1", 
                  padding: "0 16px", fontSize: "0.95rem", outline: "none", 
                  width: "100%", boxSizing: "border-box", background: "#fff", color: "#0f172a" 
                }}
              />
            </div>

          </div>

        </div>
      ))}
    </div>
  );
};

export default TravelerForm;