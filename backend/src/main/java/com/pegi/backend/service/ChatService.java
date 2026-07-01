package com.pegi.backend.service;

import com.pegi.backend.entity.ChatMessage;
import com.pegi.backend.entity.Group;
import com.pegi.backend.entity.User;
import com.pegi.backend.repository.ChatMessageRepository;
import com.pegi.backend.repository.GroupMemberRepository;
import com.pegi.backend.repository.GroupRepository;
import com.pegi.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // GET /api/groups/{id}/chats
    public List<Map<String, Object>> getMessages(String email, Long groupId) {
        User currentUser = findUserByEmail(email);
        Group group = findGroupById(groupId);
        ensureMember(group, currentUser);

        List<ChatMessage> messages = chatMessageRepository.findByGroupOrderBySentAtAsc(group);

        return messages.stream().map(m -> toResponseMap(m, currentUser)).toList();
    }

    // POST /api/groups/{id}/chats
    public Map<String, Object> sendMessage(String email, Long groupId, Map<String, Object> request) {
        User sender = findUserByEmail(email);
        Group group = findGroupById(groupId);
        ensureMember(group, sender);

        String content = (String) request.get("message");
        if (content == null || content.isBlank()) {
            throw new RuntimeException("Pesan tidak boleh kosong");
        }

        ChatMessage message = ChatMessage.builder()
                .group(group)
                .sender(sender)
                .content(content)
                .type("text")
                .build();
        chatMessageRepository.save(message);

        return toResponseMap(message, sender);
    }

    // POST /api/groups/{id}/messages/image
    public Map<String, Object> sendImageMessage(String email, Long groupId, String imageUrl) {
        User sender = findUserByEmail(email);
        Group group = findGroupById(groupId);
        ensureMember(group, sender);

        ChatMessage message = ChatMessage.builder()
                .group(group)
                .sender(sender)
                .content(imageUrl)
                .type("image")
                .build();
        chatMessageRepository.save(message);

        return toResponseMap(message, sender);
    }

    private Map<String, Object> toResponseMap(ChatMessage m, User currentUser) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", m.getId().toString());
        // senderId "me" kalau dia yang request, supaya frontend bisa langsung bedain bubble kiri/kanan
        boolean isMe = m.getSender().getId().equals(currentUser.getId());
        map.put("senderId", isMe ? "me" : m.getSender().getId().toString());
        map.put("senderName", m.getSender().getName());
        map.put("senderAvatar", m.getSender().getAvatar());
        map.put("type", m.getType());
        map.put("content", m.getContent());
        map.put("time", m.getSentAt() != null ? m.getSentAt().format(TIME_FMT) : "");
        return map;
    }

    private void ensureMember(Group group, User user) {
        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("Kamu bukan anggota grup ini");
        }
    }

    private User findUserByEmail(String identifier) {
        return userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan: " + identifier));
    }

    private Group findGroupById(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grup tidak ditemukan"));
    }
}