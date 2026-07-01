package com.pegi.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ticketCode; 
    private String passengerName; 
    private LocalDateTime issueDate; 
   
    @ManyToOne
    @JoinColumn(name = "booking_id")
    @JsonIgnore 
    private Booking booking;
}