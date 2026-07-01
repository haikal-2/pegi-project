package com.pegi.backend.repository;

import com.pegi.backend.entity.Booking;
import com.pegi.backend.entity.User;
import com.pegi.backend.entity.enums.BookingStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    long countByHotel_IdAndStatus(Long hotelId, BookingStatus status);
    long countByDestination_IdAndStatus(Long destinationId, BookingStatus status);

    List<Booking> findByUserOrderByBookingDateDesc(User user);
}