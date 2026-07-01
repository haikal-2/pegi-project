package com.pegi.backend.controller;

import com.pegi.backend.entity.Destination;
import com.pegi.backend.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/destinations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminDestinationController {

    private final DestinationService destinationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Destination> getAllDestinations() {
        return destinationService.getAllDestinations();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Destination> createDestination(@RequestBody Destination destination) {
        return ResponseEntity.ok(destinationService.createDestination(destination));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Destination> updateDestination(@PathVariable Long id, @RequestBody Destination destination) {
        return ResponseEntity.ok(destinationService.updateDestination(id, destination));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDestination(@PathVariable Long id) {
        destinationService.deleteDestination(id);
        return ResponseEntity.ok().build();
    }
}