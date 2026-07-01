package com.pegi.backend.controller;

import com.pegi.backend.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    // GET /api/matching/partners
    // Mengembalikan daftar user lain yang cocok sebagai travel partner
    // Pencocokan berdasarkan preferensi destinasi, jadwal, dsb. (logika ada di MatchingService)
    @GetMapping("/partners")
    public ResponseEntity<?> getMatchingPartners(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return ResponseEntity.ok(matchingService.findPartners(email));
    }
}
