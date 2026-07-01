import React, { useState } from "react";
import axios from "axios";

const ContactForm: React.FC = () => {
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
  });
  
  // State untuk ngatur pilihan toggle dan loading API
  const [useProfile, setUseProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const handleChange = (field: string, value: string) => {
    setContact({
      ...contact,
      [field]: value,
    });
  };

  // Fungsi buat nembak API ke Java
  const handleToggleProfile = async (checked: boolean) => {
    setUseProfile(checked);
    
    if (checked) {
      setLoadingProfile(true);
      try {
        // Ambil token dari brankas browser
        const token = localStorage.getItem("token");
        
        // Nembak ke endpoint /users/me di Backend Java
        const res = await axios.get("http://localhost:8080/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Masukin data balasan dari Java ke dalam form
        setContact({
          name: res.data.fullName || res.data.name || "",
          email: res.data.email || "",
          // Coba ambil phone atau phoneNumber sesuai nama variabel di entitas Java lu
          phone: res.data.phone || res.data.phoneNumber || "", 
        });
      } catch (err) {
        console.error("Gagal mengambil data profil:", err);
        alert("Sesi habis atau gagal mengambil data profil. Silakan isi manual.");
        setUseProfile(false); // Balikin ke manual kalau gagal
      } finally {
        setLoadingProfile(false);
      }
    } else {
      // Kalau user pilih "Isi manual", kosongin lagi formnya
      setContact({ name: "", email: "", phone: "" });
    }
  };

  return (
    <div style={{ background: "#ffffff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px -10px rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column", width: "100%", boxSizing: "border-box" }}>
      <h3 style={{ margin: "0 0 20px 0", fontSize: "1.25rem", color: "#0f172a", fontWeight: "bold", borderBottom: "2px solid #f8f5ff", paddingBottom: "16px" }}>
         Detail Kontak Pemesan
      </h3>

      {/* RADIO BUTTONS: Gunakan Data Profil vs Manual */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "24px", alignItems: "center", width: "100%" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", color: "#475569", fontWeight: 600, margin: 0, whiteSpace: "nowrap" }}>
          <input
            type="radio"
            name="contact-profile-toggle"
            checked={useProfile}
            onChange={() => handleToggleProfile(true)}
            disabled={loadingProfile}
            style={{ width: "18px", height: "18px", margin: 0, cursor: "pointer", accentColor: "#7b3fe4" }}
          />
          {loadingProfile ? "Mengambil data..." : "Gunakan data profil saya"}
        </label>
        
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", color: "#475569", fontWeight: 600, margin: 0, whiteSpace: "nowrap" }}>
          <input
            type="radio"
            name="contact-profile-toggle"
            checked={!useProfile}
            onChange={() => handleToggleProfile(false)}
            disabled={loadingProfile}
            style={{ width: "18px", height: "18px", margin: 0, cursor: "pointer", accentColor: "#7b3fe4" }}
          />
          Isi data manual
        </label>
      </div>

      {/* FORM INPUTS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>Nama Lengkap</label>
          <input
            type="text"
            placeholder="Contoh: Budi Santoso"
            value={contact.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={useProfile || loadingProfile}
            style={{ 
              height: "48px", borderRadius: "10px", border: "1px solid #cbd5e1", padding: "0 16px", 
              fontSize: "0.95rem", color: useProfile || loadingProfile ? "#94a3b8" : "#0f172a", 
              outline: "none", width: "100%", boxSizing: "border-box", 
              background: useProfile || loadingProfile ? "#f1f5f9" : "#fff" 
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>Email</label>
          <input
            type="email"
            placeholder="email@contoh.com"
            value={contact.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={useProfile || loadingProfile}
            style={{ 
              height: "48px", borderRadius: "10px", border: "1px solid #cbd5e1", padding: "0 16px", 
              fontSize: "0.95rem", color: useProfile || loadingProfile ? "#94a3b8" : "#0f172a", 
              outline: "none", width: "100%", boxSizing: "border-box", 
              background: useProfile || loadingProfile ? "#f1f5f9" : "#fff" 
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        <label style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>Nomor Telepon</label>
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <div style={{ 
            minWidth: "70px", padding: "0 16px", background: "#f8fafc", border: "1px solid #cbd5e1", 
            borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", 
            fontWeight: 600, color: "#475569", height: "48px", boxSizing: "border-box" 
          }}>
            +62
          </div>
          <input
            type="text"
            placeholder="81234567890"
            value={contact.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={useProfile || loadingProfile}
            style={{ 
              flex: 1, height: "48px", borderRadius: "10px", border: "1px solid #cbd5e1", 
              padding: "0 16px", fontSize: "0.95rem", color: useProfile || loadingProfile ? "#94a3b8" : "#0f172a", 
              outline: "none", boxSizing: "border-box", 
              background: useProfile || loadingProfile ? "#f1f5f9" : "#fff" 
            }}
          />
        </div>
      </div>
      
    </div>
  );
};

export default ContactForm;