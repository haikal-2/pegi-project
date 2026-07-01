package com.pegi.backend.service;

import com.pegi.backend.dto.MonitoringStatsDTO;
import com.pegi.backend.entity.Destination;
import com.pegi.backend.entity.Hotel;
import com.pegi.backend.entity.Payment;
import com.pegi.backend.entity.enums.PaymentStatus;
import com.pegi.backend.repository.BookingRepository;
import com.pegi.backend.repository.DestinationRepository;
import com.pegi.backend.repository.HotelRepository;
import com.pegi.backend.repository.PaymentRepository;
import com.pegi.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MonitoringService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    public MonitoringStatsDTO.Response getMonitoringStats(String startDateStr, String endDateStr) {
        LocalDateTime start = parseStart(startDateStr);
        LocalDateTime end = parseEnd(endDateStr);

        List<Payment> paidPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.PAID)
                .filter(p -> p.getPaymentDate() != null
                        && !p.getPaymentDate().isBefore(start)
                        && !p.getPaymentDate().isAfter(end))
                .toList();

        double totalRevenue = paidPayments.stream()
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();

        long totalBookings = paidPayments.size();
        long totalUsers = userRepository.count();

        MonitoringStatsDTO.Kpi kpi = new MonitoringStatsDTO.Kpi(
                "Rp " + String.format("%,.0f", totalRevenue).replace(",", "."),
                totalBookings,
                totalUsers
        );

        List<MonitoringStatsDTO.TopHotel> topHotels = buildTopHotels(paidPayments);
        List<MonitoringStatsDTO.CrowdLevelItem> crowdLevels = buildCrowdLevels();

        return new MonitoringStatsDTO.Response(kpi, topHotels, crowdLevels);
    }

    // Tidak ada relasi formal Payment -> Hotel di skema saat ini,
    // jadi pencocokan dilakukan dengan mencari nama hotel di dalam serviceName pembayaran.
    private List<MonitoringStatsDTO.TopHotel> buildTopHotels(List<Payment> paidPayments) {
        List<Hotel> hotels = hotelRepository.findAll();

        Map<Long, Double> revenueByHotel = new HashMap<>();
        for (Hotel hotel : hotels) {
            double revenue = paidPayments.stream()
                    .filter(p -> "Hotel".equalsIgnoreCase(p.getServiceType()))
                    .filter(p -> p.getServiceName() != null
                            && p.getServiceName().toLowerCase().contains(hotel.getName().toLowerCase()))
                    .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                    .sum();
            revenueByHotel.put(hotel.getId(), revenue);
        }

        return hotels.stream()
                .sorted(Comparator.comparingDouble((Hotel h) -> revenueByHotel.getOrDefault(h.getId(), 0.0)).reversed())
                .limit(5)
                .map(h -> new MonitoringStatsDTO.TopHotel(
                        h.getId().toString(),
                        h.getName(),
                        h.getLocation(),
                        "Rp " + String.format("%,.0f", revenueByHotel.getOrDefault(h.getId(), 0.0)).replace(",", ".")
                ))
                .toList();
    }

    private List<MonitoringStatsDTO.CrowdLevelItem> buildCrowdLevels() {
        List<Destination> destinations = destinationRepository.findAll();

        return destinations.stream()
                .filter(d -> d.getCrowdLevel() != null)
                .limit(6)
                .map(d -> {
                    int percentage = switch (d.getCrowdLevel()) {
                        case RAMAI -> 90;
                        case SEDANG -> 60;
                        default -> 30; // SEPI
                    };
                    String colorClass = switch (d.getCrowdLevel()) {
                        case RAMAI -> "bg-red";
                        case SEDANG -> "bg-orange";
                        default -> "bg-green";
                    };
                    return new MonitoringStatsDTO.CrowdLevelItem(
                            d.getId().toString(),
                            d.getLocation() != null ? d.getLocation() : d.getName(),
                            percentage,
                            colorClass
                    );
                })
                .toList();
    }

    private LocalDateTime parseStart(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return LocalDateTime.now().minusYears(10);
        }
        return LocalDate.parse(dateStr).atStartOfDay();
    }

    private LocalDateTime parseEnd(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return LocalDateTime.now();
        }
        return LocalDate.parse(dateStr).atTime(LocalTime.MAX);
    }
}