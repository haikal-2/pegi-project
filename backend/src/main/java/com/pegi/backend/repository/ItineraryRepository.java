package com.pegi.backend.repository;

import com.pegi.backend.entity.itinerary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItineraryRepository extends JpaRepository<itinerary, Long> {
    List<itinerary> findByGroupIdOrderByDateAscTimeAsc(Long groupId);
}