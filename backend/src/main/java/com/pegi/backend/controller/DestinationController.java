package com.pegi.backend.controller;

import com.pegi.backend.entity.Destination;
import com.pegi.backend.service.CrowdCalculationService;
import com.pegi.backend.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class DestinationController {

    private final DestinationService destinationService;
    private final CrowdCalculationService crowdCalculationService;

    @GetMapping
    public List<Destination> getAllDestinations() {
        crowdCalculationService.calculateAndUpdateCrowdLevels();
        return destinationService.getAllDestinations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Destination> getDestinationById(@PathVariable Long id) {
        crowdCalculationService.calculateAndUpdateCrowdLevels();
        return destinationService.getDestinationById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}