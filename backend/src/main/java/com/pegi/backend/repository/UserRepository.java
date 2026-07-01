package com.pegi.backend.repository;

import com.pegi.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByEmailOrUsername(String email, String username);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.isVerified = :verified WHERE u.id = :id")
    void updateVerifiedStatus(@Param("id") Long id, @Param("verified") boolean verified);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.role.id = :roleId WHERE u.id = :id")
    void updateRoleId(@Param("id") Long id, @Param("roleId") Long roleId);
}