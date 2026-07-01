package com.pegi.backend.controller;

import com.pegi.backend.entity.Booking;
import com.pegi.backend.entity.User;
import com.pegi.backend.entity.enums.BookingStatus;
import com.pegi.backend.repository.BookingRepository;
import com.pegi.backend.repository.DestinationRepository;
import com.pegi.backend.repository.UserRepository;
import com.pegi.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private PaymentService paymentService;

    // GET /api/admin/dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> response = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        long totalDestinations = destinationRepository.count();

        // --- TOTAL PENDAPATAN: jumlahkan totalPrice dari booking yang statusnya CONFIRMED ---
        // ASUMSI: enum BookingStatus punya value CONFIRMED. Sesuaikan kalau namanya beda.
        double totalRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0)
                .sum();

        List<Map<String, Object>> stats = List.of(
                Map.of("title", "Total Pengguna", "value", String.valueOf(totalUsers), "color", "text-purple"),
                Map.of("title", "Total Booking", "value", String.valueOf(totalBookings), "color", "text-green"),
                Map.of("title", "Destinasi Aktif", "value", String.valueOf(totalDestinations), "color", "text-yellow"),
                Map.of("title", "Pendapatan", "value", formatRupiah(totalRevenue), "color", "text-red")
        );

        // --- DESTINASI TERPOPULER: hitung jumlah booking per destinasi ---
        Map<String, Long> destinationCounts = bookingRepository.findAll().stream()
                .filter(b -> b.getDestination() != null)
                .collect(Collectors.groupingBy(b -> b.getDestination().getName(), Collectors.counting()));

        long maxCount = destinationCounts.values().stream().max(Long::compare).orElse(1L);

        List<Map<String, Object>> popularDestinations = destinationCounts.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(entry -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", entry.getKey());
                    m.put("percent", Math.round((entry.getValue() * 100.0) / maxCount));
                    m.put("img", "https://placehold.co/100x100");
                    return m;
                })
                .collect(Collectors.toList());

        // --- BOOKING TERBARU: 5 booking terakhir berdasarkan bookingDate ---
        List<Map<String, Object>> recentBookings = bookingRepository
                .findAll(Sort.by(Sort.Direction.DESC, "bookingDate")).stream()
                .limit(5)
                .map(b -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", b.getId());
                    m.put("user", b.getUser() != null ? b.getUser().getName() : "Unknown");
                    m.put("dest", b.getDestination() != null ? b.getDestination().getName()
                            : (b.getHotel() != null ? b.getHotel().getName() : "Transportasi"));
                    m.put("status", mapStatusLabel(b.getStatus()));
                    m.put("amount", formatRupiah(b.getTotalPrice() != null ? b.getTotalPrice() : 0));
                    return m;
                })
                .collect(Collectors.toList());

        // --- PENGGUNA BARU: 5 user terbaru berdasarkan createdAt ---
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        List<Map<String, Object>> newUsers = userRepository
                .findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .limit(5)
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", u.getFullName());
                    m.put("img", u.getAvatar() != null ? u.getAvatar() : "https://placehold.co/100x100");
                    m.put("time", u.getCreatedAt() != null ? u.getCreatedAt().format(fmt) : "-");
                    return m;
                })
                .collect(Collectors.toList());

        response.put("stats", stats);
        response.put("popularDestinations", popularDestinations);
        response.put("recentBookings", recentBookings);
        response.put("newUsers", newUsers);

        return ResponseEntity.ok(response);
    }

    private String formatRupiah(double value) {
        return "Rp " + String.format("%,.0f", value).replace(",", ".");
    }

    private String mapStatusLabel(BookingStatus status) {
        if (status == null) return "Menunggu";
        switch (status) {
            case CONFIRMED: return "Sukses";
            case PENDING: return "Menunggu";
            default: return "Ditolak";
        }
    }

    public static class StatusUpdateRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Map<String, Object>>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPaymentsForAdmin());
    }

    @PutMapping("/payments/{id}")
    public ResponseEntity<Map<String, Object>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(paymentService.updateStatus(id, request.getStatus()));
    }
}