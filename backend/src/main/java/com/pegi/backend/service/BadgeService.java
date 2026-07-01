package com.pegi.backend.service;

import com.pegi.backend.entity.Badge;
import com.pegi.backend.entity.User;
import com.pegi.backend.repository.BadgeRepository;
import com.pegi.backend.repository.GroupMemberRepository;
import com.pegi.backend.repository.ReviewRepository;
import com.pegi.backend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final ReviewRepository reviewRepository;
    private final WishlistRepository wishlistRepository;
    private final GroupMemberRepository groupMemberRepository;

    // Dipanggil setiap kali ada aksi baru (review, wishlist, join group)
    public void checkAndAwardBadges(User user) {
        long reviewCount  = reviewRepository.countByUser(user);
        long wishlistCount = wishlistRepository.findByUser(user).size();
        long groupCount   = groupMemberRepository.countByUser(user);

        // Badge pertama kali buat review
        if (reviewCount >= 1) {
            awardBadge(user, "Kritikus Pertama",
                    "Membuat review pertama kali", "⭐");
        }

        // Badge setelah 5 review
        if (reviewCount >= 5) {
            awardBadge(user, "Review Master",
                    "Membuat 5 review hotel", "🏆");
        }

        // Badge pertama kali tambah wishlist
        if (wishlistCount >= 1) {
            awardBadge(user, "Penjelajah Baru",
                    "Menambahkan destinasi pertama ke wishlist", "🗺️");
        }

        // Badge setelah gabung 3 grup
        if (groupCount >= 3) {
            awardBadge(user, "Social Traveler",
                    "Bergabung dengan 3 grup perjalanan", "👥");
        }
    }

    // Helper: cek dulu apakah sudah punya badge, kalau belum baru kasih
    private void awardBadge(User user, String name, String description, String icon) {
        if (!badgeRepository.existsByUserAndName(user, name)) {
            Badge badge = Badge.builder()
                    .user(user)
                    .name(name)
                    .description(description)
                    .icon(icon)
                    .build();
            badgeRepository.save(badge);
        }
    }
}
