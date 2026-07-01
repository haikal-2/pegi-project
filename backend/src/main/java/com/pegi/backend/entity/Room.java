package com.pegi.backend.entity;


import com.fasterxml.jackson.annotation.JsonBackReference; 
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name= "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    private String name;      
    private String bedType;   
    private Integer price;    
    private String image;     
    
    
    private Integer capacity; 
    

    @ManyToOne
    @JoinColumn(name = "hotel_id")
    @JsonBackReference 
    private Hotel hotel;
    
}