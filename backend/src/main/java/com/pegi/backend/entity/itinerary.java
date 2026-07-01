package com.pegi.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@Table(name = "itineraries")
public class itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;

    private LocalDate date;
    private LocalTime time;
    private String title;          // cth: "Naik Kereta Argo Anggrek"
    private String status;         // cth: "Terjadwal", "Selesai", "Dibatalkan"
    private String statusColor;    // cth: "purple", "green", "red" (untuk styling frontend)
    private String iconType;       // cth: "train", "building", "car"
    private String details;        // deskripsi tambahan
    private String image;          // url gambar opsional
}