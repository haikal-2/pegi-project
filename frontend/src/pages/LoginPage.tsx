// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LoginPage: React.FC = () => {
  // --- STATE LOGIN ---
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE LOGIN OTP ---
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);

  // --- STATE LUPA PASSWORD ---
  const [forgotStep, setForgotStep] = useState(0); 
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const navigate = useNavigate();

  // --- UTILITY: SENSOR EMAIL / USERNAME ---
  const maskIdentifier = (id: string) => {
    if (!id) return "";
    if (id.includes("@")) {
      const [localPart, domain] = id.split("@");
      if (localPart.length <= 3) return id; // Kalau kepanjangan nama aslinya dikit
      return `${localPart.substring(0, 3)}${"*".repeat(localPart.length - 3)}@${domain}`;
    } else {
      if (id.length <= 4) return id;
      return `${id.substring(0, 2)}${"*".repeat(id.length - 4)}${id.substring(id.length - 2)}`;
    }
  };

  useEffect(() => {
    if ((!showOtpModal && forgotStep !== 2) || timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [showOtpModal, forgotStep, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  // --- HANDLERS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      // 🚀 JALUR VIP: Deteksi kalau yang login adalah Admin
      if (identifier === "admin@pegig.com") {
        const response = await axios.post("http://localhost:8080/api/auth/admin-login", {
          identifier, 
          password,
        });

        // Langsung simpan token dan masuk ke dashboard admin tanpa nunggu OTP
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.name || "Admin");
        // 👉 INI TAMBAHANNYA: Simpan role admin ke objek user
        localStorage.setItem("user", JSON.stringify({ role: response.data.role || "ADMIN" }));
        
        window.dispatchEvent(new Event("storage")); // Biar Navbar langsung sadar
        navigate("/admin");
        return; // Stop eksekusi biar kode bawahnya (user biasa) gak dijalanin
      }

      // 🚶‍♂️ JALUR USER BIASA: Tetap panggil endpoint login normal (Pakai OTP)
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        identifier, 
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.name || response.data.username);
        // 👉 INI TAMBAHANNYA: Simpan role ke objek user (kalau misal langsung dapet token)
        localStorage.setItem("user", JSON.stringify({ role: response.data.role || "USER" }));
        
        window.dispatchEvent(new Event("storage"));
        navigate(response.data.role === "admin" ? "/admin" : "/");
      } else if (response.data.status === "otp_sent") {
        setTimeLeft(120);
        setShowOtpModal(true);
      }
    } catch (error: any) {
      console.error("=== ERROR DARI JAVA ===", error.response);
      const serverMessage = error.response?.data?.message || error.response?.data || "";
      
      if (error.response?.status === 403 || error.response?.status === 401) {
        setErrorMsg("Email/Username atau Kata Sandi salah.");
      } else if (error.response?.status === 500) {
        setErrorMsg("Gagal login! Kredensial salah atau akun belum diverifikasi.");
      } else if (typeof serverMessage === "string" && serverMessage.includes("Kredensial")) {
        setErrorMsg(serverMessage);
      } else {
        setErrorMsg("Gagal terhubung ke server. Cek console log.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await axios.post("http://localhost:8080/api/auth/verify-otp", {
        identifier,
        otp,
      });

     if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.name || response.data.username);
        // 👉 INI TAMBAHANNYA: Simpan role ke objek user pas sukses OTP
        localStorage.setItem("user", JSON.stringify({ role: response.data.role || "USER" }));
        
        // Pemicu kustom agar file Navbar.tsx di atas sadar kalau localstorage berubah instan
        window.dispatchEvent(new Event("storage")); 

        // Baru panggil navigate
        navigate(response.data.role === "admin" ? "/admin" : "/");
      } else {
        setErrorMsg("Verifikasi gagal. Silakan coba lagi.");
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Kode OTP salah atau kedaluwarsa!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (isReset: boolean = false) => {
    setTimeLeft(120);
    if (isReset) setResetOtp(""); else setOtp("");
    setIsLoading(true);
    
    try {
      await axios.post("http://localhost:8080/api/auth/resend-otp", { 
        identifier: isReset ? resetIdentifier : identifier 
      });
      setSuccessMsg("Kode OTP baru berhasil dikirim!");
    } catch (error) {
      setErrorMsg("Gagal mengirim ulang kode.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeLeft(120);
    setForgotStep(2); 
  };

  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStep(3);
  };

  const handleForgotStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Kata sandi tidak cocok!");
      return;
    }
    alert("Kata sandi berhasil diubah! Silakan login.");
    setForgotStep(0);
    setResetIdentifier(""); setResetOtp(""); setNewPassword(""); setConfirmPassword("");
  };

  const handleOtpChange = (index: number, value: string, target: HTMLInputElement, isReset: boolean = false) => {
    if (/^\d?$/.test(value)) {
      const currentOtp = isReset ? resetOtp : otp;
      const setFn = isReset ? setResetOtp : setOtp;
      
      const newOtp = currentOtp.padEnd(6, " ").split("");
      newOtp[index] = value || " ";
      setFn(newOtp.join("").trim());

      if (value && target.nextElementSibling) {
        (target.nextElementSibling as HTMLInputElement).focus();
      }
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, isReset: boolean = false) => {
    const currentOtp = isReset ? resetOtp : otp;
    if (e.key === "Backspace" && !currentOtp[index] && e.currentTarget.previousElementSibling) {
      (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-wrapper">
        
        {/* PANEL KIRI */}
        <div className="login-left">
          <div className="login-left-fade"></div>
          <div className="login-glass-card">
            <h3>Perjalanan yang Lebih Bermakna.</h3>
            <p>Jelajahi keindahan Indonesia dengan kenyamanan. Dari hotel mewah hingga transportasi handal, Pegi siap menemani setiap langkah Anda.</p>
            <div className="login-testimonial">
              <div className="login-avatar-group">
                <div className="login-avatar"></div>
                <div className="login-avatar"></div>
                <div className="login-avatar"></div>
              </div>
              <span className="login-testimonial-text">1jt+ Wisatawan Puas</span>
            </div>
          </div>
        </div>

        {/* PANEL KANAN */}
        <div className="login-right">
          <div className="login-form-container">
            <div className="login-header">
              <h1 className="login-logo">Pegi</h1>
              <div className="login-badge">✨ Bonus 100 Poin!</div>
            </div>

            <div className="login-tabs">
              <button className="login-tab-btn active">Masuk</button>
              <button className="login-tab-btn" onClick={() => navigate("/register")}>Daftar</button>
            </div>

            {errorMsg && <div className="alert-box error">{errorMsg}</div>}
            {successMsg && <div className="alert-box success">{successMsg}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-input-group">
                <label className="login-label">Email / Username</label>
                <div className="login-input-wrapper">
                  <span className="login-icon-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </span>
                  <input type="text" className="login-control" placeholder="Masukkan Email atau Username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                </div>
              </div>

              <div className="login-input-group">
                <div className="login-input-header">
                  <label className="login-label">Kata Sandi</label>
                  <button type="button" className="login-forgot" onClick={() => setForgotStep(1)}>Lupa Kata Sandi?</button>
                </div>
                <div className="login-input-wrapper">
                  <span className="login-icon-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </span>
                  <input type={showPassword ? "text" : "password"} className="login-control" placeholder="Min. 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" className="login-icon-right" onClick={() => setShowPassword(!showPassword)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>
              </div>

              <label className="login-checkbox-group">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="login-checkbox-label">Ingat saya di perangkat ini</span>
              </label>

              <button type="submit" className="login-btn-primary" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <div className="login-divider">
              <div className="login-divider-line"></div>
              <span className="login-divider-text">ATAU MASUK DENGAN</span>
              <div className="login-divider-line"></div>
            </div>

            <button className="login-btn-social full-width" type="button">
              <FcGoogle size={22} /> Lanjutkan dengan Google
            </button>

            <p className="login-prompt">Belum punya akun? <a href="/register">Daftar Sekarang</a></p>
          </div>
        </div>
      </div>
      <Footer />

      {/* MODAL OTP LOGIN */}
      {showOtpModal && (
        <div className="modern-modal-overlay">
          <form className="modern-modal-card" onSubmit={handleVerifyAndLogin}>
            <div className="modal-icon-top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <h2>Verifikasi Login</h2>
            <p>Masukkan 6 digit kode OTP yang dikirimkan ke <strong>{maskIdentifier(identifier)}</strong></p>

            <div className="otp-inputs">
              {[...Array(6)].map((_, i) => (
                <input key={`login-${i}`} type="text" maxLength={1} value={otp[i] || ""} onChange={(e) => handleOtpChange(i, e.target.value, e.target)} onKeyDown={(e) => handleOtpKeyDown(e, i)} autoFocus={i === 0} />
              ))}
            </div>

            {timeLeft > 0 ? <p className="otp-timer">Kirim ulang dalam {formatTime(timeLeft)}</p> : <p className="otp-timer action-text" onClick={() => handleResendOtp(false)}>Kirim ulang kode OTP</p>}

            <button type="submit" className="login-btn-primary" disabled={otp.length !== 6 || isLoading}>Verifikasi & Masuk</button>
            <button type="button" className="btn-cancel" onClick={() => setShowOtpModal(false)}>Batal</button>
          </form>
        </div>
      )}

      {/* MODAL LUPA PASSWORD (3 TAHAP) */}
      {forgotStep > 0 && (
        <div className="modern-modal-overlay">
          
          {forgotStep === 1 && (
            <form className="modern-modal-card" onSubmit={handleForgotStep1}>
              <div className="modal-icon-top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4-4-4 4M12 8v8"/></svg></div>
              <h2>Pulihkan Akun</h2>
              <p>Masukkan Email atau Username terdaftar Anda untuk menerima kode OTP.</p>
              <input type="text" className="login-control mb-3" placeholder="Email atau Username" value={resetIdentifier} onChange={(e) => setResetIdentifier(e.target.value)} required autoFocus />
              <button type="submit" className="login-btn-primary">Kirim Kode OTP</button>
              <button type="button" className="btn-cancel" onClick={() => setForgotStep(0)}>Batal</button>
            </form>
          )}

          {forgotStep === 2 && (
            <form className="modern-modal-card" onSubmit={handleForgotStep2}>
              <div className="modal-icon-top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <h2>Verifikasi Kode</h2>
              <p>Masukkan 6 digit kode yang dikirim ke <strong>{maskIdentifier(resetIdentifier)}</strong></p>
              <div className="otp-inputs">
                {[...Array(6)].map((_, i) => (
                  <input key={`reset-${i}`} type="text" maxLength={1} value={resetOtp[i] || ""} onChange={(e) => handleOtpChange(i, e.target.value, e.target, true)} onKeyDown={(e) => handleOtpKeyDown(e, i, true)} autoFocus={i === 0} />
                ))}
              </div>
              {timeLeft > 0 ? <p className="otp-timer">Kirim ulang dalam {formatTime(timeLeft)}</p> : <p className="otp-timer action-text" onClick={() => handleResendOtp(true)}>Kirim ulang kode OTP</p>}
              <button type="submit" className="login-btn-primary" disabled={resetOtp.length !== 6}>Lanjut Buat Sandi</button>
              <button type="button" className="btn-cancel" onClick={() => setForgotStep(0)}>Batal</button>
            </form>
          )}

          {forgotStep === 3 && (
            <form className="modern-modal-card" onSubmit={handleForgotStep3}>
              <div className="modal-icon-top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
              <h2>Sandi Baru</h2>
              <p>Buat kata sandi baru yang kuat untuk akun Anda.</p>
              <div className="login-input-wrapper mb-2">
                <input type={showNewPassword ? "text" : "password"} className="login-control" placeholder="Kata Sandi Baru" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoFocus />
                <button type="button" className="login-icon-right" onClick={() => setShowNewPassword(!showNewPassword)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle></svg></button>
              </div>
              <div className="login-input-wrapper mb-3">
                <input type={showNewPassword ? "text" : "password"} className="login-control" placeholder="Konfirmasi Sandi Baru" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="login-btn-primary">Simpan & Selesai</button>
              <button type="button" className="btn-cancel" onClick={() => setForgotStep(0)}>Batal</button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default LoginPage;