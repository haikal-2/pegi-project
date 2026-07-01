package com.pegi.backend.controller;

import com.pegi.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    private static final String UPLOAD_DIR = "uploads/";

    // GET /api/groups/{id}/chats
    @GetMapping("/chats")
    public ResponseEntity<List<Map<String, Object>>> getMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(chatService.getMessages(email, groupId));
    }

    // POST /api/groups/{id}/chats
    @PostMapping("/chats")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @RequestBody Map<String, Object> request) {
        String email = userDetails.getUsername();
        Map<String, Object> result = chatService.sendMessage(email, groupId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // POST /api/groups/{id}/messages/image
    @PostMapping("/messages/image")
    public ResponseEntity<Map<String, Object>> sendImageMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @RequestParam("file") MultipartFile file) {
        String email = userDetails.getUsername();
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/upload/files/")
                    .path(filename)
                    .toUriString();

            Map<String, Object> result = chatService.sendImageMessage(email, groupId, fileUrl);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}