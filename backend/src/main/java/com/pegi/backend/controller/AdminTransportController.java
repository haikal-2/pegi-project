package com.pegi.backend.controller;

import com.pegi.backend.entity.Transport;
import com.pegi.backend.service.TransportService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/transports")
public class AdminTransportController {

    @Autowired
    private TransportService transportService;

    @GetMapping
    public List<Transport> getAllTransports() {
        return transportService.getAllTransports();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transport> getTransportById(@PathVariable Long id) {
        return transportService.getTransportById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Transport createTransport(@RequestBody Transport transport) {
        return transportService.createTransport(transport);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transport> updateTransport(@PathVariable Long id, @RequestBody Transport transport) {
        Transport updated = transportService.updateTransport(id, transport);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransport(@PathVariable Long id) {
        transportService.deleteTransport(id);
        return ResponseEntity.noContent().build();
    }
}