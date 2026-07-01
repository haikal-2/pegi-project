package com.pegi.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.pegi.backend.entity.enums.PromoStatus;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "promos")
public class Promo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String code;
    private String category;       // "Tiket Pesawat" / "Hotel" / "Grup Wisata" / "Semua Kategori"
    private Double discountPercent; // contoh: 20.0 artinya 20%

    @Enumerated(EnumType.STRING)
    private PromoStatus status;    // AKTIF, DRAFT, BERAKHIR

    private LocalDate validUntil;

    private Integer usageCount = 0;
    private Integer usageLimit;

    private String img;
}