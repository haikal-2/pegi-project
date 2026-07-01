package com.pegi.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailOtpService {

    private final JavaMailSender mailSender;

    // Kirim kode OTP ke email user
    public void sendOtpEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Kode Verifikasi Login - Pegi");
        message.setText(
                "Halo!\n\n" +
                "Kode verifikasi (OTP) kamu adalah:\n\n" +
                otpCode + "\n\n" +
                "Kode ini berlaku selama 5 menit.\n" +
                "Jangan bagikan kode ini ke siapapun, termasuk pihak yang mengaku dari Pegi.\n\n" +
                "Salam,\nTim Pegi"
        );
        mailSender.send(message);
    }
}
