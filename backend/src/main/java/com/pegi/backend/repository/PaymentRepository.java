package com.pegi.backend.repository;

import com.pegi.backend.entity.Payment;
import com.pegi.backend.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    Double sumRevenueByStatus(PaymentStatus status);
}