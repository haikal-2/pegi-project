package com.pegi.backend.service;

import com.pegi.backend.entity.User;
import com.pegi.backend.entity.enums.RoleType;
import com.pegi.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final UserRepository userRepository;

    // GET /api/matching/partners
    // Mengembalikan daftar user lain (bukan diri sendiri dan bukan admin)
    // yang bisa dijadikan travel partner
    public List<Map<String, Object>> findPartners(String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        // Ambil semua user, filter: bukan diri sendiri dan bukan ADMIN
        return userRepository.findAll().stream()
                .filter(u -> !u.getEmail().equals(email))
                .filter(u -> u.getRole().getName() != RoleType.ADMIN)
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("name", u.getName());
                    map.put("bio", u.getBio());
                    map.put("avatar", u.getAvatar());
                    return map;
                })
                .toList();
    }
}
