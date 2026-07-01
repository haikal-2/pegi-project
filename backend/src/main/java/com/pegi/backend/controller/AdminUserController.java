package com.pegi.backend.controller;

import com.pegi.backend.dto.UserAdminDto;
import com.pegi.backend.service.AdminUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserAdminDto>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsersForAdmin());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");
        adminUserService.updateStatus(id, newStatus);
        return ResponseEntity.ok(Map.of("message", "Status berhasil diubah jadi " + newStatus));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String newRole = request.get("role");
        adminUserService.updateRole(id, newRole);
        return ResponseEntity.ok(Map.of("message", "Role berhasil diubah jadi " + newRole));
    }
}