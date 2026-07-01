package com.pegi.backend.dto;

import com.pegi.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private String status;
    private String date;
    private String avatarUrl;

    public static UserAdminDto fromEntity(User user) {
        return new UserAdminDto(
            user.getId().toString(),
            user.getFullName() != null ? user.getFullName() : user.getName(),
            user.getEmail(),
            user.getRole() != null ? user.getRole().getName().name() : "PELANGGAN",
            user.isVerified() ? "Aktif" : "Nonaktif",
            user.getCreatedAt() != null
                ? user.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy"))
                : "-",
            user.getAvatar()
        );
    }
}