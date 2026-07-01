package com.pegi.backend.controller;

import com.pegi.backend.entity.Booking;
import com.pegi.backend.entity.Ticket;
import com.pegi.backend.service.BookingService;
import com.pegi.backend.service.InvoiceService;
import com.pegi.backend.service.PromoService;
import com.pegi.backend.service.TicketService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PromoService promoService;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private TicketService ticketService;

    // GET /api/bookings — hanya milik user yang sedang login (dipakai BookingHistoryPage)
    @GetMapping
    public List<Map<String, Object>> getBookings(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return bookingService.getBookingsForUser(email);
    }

    @GetMapping("/{bookingId}/tickets")
    public List<Ticket> getTicketsForBooking(@PathVariable Long bookingId) {
        return ticketService.getTicketsByBooking(bookingId);
    }

    @PostMapping
    @Transactional
    public Booking createFullBooking(
            @RequestBody Booking bookingRequest,
            @RequestParam(required = false) String promoCode) {

        if (promoCode != null && !promoCode.isEmpty()) {
            Double discountedPrice = promoService.applyDiscount(promoCode, bookingRequest.getTotalPrice());
            bookingRequest.setTotalPrice(discountedPrice);
        }

        Booking savedBooking = bookingService.createBooking(bookingRequest);
        invoiceService.createInvoice(savedBooking);

        return savedBooking;
    }

    // POST /api/bookings/confirm — dipanggil frontend setelah Midtrans onSuccess,
    // otomatis mengisi user dari token login dan status CONFIRMED
    @PostMapping("/confirm")
    @Transactional
    public Booking confirmBookingAfterPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Booking bookingRequest) {
        String email = userDetails.getUsername();
        Booking savedBooking = bookingService.createBookingForUser(email, bookingRequest);
        invoiceService.createInvoice(savedBooking);
        return savedBooking;
    }
}