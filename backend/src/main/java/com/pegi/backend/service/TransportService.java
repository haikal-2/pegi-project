package com.pegi.backend.service;

import com.pegi.backend.entity.Transport;
import com.pegi.backend.repository.TransportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransportService {
    @Autowired
    private TransportRepository transportRepository;

    public List<Transport> getAllTransports() {
        return transportRepository.findAll();
    }

    public Optional<Transport> getTransportById(Long id) {
        return transportRepository.findById(id);
    }

    public Transport createTransport(Transport transport) {
        return transportRepository.save(transport);
    }

    public Transport updateTransport(Long id, Transport newData) {
        return transportRepository.findById(id).map(existing -> {
            existing.setCompany(newData.getCompany());
            existing.setType(newData.getType());
            existing.setClassType(newData.getClassType());
            existing.setRoute(newData.getRoute());
            existing.setDepartureCity(newData.getDepartureCity());
            existing.setArrivalCity(newData.getArrivalCity());
            existing.setDeparturePoint(newData.getDeparturePoint());
            existing.setArrivalPoint(newData.getArrivalPoint());
            existing.setDepartureTime(newData.getDepartureTime());
            existing.setArrivalTime(newData.getArrivalTime());
            existing.setDuration(newData.getDuration());
            existing.setImage(newData.getImage());
            existing.setPrice(newData.getPrice());
            existing.setPriceValue(newData.getPriceValue());
            existing.setRating(newData.getRating());
            existing.setRemainingSeats(newData.getRemainingSeats());
            existing.setRegion(newData.getRegion());
            existing.setDescription(newData.getDescription());
            existing.setGallery(newData.getGallery());
            existing.setCapacity(newData.getCapacity());
            return transportRepository.save(existing);
        }).orElse(null);
    }

    public void deleteTransport(Long id) {
        transportRepository.deleteById(id);
    }
}