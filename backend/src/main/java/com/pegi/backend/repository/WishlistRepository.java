package com.pegi.backend.repository;

import com.pegi.backend.entity.Wishlist;
import com.pegi.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    // Ambil semua wishlist milik user tertentu
    List<Wishlist> findByUser(User user);

    // Cari wishlist berdasarkan ID dan user (untuk validasi kepemilikan saat delete)
    Optional<Wishlist> findByIdAndUser(Long id, User user);
}
