package com.pegi.backend.entity;

import jakarta.annotation.Generated;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import org.springframework.cglib.core.Local;


@Entity
@Data
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    private String invoiceNumber;
    private LocalDateTime generatedDate;
    
}
