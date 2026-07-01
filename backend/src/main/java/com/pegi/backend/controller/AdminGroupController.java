package com.pegi.backend.controller;

import com.pegi.backend.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminGroupController {

    private final GroupService groupService;

    // GET /api/admin/groups
    @GetMapping("/api/admin/groups")
    public ResponseEntity<List<Map<String, Object>>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroupsForAdmin());
    }

    // POST /api/admin/groups
    @PostMapping("/api/admin/groups")
    public ResponseEntity<Map<String, Object>> createGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> data) {
        String email = userDetails.getUsername();
        Map<String, Object> result = groupService.createGroupAsAdmin(email, data);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // PUT /api/admin/groups/{id}
    @PutMapping("/api/admin/groups/{id}")
    public ResponseEntity<Map<String, Object>> updateGroup(
            @PathVariable Long id,
            @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(groupService.updateGroupAsAdmin(id, data));
    }

    // DELETE /api/admin/groups/{id}
    @DeleteMapping("/api/admin/groups/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroupAsAdmin(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/admin/activities
    @GetMapping("/api/admin/activities")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivities() {
        return ResponseEntity.ok(groupService.getRecentActivities());
    }
}