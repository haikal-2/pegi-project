package com.pegi.backend.repository;

import com.pegi.backend.entity.Role;
import com.pegi.backend.entity.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    // Cari role berdasarkan nama enum (ADMIN atau USER)
    Optional<Role> findByName(RoleType name);
}
