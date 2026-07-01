package com.pegi.backend.service;

import com.pegi.backend.entity.Hotel;
import com.pegi.backend.entity.RoomType;
import com.pegi.backend.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;

    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    public Optional<Hotel> getHotelById(Long id) {
        return hotelRepository.findById(id);
    }

    public Hotel createHotel(Hotel hotel) {
        linkRoomTypes(hotel);
        return hotelRepository.save(hotel);
    }

    public Hotel updateHotel(Long id, Hotel incoming) {
        Hotel existing = hotelRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Hotel tidak ditemukan: " + id));

        existing.setName(incoming.getName());
        existing.setCategory(incoming.getCategory());
        existing.setLocation(incoming.getLocation());
        existing.setRating(incoming.getRating());
        existing.setTotalRooms(incoming.getTotalRooms());
        existing.setRestoCount(incoming.getRestoCount());
        existing.setImg(incoming.getImg());
        existing.setDescription(incoming.getDescription());
        existing.setFacilities(incoming.getFacilities());
        existing.setGallery(incoming.getGallery());

        existing.getRoomTypes().clear();
        if (incoming.getRoomTypes() != null) {
            for (RoomType rt : incoming.getRoomTypes()) {
                rt.setHotel(existing);
                existing.getRoomTypes().add(rt);
            }
        }

        return hotelRepository.save(existing);
    }

    public void deleteHotel(Long id) {
        hotelRepository.deleteById(id);
    }

    private void linkRoomTypes(Hotel hotel) {
        if (hotel.getRoomTypes() != null) {
            for (RoomType rt : hotel.getRoomTypes()) {
                rt.setHotel(hotel);
            }
        }
    }
}