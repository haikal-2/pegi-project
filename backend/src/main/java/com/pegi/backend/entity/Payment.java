package com.pegi.backend.entity;

import com.pegi.backend.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", referencedColumnName = "id")
    private Booking booking;

    // Kode transaksi unik yang ditampilkan ke user & admin, mis. "PEGI-1719..."
    private String txId;

    // Snapshot data supaya admin gak perlu join ke tabel lain untuk tampilkan tabel verifikasi
    private String customerName;

    // Hotel, Destinasi, Transportasi, Grup Wisata
    private String serviceType;

    private String serviceName;

    private Double amount;

    private String paymentMethod;

    private LocalDateTime paymentDate;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    // URL bukti transfer (kalau manual transfer; untuk Midtrans bisa kosong/placeholder)
    private String proofImg;

    private Boolean isSplitBill;

    private Double totalGroupBill;

    private Integer splitCount;
}