package com.pegi.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "split_bills")
public class SplitBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;

    // --- FIELD BARU yang dibutuhkan frontend ---
    private String title;          // cth: "Tiket Kereta Argo Anggrek"
    private String category;       // cth: "bus", "train", "ticket", "hotel", "car", "other"
    private String paidBy;         // nama yang membayar duluan
    private LocalDate billDate;    // tanggal transaksi
    private String notes;          // catatan opsional

    private Double totalAmount;

    @OneToMany(mappedBy = "splitBill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillMember> members;

    @CreationTimestamp
    private LocalDateTime createdAt;
}