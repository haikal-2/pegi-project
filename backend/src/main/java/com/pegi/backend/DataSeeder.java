package com.pegi.backend;

import com.pegi.backend.entity.Role;
import com.pegi.backend.entity.enums.RoleType;
import com.pegi.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {

        // Cek dulu apakah role sudah ada — kalau sudah, skip
        // Jadi aman dijalankan berulang kali, tidak akan duplikat
        if (roleRepository.findByName(RoleType.USER).isEmpty()) {
            roleRepository.save(
                Role.builder().name(RoleType.USER).build()
            );
            System.out.println("✅ Role USER berhasil ditambahkan");
        }

        if (roleRepository.findByName(RoleType.ADMIN).isEmpty()) {
            roleRepository.save(
                Role.builder().name(RoleType.ADMIN).build()
            );
            System.out.println("✅ Role ADMIN berhasil ditambahkan");
        }
    }
}
