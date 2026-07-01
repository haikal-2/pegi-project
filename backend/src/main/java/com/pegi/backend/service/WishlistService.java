package com.pegi.backend.service;

import com.pegi.backend.entity.User;
import com.pegi.backend.entity.Wishlist;
import com.pegi.backend.repository.UserRepository;
import com.pegi.backend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final BadgeService badgeService;

    // GET /api/wishlist
    // GET /api/wishlist
    public List<Map<String, Object>> getWishlist(String email) {
        User user = findUserByEmail(email);

        return wishlistRepository.findByUser(user).stream().map(w -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", w.getId());
            map.put("itemId", w.getItemId());
            map.put("itemType", w.getItemType());
            map.put("itemName", w.getItemName());
            map.put("itemImage", w.getItemImage());       // ✅ baru
            map.put("itemLocation", w.getItemLocation());  // ✅ baru
            map.put("createdAt", w.getCreatedAt());
            return map;
        }).toList();
    }

    // POST /api/wishlist
    public Map<String, Object> addToWishlist(String email, Map<String, Object> request) {
        User user = findUserByEmail(email);

        Long itemId        = Long.valueOf(request.get("itemId").toString());
        String itemType    = (String) request.get("itemType");
        String itemName    = (String) request.getOrDefault("itemName", "");
        String itemImage   = (String) request.getOrDefault("itemImage", "");      // ✅ baru
        String itemLocation = (String) request.getOrDefault("itemLocation", "");  // ✅ baru

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .itemId(itemId)
                .itemType(itemType)
                .itemName(itemName)
                .itemImage(itemImage)        // ✅ baru
                .itemLocation(itemLocation)  // ✅ baru
                .build();

        wishlistRepository.save(wishlist);
        badgeService.checkAndAwardBadges(user);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Berhasil ditambahkan ke wishlist");
        response.put("wishlistId", wishlist.getId());
        return response;
    }

    // DELETE /api/wishlist/{id}
    public void deleteFromWishlist(String email, Long wishlistId) {
        User user = findUserByEmail(email);

        // Pastikan wishlist ini milik user yang sedang login
        Wishlist wishlist = wishlistRepository.findByIdAndUser(wishlistId, user)
                .orElseThrow(() -> new RuntimeException(
                        "Wishlist tidak ditemukan atau bukan milik kamu"
                ));

        wishlistRepository.delete(wishlist);
    }

   private User findUserByEmail(String identifier) {
    return userRepository.findByEmailOrUsername(identifier, identifier)
            .orElseThrow(() -> new RuntimeException("User tidak ditemukan: " + identifier));
}
}
