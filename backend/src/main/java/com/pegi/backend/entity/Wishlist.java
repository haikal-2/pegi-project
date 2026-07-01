package com.pegi.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "wishlists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ID hotel atau destinasi dari Backend 2 (Haris)
    @Column(nullable = false)
    private Long itemId;

    // "hotel" atau "destination"
    @Column(nullable = false)
    private String itemType;

    // Nama item (disimpan saat wishlist dibuat agar tidak perlu panggil service lain)
    private String itemName;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private String itemImage;
    private String itemLocation;
}
