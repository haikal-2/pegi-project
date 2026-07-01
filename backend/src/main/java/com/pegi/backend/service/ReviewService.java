package com.pegi.backend.service;

import com.pegi.backend.entity.Review;
import com.pegi.backend.entity.User;
import com.pegi.backend.repository.ReviewRepository;
import com.pegi.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BadgeService badgeService;

    // POST /api/reviews
    public Map<String, Object> createReview(String email, Map<String, Object> request) {
        User user = findUserByEmail(email);

        Long hotelId    = Long.valueOf(request.get("hotelId").toString());
        Integer rating  = Integer.valueOf(request.get("rating").toString());
        String comment  = (String) request.getOrDefault("comment", "");

        // Validasi rating antara 1 - 5
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating harus antara 1 sampai 5");
        }

        Review review = Review.builder()
                .user(user)
                .hotelId(hotelId)
                .rating(rating)
                .comment(comment)
                .build();

        reviewRepository.save(review);

        // Cek dan beri badge setelah buat review
        badgeService.checkAndAwardBadges(user);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Review berhasil ditambahkan");
        response.put("reviewId", review.getId());
        return response;
    }

    // GET /api/reviews/{hotelId}
    public List<Map<String, Object>> getReviewsByHotel(Long hotelId) {
        return reviewRepository.findByHotelId(hotelId).stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("reviewerName", r.getUser().getName());
            map.put("createdAt", r.getCreatedAt());
            return map;
        }).toList();
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
    }
}
