package com.pegi.backend.service;

import com.pegi.backend.entity.Destination;
import com.pegi.backend.entity.enums.BookingStatus;
import com.pegi.backend.entity.enums.CrowdLevel;
import com.pegi.backend.repository.BookingRepository;
import com.pegi.backend.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CrowdCalculationService {

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private BookingRepository bookingRepository; 
    
    public void calculateAndUpdateCrowdLevels() {
        List<Destination> destinations = destinationRepository.findAll();

        for (Destination dest : destinations) {           
            long totalBookings = bookingRepository.countByDestination_IdAndStatus(dest.getId(), BookingStatus.CONFIRMED);  
            if (totalBookings >= 100) {
                dest.setCrowdLevel(CrowdLevel.RAMAI);
            } else if (totalBookings >= 50) {
                dest.setCrowdLevel(CrowdLevel.SEDANG);
            } else {
                dest.setCrowdLevel(CrowdLevel.SEPI);
            }
                        
            destinationRepository.save(dest);
        }
    }
}