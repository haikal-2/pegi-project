package com.pegi.backend.controller;

import com.pegi.backend.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    // POST /api/groups
    // Buat grup perjalanan baru
    @PostMapping
    public ResponseEntity<?> createGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> request) {

        // request berisi: name (String), description (String), groupType ("PUBLIC" atau "PRIVATE")
        String email = userDetails.getUsername();
        Map<String, Object> result = groupService.createGroup(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // GET /api/groups
    // Ambil semua grup yang tersedia / diikuti user
    @GetMapping
    public ResponseEntity<?> getGroups(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        return ResponseEntity.ok(groupService.getGroups(email));
    }

    // POST /api/groups/{id}/invite
    // Undang user lain ke dalam grup (hanya bisa dilakukan anggota/admin grup)
    @PostMapping("/{id}/invite")
    public ResponseEntity<?> inviteToGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        // request berisi: invitedUserEmail (String)
        String email = userDetails.getUsername();
        Map<String, Object> result = groupService.inviteToGroup(email, id, request);
        return ResponseEntity.ok(result);
    }

    // POST /api/groups/{id}/join
    // User bergabung ke grup (untuk grup PUBLIC atau jika sudah diundang)
    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        String email = userDetails.getUsername();
        Map<String, Object> result = groupService.joinGroup(email, id);
        return ResponseEntity.ok(result);
    }

    // GET /api/groups/highlight
    @GetMapping("/highlight")
    public ResponseEntity<?> getHighlight(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        Map<String, Object> result = groupService.getHighlight(email);

        if (result == null) {
            return ResponseEntity.noContent().build(); // 204 — frontend abaikan karena sudah ada try/catch
        }
        return ResponseEntity.ok(result);
    }

    // GET /api/groups/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupDetail(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupDetail(id));
    }

    // GET /api/groups/{id}/members
    @GetMapping("/{id}/members")
    public ResponseEntity<?> getGroupMembers(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupMembers(id));
    }
}
