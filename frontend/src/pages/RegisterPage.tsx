import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); 

  const navigate = useNavigate();

  useEffect(() => {
    if (!showOtpModal || timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [showOtpModal, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  const maskIdentifier = (id: string) => {
    if (!id) return "";
    if (id.includes("@")) {
      const [localPart, domain] = id.split("@");
      if (localPart.length <= 3) return id;
      return `${localPart.substring(0, 3)}${"*".repeat(localPart.length - 3)}@${domain}`;
    }
    return id;
  };

  const handleResendOtp = async () => {
    setTimeLeft(120); 
    setOtp(""); 
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email }), 
      });

      if (!response.ok) {
        setErrorMsg("Gagal mengirim ulang kode. Silakan coba lagi.");
      } else {
        setSuccessMsg("Kode OTP baru berhasil dikirim!");
      }
    } catch (error) {
      setErrorMsg("Tidak terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 LOGIKA AUTO-ADVANCE OTP
  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = otp.split("");
      newOtp[index] = value;
      setOtp(newOtp.join(""));

      // Pindah ke kotak selanjutnya jika ada input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // 🌟 LOGIKA BACKSPACE OTP
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Kata sandi tidak cocok!");
      return;
    }
    if (!acceptTerms) {
      setErrorMsg("Anda harus menyetujui Syarat & Ketentuan.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      });

      const responseText = await response.text();
      let errorData: any = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (jsonErr) {
        errorData = { message: responseText };
      }

      if (response.ok) {
        if (errorData.status === "error") {
          setErrorMsg(errorData.message);
          setIsLoading(false);
          return;
        }
        setTimeLeft(120); 
        setShowOtpModal(true); 
      } else {
        setErrorMsg(errorData.message || "Gagal mengirim OTP.");
      }
    } catch (error) {
      setErrorMsg("Gagal terhubung ke Server. Pastikan backend Anda sudah aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 VERIFIKASI SEKALIGUS LANGSUNG LOGIN
  const handleVerifyAndRegister = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName, name, username, email, phone, password, otp
        }),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {}

      if (response.ok && data.status === "success") {
        // Simpan token ke localStorage
        if (data.token) {
          localStorage.setItem("token", data.token);
          // Simpan data user tambahan kalau mau dipake di Navbar
          localStorage.setItem("user", JSON.stringify({
            name: data.name,
            username: data.username,
            role: data.role
          }));
        }

        setShowOtpModal(false);
        navigate("/"); // Langsung lempar ke Dashboard User
      } else {
        setErrorMsg(data.message || "Registrasi gagal, periksa kembali data Anda.");
        setShowOtpModal(false); 
      }
    } catch (error) {
      setErrorMsg("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="register-wrapper">
        <div className="register-left">
          <div className="register-left-fade"></div>
          <div className="glass-card">
            <h3>Perjalanan yang Lebih Bermakna.</h3>
            <p>Jelajahi keindahan Indonesia dengan kenyamanan yang belum pernah ada sebelumnya. Dari hotel mewah hingga transportasi yang handal, Pegi siap menemani setiap langkah Anda.</p>
            <div className="testimonial-info">
              <div className="avatar-group">
                <div className="avatar"></div>
                <div className="avatar"></div>
                <div className="avatar"></div>
              </div>
              <span className="testimonial-text">1jt+ Wisatawan Puas</span>
            </div>
          </div>
        </div>

        <div className="register-right">
          <div className="form-container">
            <div className="form-header">
              <h1 className="logo-text">Pegi</h1>
              <div className="badge-bonus">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                Bonus 100 Poin Pengguna Baru!
              </div>
            </div>

            <div className="auth-tabs">
              <button className="tab-btn" onClick={() => navigate("/login")}>
                Masuk
              </button>
              <button className="tab-btn active">Daftar</button>
            </div>

            {errorMsg && (
              <div style={{ color: "red", marginBottom: "15px", fontSize: "14px", backgroundColor: "#ffe6e6", padding: "10px", borderRadius: "5px" }}>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div style={{ color: "green", marginBottom: "15px", fontSize: "14px", backgroundColor: "#e6ffe6", padding: "10px", borderRadius: "5px" }}>
                {successMsg}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              
              <div className="input-group">
                <label className="input-label">Nama Lengkap</label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </span>
                  <input type="text" className="form-control" placeholder="Nama lengkap Anda" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
              </div>

              <div className="input-grid">
                <div className="input-group">
                  <label className="input-label">Nama Panggilan</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </span>
                    <input type="text" className="form-control" placeholder="Panggilan" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Username</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </span>
                    <input type="text" className="form-control" placeholder="username_unik" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="input-grid">
                <div className="input-group">
                  <label className="input-label">Alamat Email</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </span>
                    <input type="email" className="form-control" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">No. Telepon</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </span>
                    <input type="tel" className="form-control" placeholder="0812xxx" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Kata Sandi</label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </span>
                  <input type={showPassword ? "text" : "password"} className="form-control" placeholder="Min. 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Konfirmasi Kata Sandi</label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </span>
                  <input type={showConfirmPassword ? "text" : "password"} className="form-control" placeholder="Ketik ulang kata sandi" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  <button type="button" className="input-icon-right" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>
              </div>

              <label className="checkbox-group">
                <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} required />
                <span className="checkbox-label">
                  Saya menyetujui <a href="#terms" className="text-purple">Syarat & Ketentuan</a> serta <a href="#privacy" className="text-purple">Kebijakan Privasi</a>
                </span>
              </label>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Daftar Akun Baru"}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">ATAU DAFTAR DENGAN</span>
              <div className="divider-line"></div>
            </div>

            <div className="social-login-group">
              <button className="btn-social" type="button" style={{ width: '100%' }}>
                <FcGoogle /> Google
              </button>
              {/* Tombol Apple udah dihilangkan */}
            </div>

            <p className="login-prompt">
              Sudah punya akun? <a href="/login">Masuk Sekarang</a>
            </p>
          </div>
        </div>
      </div>

      {/* MODAL OTP */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <div className="otp-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Verifikasi Pendaftaran</h2>
            <p style={{ fontSize: "14px", color: "#4B5563" }}>
              Masukkan 6 digit kode OTP yang telah dikirimkan ke email Anda <br/>
              <strong>({maskIdentifier(email)})</strong>
            </p>

            <div className="otp-inputs">
              {[...Array(6)].map((_, i) => (
                <input 
                  key={i} 
                  id={`otp-input-${i}`} /* ID penting buat auto-focus */
                  type="text" 
                  maxLength={1} 
                  value={otp[i] || ""} 
                  onChange={(e) => handleOtpChange(i, e)} 
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isLoading} 
                />
              ))}
            </div>

            {timeLeft > 0 ? (
              <p className="otp-timer">Kirim ulang kode dalam {formatTime(timeLeft)}</p>
            ) : (
              <p className="otp-timer" style={{ cursor: "pointer", color: "#7B3FE4", textDecoration: "underline" }} onClick={handleResendOtp}>
                Kirim ulang kode OTP
              </p>
            )}

            <button className="btn-verify-create" disabled={otp.length !== 6 || isLoading} onClick={handleVerifyAndRegister}>
              {isLoading ? "Memverifikasi..." : "Verifikasi & Buat Akun"}
            </button>

            <button className="btn-back-register" onClick={() => setShowOtpModal(false)} disabled={isLoading}>
              ← Kembali
            </button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default RegisterPage;