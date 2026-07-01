package com.pegi.backend.service;

import com.pegi.backend.entity.Badge;
import com.pegi.backend.entity.User;
import com.pegi.backend.repository.BadgeRepository;
import com.pegi.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;

    public Map<String, Object> getProfile(String identifier) {
        User user = findUser(identifier);
        List<Badge> badges = badgeRepository.findByUser(user);

        List<Map<String, Object>> badgeList = badges.stream().map(b -> {
            Map<String, Object> bMap = new HashMap<>();
            bMap.put("name", b.getName());
            bMap.put("description", b.getDescription());
            bMap.put("icon", b.getIcon());
            bMap.put("earnedAt", b.getEarnedAt());
            return bMap;
        }).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("fullName", user.getFullName());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("bio", user.getBio());
        response.put("phone", user.getPhone());
        response.put("city", user.getCity());
        response.put("avatar", user.getAvatar());
        response.put("role", user.getRole().getName().name());
        response.put("badges", badgeList);
        response.put("createdAt", user.getCreatedAt());
        return response;
    }

    public Map<String, Object> updateProfile(String identifier, Map<String, Object> request) {
        User user = findUser(identifier);

        if (request.containsKey("fullName")) user.setFullName((String) request.get("fullName"));
        if (request.containsKey("name"))     user.setName((String) request.get("name"));
        if (request.containsKey("bio"))      user.setBio((String) request.get("bio"));
        if (request.containsKey("phone"))    user.setPhone((String) request.get("phone"));
        if (request.containsKey("city"))     user.setCity((String) request.get("city"));
        if (request.containsKey("avatar"))   user.setAvatar((String) request.get("avatar"));

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Profil berhasil diperbarui");
        response.put("name", user.getName());
        return response;
    }

    private User findUser(String identifier) {
        return userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan: " + identifier));
    }
}