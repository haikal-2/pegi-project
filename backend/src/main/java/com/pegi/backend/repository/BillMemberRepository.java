package com.pegi.backend.repository;

import com.pegi.backend.entity.BillMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillMemberRepository extends JpaRepository<BillMember, Long> {
    
}
