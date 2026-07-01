package com.pegi.backend.repository;

import com.pegi.backend.entity.Group;
import com.pegi.backend.entity.GroupMember;
import com.pegi.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    boolean existsByGroupAndUser(Group group, User user);
    Optional<GroupMember> findByGroupAndUser(Group group, User user);
    List<GroupMember> findByUser(User user);
    long countByUser(User user);
    List<GroupMember> findByGroup(Group group);
}
