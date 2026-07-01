package com.pegi.backend.entity;

import com.pegi.backend.entity.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name= "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Relasi ke Hotel (nullable = true berarti boleh kosong)
    @ManyToOne
    @JoinColumn(name = "hotel_id", nullable = true)
    private Hotel hotel;

    // Tambahkan relasi ke Destination di sini
    @ManyToOne
    @JoinColumn(name = "destination_id", nullable = true)
    private Destination destination; // Asumsi kamu sudah membuat file Destination.java

    private LocalDateTime bookingDate;
    private Integer totalGuests;
    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;
}