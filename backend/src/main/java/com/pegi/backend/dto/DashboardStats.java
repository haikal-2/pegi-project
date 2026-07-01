package com.pegi.backend.dto;

import lombok.Data;

@Data
public class DashboardStats {
    private long totalBookings;
    private long totalDestinations;
    private Double totalRevenue; 
}