package com.pegi.backend.service;

import com.pegi.backend.entity.Booking;
import com.pegi.backend.entity.Ticket;
import com.pegi.backend.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    
    public Ticket generateTicket(Booking booking, String passengerName) {
        Ticket ticket = new Ticket();
        ticket.setBooking(booking);
        ticket.setPassengerName(passengerName);
        
        String randomCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        ticket.setTicketCode("TKT-" + randomCode);
        ticket.setIssueDate(LocalDateTime.now());
        
        return ticketRepository.save(ticket);
    }
    
    public List<Ticket> getTicketsByBooking(Long bookingId) {
        return ticketRepository.findByBookingId(bookingId);
    }
}