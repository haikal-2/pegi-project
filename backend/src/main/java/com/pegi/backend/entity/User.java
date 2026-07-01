package com.pegi.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- TETEP ADA: FIELD UNTUK REGISTRASI ---
    @Column(nullable = false)
    private String fullName;      // Nama Lengkap

    @Column(nullable = false)
    private String name;          // Nama Panggilan

    @Column(nullable = false, unique = true)
    private String username;      // Username untuk login
    // -----------------------------------------

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String bio;
    
    @Column(nullable = false)
    private String phone;         // No Telepon wajib isi pas daftar
    
    private String avatar;

    // --- DIPERTAHANKAN: Cukup status verifikasinya saja ---
    @Column(nullable = false)
    private boolean isVerified = false;   // true kalau akun sudah aktif/lolos verifikasi

    // --- FITUR TRAVEL PARTNER & COCOK-COCOKAN ---
    private String city;              
    private String targetDestination; 
    private String travelDate;        
    private boolean isSearchingPartner = false; 

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest")
    private List<String> interests;
    // ---------------------------------------------

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // ===== UserDetails (Spring Security) =====

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.getName().name()));
    }

    @Override
    public String getUsername() { 
        return this.username; // Spring Security membaca field username asli
    }

    @Override
    public String getPassword() { return password; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { 
        return isVerified; // Akun cuma bisa dipakai kalau isVerified = true
    }
}