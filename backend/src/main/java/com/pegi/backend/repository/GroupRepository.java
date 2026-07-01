package com.pegi.backend.repository;

import com.pegi.backend.entity.Group;
import com.pegi.backend.entity.GroupMember;
import com.pegi.backend.entity.enums.GroupType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    // Ambil semua grup berdasarkan tipe (PUBLIC atau PRIVATE)
    List<Group> findByGroupType(GroupType groupType);
}
