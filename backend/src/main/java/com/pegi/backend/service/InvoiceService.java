package com.pegi.backend.service;

import com.pegi.backend.entity.Booking;
import com.pegi.backend.entity.Invoice;
import com.pegi.backend.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;
  
    public Invoice createInvoice(Booking booking) {
        Invoice invoice = new Invoice();
        invoice.setBooking(booking);
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        invoice.setGeneratedDate(LocalDateTime.now());
        return invoiceRepository.save(invoice);
    }
    
    public Optional<Invoice> getInvoiceByBookingId(Long bookingId) {
        return invoiceRepository.findByBookingId(bookingId);
    }
}