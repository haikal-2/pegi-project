package com.pegi.backend.controller;

import com.pegi.backend.entity.itinerary;
import com.pegi.backend.service.ItineraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class ItineraryController {

    private final ItineraryService itineraryService;

    // GET /api/groups/{id}/itinerary
    @GetMapping("/{id}/itinerary")
    public ResponseEntity<List<itinerary>> getItinerary(@PathVariable Long id) {
        return ResponseEntity.ok(itineraryService.getItineraryByGroup(id));
    }

    // POST /api/groups/{id}/itinerary
    @PostMapping("/{id}/itinerary")
    public ResponseEntity<itinerary> createItinerary(
            @PathVariable Long id,
            @RequestBody itinerary request) {

        itinerary saved = itineraryService.createItinerary(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}