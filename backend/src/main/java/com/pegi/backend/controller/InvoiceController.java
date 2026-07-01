package com.pegi.backend.controller;

import com.pegi.backend.entity.Invoice;
import com.pegi.backend.service.InvoiceService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoice")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    // Endpoint: GET /api/invoice/{bookingId}
    @GetMapping("/{bookingId}")
    public ResponseEntity<Invoice> getInvoice(@PathVariable Long bookingId) {
        return invoiceService.getInvoiceByBookingId(bookingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}