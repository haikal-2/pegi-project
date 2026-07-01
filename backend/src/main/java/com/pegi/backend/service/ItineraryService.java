package com.pegi.backend.service;

import com.pegi.backend.entity.itinerary;
import com.pegi.backend.repository.ItineraryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;

    public List<itinerary> getItineraryByGroup(Long groupId) {
        return itineraryRepository.findByGroupIdOrderByDateAscTimeAsc(groupId);
    }

    public itinerary createItinerary(Long groupId, itinerary request) {
        request.setGroupId(groupId);
        return itineraryRepository.save(request);
    }
}