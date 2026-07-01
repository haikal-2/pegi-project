package com.pegi.backend.repository;

import com.pegi.backend.entity.Badge;
import com.pegi.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    // Ambil semua badge milik user
    List<Badge> findByUser(User user);

    // Cek apakah user sudah punya badge tertentu (hindari duplikasi)
    boolean existsByUserAndName(User user, String name);
}
