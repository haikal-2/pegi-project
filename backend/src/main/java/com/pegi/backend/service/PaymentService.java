package com.pegi.backend.service;

import com.pegi.backend.entity.Payment;
import com.pegi.backend.entity.Booking;
import com.pegi.backend.entity.enums.PaymentStatus;
import com.pegi.backend.repository.BookingRepository;
import com.pegi.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TicketService ticketService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    public Payment processPayment(Payment paymentRequest) {

        paymentRequest.setPaymentDate(LocalDateTime.now());
        if (paymentRequest.getStatus() == null) {
            paymentRequest.setStatus(PaymentStatus.PENDING);
        }
        if (paymentRequest.getTxId() == null) {
            paymentRequest.setTxId("PEGI-" + System.currentTimeMillis());
        }
        Payment savedPayment = paymentRepository.save(paymentRequest);

        if (savedPayment.getBooking() != null) {
            long bookingId = savedPayment.getBooking().getId();
            Booking relatedBooking = bookingRepository.findById(bookingId).orElse(null);
            // logika konfirmasi booking & kirim tiket dibiarkan sesuai kode asli (masih di-comment)
        }

        return savedPayment;
    }

    // Dipanggil dari /api/payments/charge setelah snap token berhasil dibuat,
    // supaya transaksi langsung tercatat dan bisa diverifikasi admin
    public Payment recordChargeAttempt(String txId, Double amount, String paymentMethod,
                                        String customerName, String serviceType, String serviceName) {
        Payment payment = new Payment();
        payment.setTxId(txId);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCustomerName(customerName != null ? customerName : "Guest");
        payment.setServiceType(serviceType != null ? serviceType : "Lainnya");
        payment.setServiceName(serviceName != null ? serviceName : "-");
        payment.setProofImg("https://via.placeholder.com/400x250?text=Bukti+Midtrans");
        return paymentRepository.save(payment);
    }

    // GET /api/admin/payments
    public List<Map<String, Object>> getAllPaymentsForAdmin() {
        return paymentRepository.findAll().stream()
                .map(this::toAdminMap)
                .toList();
    }

    // PUT /api/admin/payments/{id}
    public Map<String, Object> updateStatus(Long id, String statusLabel) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaksi tidak ditemukan"));

        PaymentStatus status = labelToStatus(statusLabel);
        payment.setStatus(status);
        paymentRepository.save(payment);
        return toAdminMap(payment);
    }

    private PaymentStatus labelToStatus(String label) {
        return switch (label) {
            case "Berhasil" -> PaymentStatus.PAID;
            case "Ditolak" -> PaymentStatus.REJECTED;
            default -> PaymentStatus.PENDING;
        };
    }

    private String statusToLabel(PaymentStatus status) {
        if (status == null) return "Menunggu";
        return switch (status) {
            case PAID -> "Berhasil";
            case REJECTED, FAILED -> "Ditolak";
            default -> "Menunggu";
        };
    }

    private Map<String, Object> toAdminMap(Payment p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId().toString());
        map.put("txId", p.getTxId() != null ? p.getTxId() : ("PEGI-" + p.getId()));
        map.put("customerName", p.getCustomerName() != null ? p.getCustomerName() : "Guest");
        map.put("serviceType", p.getServiceType() != null ? p.getServiceType() : "Lainnya");
        map.put("serviceName", p.getServiceName() != null ? p.getServiceName() : "-");
        map.put("amount", "Rp " + (p.getAmount() != null ? String.format("%,.0f", p.getAmount()).replace(",", ".") : "0"));
        map.put("date", p.getPaymentDate() != null ? p.getPaymentDate().format(DATE_FMT) : "-");
        map.put("status", statusToLabel(p.getStatus()));
        map.put("proofImg", p.getProofImg() != null ? p.getProofImg() : "https://via.placeholder.com/400x250?text=Bukti+Bayar");
        map.put("isSplitBill", p.getIsSplitBill() != null && p.getIsSplitBill());
        map.put("totalGroupBill", p.getTotalGroupBill() != null
                ? "Rp " + String.format("%,.0f", p.getTotalGroupBill()).replace(",", ".") : null);
        map.put("splitCount", p.getSplitCount());
        return map;
    }
}