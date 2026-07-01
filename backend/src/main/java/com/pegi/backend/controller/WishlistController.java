package com.pegi.backend.controller;

import com.pegi.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // GET /api/wishlist
    // Ambil semua wishlist milik user yang sedang login
    @GetMapping
    public ResponseEntity<?> getWishlist(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return ResponseEntity.ok(wishlistService.getWishlist(email));
    }

    // POST /api/wishlist
    // Tambah item baru ke wishlist (hotel atau destinasi)
    @PostMapping
    public ResponseEntity<?> addToWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> request) {

        // request berisi: itemId (Long), itemType ("hotel" atau "destination")
        String email = userDetails.getUsername();
        Map<String, Object> result = wishlistService.addToWishlist(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // DELETE /api/wishlist/{id}
    // Hapus item dari wishlist berdasarkan ID wishlist
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFromWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        String email = userDetails.getUsername();
        wishlistService.deleteFromWishlist(email, id);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Item berhasil dihapus dari wishlist"
        ));
    }
}
