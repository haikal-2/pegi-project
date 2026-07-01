package com.pegi.backend.service;

import com.pegi.backend.entity.BillMember;
import com.pegi.backend.entity.SplitBill;
import com.pegi.backend.entity.enums.BillStatus;
import com.pegi.backend.repository.SplitBillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SplitBillService {

    @Autowired
    private SplitBillRepository splitBillRepository;

    public SplitBill createAndCalculateSplitBill(SplitBill request) {
        Double total = request.getTotalAmount();
        int totalMembers = (request.getMembers() != null) ? request.getMembers().size() : 0;

        Double splitAmount = 0.0;
        if (totalMembers > 0) {
            splitAmount = total / totalMembers;
        }

        if (request.getMembers() != null) {
            for (BillMember member : request.getMembers()) {
                member.setAmountToPay(splitAmount);
                member.setStatus(BillStatus.BELUM_BAYAR);
                member.setSplitBill(request);
            }
        }

        return splitBillRepository.save(request);
    }

    // ✅ Diganti: ambil SEMUA bill dalam satu grup, bukan satu bill by id
    public List<SplitBill> getSplitBillsByGroupId(Long groupId) {
        return splitBillRepository.findByGroupId(groupId);
    }

    public Optional<SplitBill> getSplitBillById(Long id) {
        return splitBillRepository.findById(id);
    }
}