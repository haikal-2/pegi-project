package com.pegi.backend.service;

import com.pegi.backend.entity.OtpVerification;
import com.pegi.backend.entity.Role;
import com.pegi.backend.entity.User;
import com.pegi.backend.entity.enums.RoleType;
import com.pegi.backend.repository.OtpVerificationRepository;
import com.pegi.backend.repository.RoleRepository;
import com.pegi.backend.repository.UserRepository;
import com.pegi.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EmailOtpService emailOtpService;

    // Helper method buat nyari user dari identifier (email / username)
    private User getUserByIdentifier(String identifier) {
        return userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("Akun tidak ditemukan!"));
    }

    // ===== TAHAP 1 REGISTER (Minta OTP Awal) =====
    public Map<String, Object> requestOtp(Map<String, String> request) {
        String email = request.get("email");
        String username = request.get("username");

        // Validasi Email & Username
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email sudah terdaftar! Harap gunakan email lain.");
        }
        if (username != null && userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username sudah digunakan! Harap cari username lain.");
        }

        String otpCode = String.format("%06d", new Random().nextInt(1_000_000));

        OtpVerification otp = OtpVerification.builder()
                .email(email)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        otpVerificationRepository.save(otp);

        emailOtpService.sendOtpEmail(email, otpCode);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "otp_sent");
        response.put("message", "Kode OTP pendaftaran telah dikirim ke email kamu");
        response.put("email", email);
        return response;
    }

    // ===== REGISTER (Ditambah field baru) =====
    @Transactional
    public Map<String, Object> register(Map<String, String> request) {
        String email = request.get("email");
        String username = request.get("username");
        String fullName = request.get("fullName");
        String name = request.get("name");
        String phone = request.get("phone");
        String password = request.get("password");
        String otpCode = request.get("otp"); // Nangkep OTP dari frontend

        if (userRepository.existsByEmail(email)) throw new RuntimeException("Email sudah terdaftar");
        if (userRepository.existsByUsername(username)) throw new RuntimeException("Username sudah digunakan");

        // 1. VALIDASI OTP DULU SEBELUM BIKIN USER
        OtpVerification otp = otpVerificationRepository
                .findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException("Kode OTP tidak ditemukan"));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Kode OTP kedaluwarsa");
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Kode OTP salah");
        }

        // 2. SAVE USER KE DATABASE
        Role userRole = roleRepository.findByName(RoleType.USER)
                .orElseThrow(() -> new RuntimeException("Role USER tidak ditemukan. Jalankan DataSeeder dulu!"));

        User user = User.builder()
                .fullName(fullName)
                .username(username)
                .name(name)
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode(password))
                .role(userRole)
                .isVerified(true) // Lolos verifikasi OTP
                .build();

        userRepository.save(user);

        // Tandai OTP sudah terpakai
        otp.setVerified(true);
        otpVerificationRepository.save(otp);

        // 3. GENERATE TOKEN BIAR LANGSUNG LOGIN
        String token = jwtUtil.generateToken(user.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Registrasi berhasil");
        response.put("token", token); // 👈 Ini penting buat frontend!
        response.put("name", user.getName());
        response.put("username", user.getUsername());
        response.put("role", user.getRole().getName().name());
        
        return response;
    }

    // ===== LOGIN — TAHAP 1: Validasi & Kirim OTP =====
    public Map<String, Object> login(Map<String, String> request) {
        String identifier = request.get("identifier"); // Bisa email atau username
        String password = request.get("password");

        // Cari user aslinya biar tau email yang bener apa
        User user = getUserByIdentifier(identifier);

        try {
            // Spring Security authenticate pakai field "username" di entitas User
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), password)
            );
        } catch (Exception e) {
            System.err.println("!!! GAGAL LOGIN BRO !!! Alasan dari Java: " + e.getMessage());
            throw new BadCredentialsException("Email atau Password salah!");
        }

        if (user.getRole().getName() == RoleType.ADMIN) {
            String token = jwtUtil.generateToken(user.getUsername());
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("token", token);
            response.put("role", "admin");
            return response;
        }

        // Kalau USER biasa, kirim OTP ke EMAIL ASLI nya (bukan ke identifier kalau dia ngetik username)
        String realEmail = user.getEmail();
        String otpCode = String.format("%06d", new Random().nextInt(1_000_000));

        OtpVerification otp = OtpVerification.builder()
                .email(realEmail)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        otpVerificationRepository.save(otp);

        emailOtpService.sendOtpEmail(realEmail, otpCode);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "otp_sent");
        response.put("message", "Kode OTP dikirim ke email");
        return response;
    }

    // ===== LOGIN — TAHAP 2: Verifikasi OTP =====
    public Map<String, Object> verifyOtp(Map<String, String> request) {
        String identifier = request.get("identifier");
        String otpCode = request.get("otp"); 

        User user = getUserByIdentifier(identifier);
        String realEmail = user.getEmail(); // Verifikasi pakai email aslinya

        OtpVerification otp = otpVerificationRepository
                .findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(realEmail)
                .orElseThrow(() -> new RuntimeException("Kode OTP tidak ditemukan"));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Kode OTP kedaluwarsa");
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Kode OTP salah");
        }

        otp.setVerified(true);
        otpVerificationRepository.save(otp);

        // Generate token pakai username
        String token = jwtUtil.generateToken(user.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("token", token);
        response.put("name", user.getName());
        response.put("username", user.getUsername());
        response.put("role", user.getRole().getName().name());
        return response;
    }

    // ===== RESEND OTP =====
    public Map<String, Object> resendOtp(Map<String, String> request) {
        String identifier = request.get("identifier");
        
        User user = getUserByIdentifier(identifier);
        String realEmail = user.getEmail();

        String otpCode = String.format("%06d", new Random().nextInt(1_000_000));

        OtpVerification otp = OtpVerification.builder()
                .email(realEmail)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        otpVerificationRepository.save(otp);

        emailOtpService.sendOtpEmail(realEmail, otpCode);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "otp_sent");
        return response;
    }
    // ===== PINTU BELAKANG KHUSUS ADMIN (HARDCODE) =====
    // ===== PINTU BELAKANG KHUSUS ADMIN (HARDCODE) =====
public Map<String, Object> adminDirectLogin(Map<String, String> request) {
    String identifier = request.get("identifier");
    String password = request.get("password");

    if ("admin@pegig.com".equals(identifier) && "admin123".equals(password)) {
        
        // ✅ Cari user admin di database agar dapat username aslinya
        User adminUser = userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() -> new BadCredentialsException("Akun admin tidak ditemukan di database"));

        // ✅ Generate token pakai username, konsisten dengan login() biasa
        String token = jwtUtil.generateToken(adminUser.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("name", adminUser.getName() != null ? adminUser.getName() : "Admin Pegi");
        response.put("role", "admin");
        return response;
    }

    throw new BadCredentialsException("Kredensial Admin Salah!");
}
}