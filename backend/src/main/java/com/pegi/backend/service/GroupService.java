package com.pegi.backend.service;

import com.pegi.backend.entity.Group;
import com.pegi.backend.entity.GroupMember;
import com.pegi.backend.entity.User;
import com.pegi.backend.entity.enums.GroupType;
import com.pegi.backend.repository.GroupMemberRepository;
import com.pegi.backend.repository.GroupRepository;
import com.pegi.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final BadgeService badgeService;

    // POST /api/groups
    public Map<String, Object> createGroup(String email, Map<String, Object> request) {
        User creator = findUserByEmail(email);

        String name        = (String) request.get("name");
        String description = (String) request.getOrDefault("description", "");
        String typeStr      = (String) request.getOrDefault("groupType", "PUBLIC");
        GroupType groupType = GroupType.valueOf(typeStr.toUpperCase());

        Group group = Group.builder()
                .name(name)
                .description(description)
                .groupType(groupType)
                .creator(creator)
                .build();
        groupRepository.save(group);

        GroupMember adminMember = GroupMember.builder()
                .group(group)
                .user(creator)
                .memberRole("ADMIN")
                .build();
        groupMemberRepository.save(adminMember);

        badgeService.checkAndAwardBadges(creator);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Grup berhasil dibuat");
        response.put("groupId", group.getId());
        response.put("groupName", group.getName());
        response.put("id", group.getId());
        response.put("name", group.getName());
        return response;
    }

    // GET /api/groups
    // GET /api/groups
        public List<Map<String, Object>> getGroups(String email) {
            User user = findUserByEmail(email);

            List<Long> myGroupIds = groupMemberRepository.findByUser(user)
                    .stream().map(gm -> gm.getGroup().getId()).toList();

            return groupRepository.findAll().stream()
                    .filter(g -> myGroupIds.contains(g.getId()))   // <-- hanya grup yang diikuti
                    .map(g -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", g.getId());
                        map.put("name", g.getName());
                        map.put("description", g.getDescription());
                        map.put("groupType", g.getGroupType().name());
                        map.put("creatorName", g.getCreator().getName());
                        map.put("isMember", true);
                        map.put("createdAt", g.getCreatedAt());
                        return map;
                    }).toList();
        }

    // POST /api/groups/{id}/invite
    public Map<String, Object> inviteToGroup(String email, Long groupId,
                                              Map<String, Object> request) {
        User inviter = findUserByEmail(email);
        Group group  = findGroupById(groupId);

        if (!groupMemberRepository.existsByGroupAndUser(group, inviter)) {
            throw new RuntimeException("Kamu bukan anggota grup ini");
        }

        String invitedEmail = (String) request.get("invitedUserEmail");
        User invitedUser = userRepository.findByEmail(invitedEmail)
                .orElseThrow(() -> new RuntimeException("User yang diundang tidak ditemukan"));

        if (groupMemberRepository.existsByGroupAndUser(group, invitedUser)) {
            throw new RuntimeException("User sudah menjadi anggota grup ini");
        }

        GroupMember newMember = GroupMember.builder()
                .group(group)
                .user(invitedUser)
                .memberRole("MEMBER")
                .build();
        groupMemberRepository.save(newMember);

        badgeService.checkAndAwardBadges(invitedUser);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", invitedUser.getName() + " berhasil diundang ke grup");
        return response;
    }

    // POST /api/groups/{id}/join
    public Map<String, Object> joinGroup(String email, Long groupId) {
        User user   = findUserByEmail(email);
        Group group = findGroupById(groupId);

        if (group.getGroupType() == GroupType.PRIVATE) {
            throw new RuntimeException("Grup ini PRIVATE, kamu harus diundang terlebih dahulu");
        }

        if (groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new RuntimeException("Kamu sudah menjadi anggota grup ini");
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(user)
                .memberRole("MEMBER")
                .build();
        groupMemberRepository.save(member);

        badgeService.checkAndAwardBadges(user);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Berhasil bergabung ke grup " + group.getName());
        return response;
    }

    private User findUserByEmail(String identifier) {
        return userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan: " + identifier));
    }

    private Group findGroupById(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grup tidak ditemukan"));
    }

    public Map<String, Object> getHighlight(String email) {
        User user = findUserByEmail(email);

        List<Long> myGroupIds = groupMemberRepository.findByUser(user)
                .stream().map(gm -> gm.getGroup().getId()).toList();

        Group highlightGroup = groupRepository.findAll().stream()
                .filter(g -> myGroupIds.contains(g.getId()) && g.getGroupType() == GroupType.PRIVATE)
                .findFirst()
                .orElse(null);

        if (highlightGroup == null) {
            return null;
        }

        List<GroupMember> members = groupMemberRepository.findByGroup(highlightGroup);

        Map<String, Object> response = new HashMap<>();
        response.put("title", highlightGroup.getName());
        response.put("status", "Mendatang");
        response.put("countdown", 7);
        response.put("location", highlightGroup.getDescription());
        response.put("img", "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80");
        response.put("avatars", members.stream()
                .limit(3)
                .map(m -> m.getUser().getAvatar())
                .filter(a -> a != null)
                .toList());
        response.put("extraMembers", Math.max(0, members.size() - 3));
        return response;
    }

    // GET /api/groups/{id}
    public Map<String, Object> getGroupDetail(Long groupId) {
        Group group = findGroupById(groupId);

        Map<String, Object> response = new HashMap<>();
        response.put("id", group.getId().toString());
        response.put("title", group.getName());
        response.put("status", group.getGroupType() == GroupType.PUBLIC ? "Aktif" : "Mendatang");
        response.put("location", group.getDescription());
        response.put("date", group.getCreatedAt().toLocalDate().toString());
        return response;
    }

    // GET /api/groups/{id}/members
    public List<Map<String, Object>> getGroupMembers(Long groupId) {
        Group group = findGroupById(groupId);
        List<GroupMember> members = groupMemberRepository.findByGroup(group);

        return members.stream().map(gm -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", gm.getUser().getId());
            map.put("name", gm.getUser().getName());
            // Format "Role / Subtitle" sesuai ekspektasi frontend (role.split(" / "))
            String roleLabel = "ADMIN".equals(gm.getMemberRole()) ? "Ketua Grup" : "Anggota";
            map.put("role", roleLabel + " / " + (gm.getUser().getEmail() != null ? gm.getUser().getEmail() : "-"));
            map.put("avatar", gm.getUser().getAvatar());
            map.put("isOnline", false); // placeholder, belum ada sistem presence
            map.put("status", "Belum Bayar"); // placeholder, belum terhubung ke status pembayaran riil
            return map;
        }).toList();
    }

    // ============================
    // ====== ADMIN ENDPOINTS ======
    // ============================

    // GET /api/admin/groups — list semua grup untuk admin dashboard
    public List<Map<String, Object>> getAllGroupsForAdmin() {
        return groupRepository.findAll().stream().map(g -> {
            List<GroupMember> members = groupMemberRepository.findByGroup(g);
            User leader = g.getCreator();

            Map<String, Object> map = new HashMap<>();
            map.put("id", g.getId().toString());
            map.put("name", g.getName());
            map.put("createdAt", g.getCreatedAt() != null ? g.getCreatedAt().toLocalDate().toString() : "-");
            map.put("img", "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=150&q=80");
            map.put("leaderName", leader != null ? leader.getName() : "-");
            map.put("leaderTier", "Member");
            map.put("currentMembers", members.size());
            map.put("maxMembers", 20);
            map.put("destination", g.getDescription() != null ? g.getDescription() : "-");
            map.put("status", g.getGroupType() == GroupType.PUBLIC ? "Aktif" : "Menunggu");
            return map;
        }).toList();
    }

    // POST /api/admin/groups
    public Map<String, Object> createGroupAsAdmin(String email, Map<String, Object> data) {
        User creator = findUserByEmail(email);

        String name = (String) data.get("name");
        String destination = (String) data.getOrDefault("destination", "");
        String statusLabel = (String) data.getOrDefault("status", "Menunggu");
        GroupType type = "Aktif".equals(statusLabel) ? GroupType.PUBLIC : GroupType.PRIVATE;

        Group group = Group.builder()
                .name(name)
                .description(destination)
                .groupType(type)
                .creator(creator)
                .build();
        groupRepository.save(group);

        GroupMember adminMember = GroupMember.builder()
                .group(group)
                .user(creator)
                .memberRole("ADMIN")
                .build();
        groupMemberRepository.save(adminMember);

        return toAdminMap(group);
    }

    // PUT /api/admin/groups/{id}
    public Map<String, Object> updateGroupAsAdmin(Long groupId, Map<String, Object> data) {
        Group group = findGroupById(groupId);

        if (data.get("name") != null) group.setName((String) data.get("name"));
        if (data.get("destination") != null) group.setDescription((String) data.get("destination"));
        if (data.get("status") != null) {
            String statusLabel = (String) data.get("status");
            group.setGroupType("Aktif".equals(statusLabel) ? GroupType.PUBLIC : GroupType.PRIVATE);
        }
        groupRepository.save(group);
        return toAdminMap(group);
    }

    // DELETE /api/admin/groups/{id}
    public void deleteGroupAsAdmin(Long groupId) {
        Group group = findGroupById(groupId);
        groupRepository.delete(group);
    }

    private Map<String, Object> toAdminMap(Group g) {
        List<GroupMember> members = groupMemberRepository.findByGroup(g);
        Map<String, Object> map = new HashMap<>();
        map.put("id", g.getId().toString());
        map.put("name", g.getName());
        map.put("createdAt", g.getCreatedAt() != null ? g.getCreatedAt().toLocalDate().toString() : "-");
        map.put("img", "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=150&q=80");
        map.put("leaderName", g.getCreator() != null ? g.getCreator().getName() : "-");
        map.put("leaderTier", "Member");
        map.put("currentMembers", members.size());
        map.put("maxMembers", 20);
        map.put("destination", g.getDescription() != null ? g.getDescription() : "-");
        map.put("status", g.getGroupType() == GroupType.PUBLIC ? "Aktif" : "Menunggu");
        return map;
    }

    // GET /api/admin/activities — aktivitas terbaru (gabungan member yang join semua grup)
    public List<Map<String, Object>> getRecentActivities() {
        return groupMemberRepository.findAll().stream()
                .sorted(Comparator.comparing(GroupMember::getJoinedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .map(gm -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", gm.getId().toString());
                    map.put("userName", gm.getUser().getName());
                    map.put("groupName", gm.getGroup().getName());
                    map.put("time", gm.getJoinedAt() != null ? gm.getJoinedAt().toString() : "-");
                    return map;
                }).toList();
    }
}