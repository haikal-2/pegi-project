package com.pegi.backend.service;

import com.pegi.backend.dto.UserAdminDto;
import com.pegi.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    public List<UserAdminDto> getAllUsersForAdmin() {
        return userRepository.findAll()
            .stream()
            .map(UserAdminDto::fromEntity)
            .collect(Collectors.toList());
    }

    public void updateStatus(Long id, String status) {
        userRepository.updateVerifiedStatus(id, "Aktif".equalsIgnoreCase(status));
    }

    public void updateRole(Long id, String roleName) {
        Long adminRoleId = 2L; // GANTI sesuai id role ADMIN di tabel roles kamu
        userRepository.updateRoleId(id, adminRoleId);
    }
}