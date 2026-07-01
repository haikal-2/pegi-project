package com.pegi.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class MonitoringStatsDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Kpi {
        private String revenue;
        private long totalBookings;
        private long totalUsers;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopHotel {
        private String id;
        private String name;
        private String location;
        private String revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CrowdLevelItem {
        private String id;
        private String location;
        private int percentage;
        private String colorClass;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Kpi kpi;
        private List<TopHotel> topHotels;
        private List<CrowdLevelItem> crowdLevels;
    }
}