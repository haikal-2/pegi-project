package com.pegi.backend.service;

import com.pegi.backend.entity.Destination;
import com.pegi.backend.entity.DestinationReview;
import com.pegi.backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;

    public List<Destination> getAllDestinations() {
        return destinationRepository.findAll();
    }

    public Optional<Destination> getDestinationById(Long id) {
        return destinationRepository.findById(id);
    }

    public Destination createDestination(Destination destination) {
        linkReviews(destination);
        return destinationRepository.save(destination);
    }

    public Destination updateDestination(Long id, Destination incoming) {
        Destination existing = destinationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Destinasi tidak ditemukan: " + id));

        existing.setName(incoming.getName());
        existing.setLocation(incoming.getLocation());
        existing.setRegion(incoming.getRegion());
        existing.setCategory(incoming.getCategory());
        existing.setImg(incoming.getImg());
        existing.setRating(incoming.getRating());
        existing.setPrice(incoming.getPrice());
        existing.setPriceValue(incoming.getPriceValue());
        existing.setCrowdLevel(incoming.getCrowdLevel());
        existing.setDescription(incoming.getDescription());
        existing.setBestTime(incoming.getBestTime());
        existing.setDuration(incoming.getDuration());
        existing.setMapImage(incoming.getMapImage());
        existing.setGallery(incoming.getGallery());

        return destinationRepository.save(existing);
    }

    public void deleteDestination(Long id) {
        destinationRepository.deleteById(id);
    }

    private void linkReviews(Destination destination) {
        if (destination.getReviews() != null) {
            for (DestinationReview r : destination.getReviews()) {
                r.setDestination(destination);
            }
        }
    }
}