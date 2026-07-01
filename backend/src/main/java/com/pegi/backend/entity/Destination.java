package com.pegi.backend.entity;

import com.pegi.backend.entity.enums.CrowdLevel;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.List;

@Entity
@Data
@Table(name = "destinations")
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private String region;
    private String category;

    private String img;

    private Double rating;

    private String price;       // contoh: "Rp 50.000"
    private Double priceValue;  // contoh: 50000

    @Enumerated(EnumType.STRING)
    private CrowdLevel crowdLevel;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String bestTime;
    private String duration;
    private String mapImage;

    @ElementCollection
    @CollectionTable(name = "destination_gallery", joinColumns = @JoinColumn(name = "destination_id"))
    @Column(name = "image_url")
    private List<String> gallery;

    @OneToMany(mappedBy = "destination", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<DestinationReview> reviews;
}