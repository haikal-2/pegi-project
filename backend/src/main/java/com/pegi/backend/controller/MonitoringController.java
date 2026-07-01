package com.pegi.backend.controller;

import com.pegi.backend.dto.MonitoringStatsDTO;
import com.pegi.backend.service.MonitoringService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/monitoring")
public class MonitoringController {

    @Autowired
    private MonitoringService monitoringService;

    // GET /api/admin/monitoring/stats?startDate=...&endDate=...
    @GetMapping("/stats")
    public MonitoringStatsDTO.Response getStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return monitoringService.getMonitoringStats(startDate, endDate);
    }
}