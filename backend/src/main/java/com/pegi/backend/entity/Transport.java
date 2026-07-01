package com.pegi.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "transports")
public class Transport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    private String company;       
    private String type;          
    private String classType;     
    private String route;         

    private String departureCity;  
    private String arrivalCity;    
    private String departurePoint; 
    private String arrivalPoint;   

    private String departureTime;  
    private String arrivalTime;    
    private String duration;       
    private String image;          

    private String price;         
    private Integer priceValue;   
    private double rating;        
    private Integer remainingSeats; 
    private String region;        

    @Column(columnDefinition = "TEXT")
    private String description;

    
    @ElementCollection
    @CollectionTable(name = "transport_gallery", joinColumns = @JoinColumn(name = "transport_id"))
    @Column(name = "image_url")
    private List<String> gallery;

    private Integer capacity; 
}