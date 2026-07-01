package com.pegi.backend.controller;

import com.pegi.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // POST /api/reviews
    // User membuat review untuk sebuah hotel
    @PostMapping
    public ResponseEntity<?> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> request) {

        // request berisi: hotelId (Long), rating (Integer 1-5), comment (String)
        String email = userDetails.getUsername();
        Map<String, Object> result = reviewService.createReview(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // GET /api/reviews/{hotelId}
    // Ambil semua review untuk hotel tertentu
    // Endpoint ini PUBLIC — tidak perlu login
    @GetMapping("/{hotelId}")
    public ResponseEntity<?> getReviewsByHotel(
            @PathVariable Long hotelId) {

        return ResponseEntity.ok(reviewService.getReviewsByHotel(hotelId));
    }
}
