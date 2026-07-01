package com.pegi.backend.repository;

import com.pegi.backend.entity.Review;
import com.pegi.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Ambil semua review untuk hotel tertentu
    List<Review> findByHotelId(Long hotelId);

    // Hitung jumlah review yang dibuat oleh user (untuk logika badge)
    long countByUser(User user);
}
