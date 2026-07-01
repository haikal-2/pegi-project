package com.pegi.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    
    public void sendBookingConfirmation(String toEmail, String passengerName, String ticketCode) {
        SimpleMailMessage message = new SimpleMailMessage();
            
        message.setTo(toEmail);
        message.setSubject("Konfirmasi Pemesanan TravelGo - Berhasil!");
        
        String emailBody = "Halo " + passengerName + ",\n\n"
                + "Terima kasih telah memesan melalui TravelGo!\n"
                + "Pembayaran Anda telah kami terima. Berikut adalah kode tiket Anda:\n\n"
                + "KODE TIKET: " + ticketCode + "\n\n"
                + "Tunjukkan kode ini (atau QR Code di aplikasi) kepada petugas saat keberangkatan.\n\n"
                + "Semoga perjalanan Anda menyenangkan!\n"
                + "Tim TravelGo";
    
        message.setText(emailBody);
        mailSender.send(message);
    }
}