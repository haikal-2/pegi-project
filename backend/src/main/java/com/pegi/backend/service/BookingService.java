package com.pegi.backend.service;

import com.pegi.backend.entity.Booking;
import com.pegi.backend.entity.User;
import com.pegi.backend.entity.enums.BookingStatus;
import com.pegi.backend.repository.BookingRepository;
import com.pegi.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // GET /api/bookings — hanya milik user yang sedang login
    public List<Map<String, Object>> getBookingsForUser(String email) {
        User user = findUserByEmail(email);
        List<Booking> bookings = bookingRepository.findByUserOrderByBookingDateDesc(user);
        return bookings.stream().map(this::toHistoryMap).toList();
    }

    public Booking createBooking(Booking bookingRequest) {
        bookingRequest.setBookingDate(LocalDateTime.now());
        bookingRequest.setStatus(BookingStatus.PENDING);
        return bookingRepository.save(bookingRequest);
    }

    // Dipanggil dari endpoint pasca-pembayaran sukses, melengkapi data dari user yang login
    public Booking createBookingForUser(String email, Booking bookingRequest) {
        User user = findUserByEmail(email);
        bookingRequest.setUser(user);
        bookingRequest.setBookingDate(LocalDateTime.now());
        if (bookingRequest.getStatus() == null) {
            bookingRequest.setStatus(BookingStatus.CONFIRMED);
        }
        return bookingRepository.save(bookingRequest);
    }

    private Map<String, Object> toHistoryMap(Booking b) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", b.getId());
        map.put("bookingId", "BOOK-" + b.getId());

        String category;
        String title;
        String imageUrl;
        if (b.getHotel() != null) {
            category = "Hotel";
            title = b.getHotel().getName();
            imageUrl = b.getHotel().getImg();
        } else if (b.getDestination() != null) {
            category = "Tiket Wisata";
            title = b.getDestination().getName();
            imageUrl = b.getDestination().getImg();
        } else {
            category = "Transportasi";
            title = "Pesanan #" + b.getId();
            imageUrl = null;
        }

        map.put("category", category);
        map.put("title", title);
        map.put("imageUrl", imageUrl);
        map.put("date", b.getBookingDate() != null ? b.getBookingDate().toString() : null);
        map.put("status", b.getStatus() != null ? b.getStatus().name() : "PENDING");
        map.put("totalPrice", b.getTotalPrice());
        map.put("totalGuests", b.getTotalGuests());
        map.put("extraText", (b.getTotalGuests() != null ? b.getTotalGuests() : 1) + " Tamu");
        return map;
    }

    private User findUserByEmail(String identifier) {
        return userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan: " + identifier));
    }
}