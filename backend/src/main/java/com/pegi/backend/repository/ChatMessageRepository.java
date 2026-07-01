package com.pegi.backend.repository;

import com.pegi.backend.entity.ChatMessage;
import com.pegi.backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Ambil semua pesan dalam grup, diurutkan dari yang paling lama
    List<ChatMessage> findByGroupOrderBySentAtAsc(Group group);
}
