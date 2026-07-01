package com.pegi.backend.repository;

import com.pegi.backend.entity.Promo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromoRepository extends JpaRepository<Promo, Long> {
    Promo findByCode(String code);
}