package com.pegi.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@Table(name = "destination_reviews")
public class DestinationReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private Double rating;

    @ManyToOne
    @JoinColumn(name = "destination_id")
    @JsonBackReference
    private Destination destination;
}