package com.pegi.backend.controller;

import com.pegi.backend.entity.SplitBill;
import com.pegi.backend.service.SplitBillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class SplitBillController {

    @Autowired
    private SplitBillService splitBillService;

    // POST /api/groups/{id}/split-bill
    @PostMapping("/{id}/split-bill")
    public ResponseEntity<SplitBill> createSplitBill(
            @PathVariable Long id,
            @RequestBody SplitBill request) {

        request.setGroupId(id);
        SplitBill saved = splitBillService.createAndCalculateSplitBill(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // GET /api/groups/{id}/bills
    // ✅ Fix typo "spit-bill" -> "bills" agar cocok dengan frontend (GroupChat.tsx)
    // ✅ Fix: id di sini adalah groupId, jadi ambil SEMUA bill di grup itu
    @GetMapping("/{id}/bills")
    public ResponseEntity<List<SplitBill>> getBillsByGroup(@PathVariable Long id) {
        List<SplitBill> bills = splitBillService.getSplitBillsByGroupId(id);
        return ResponseEntity.ok(bills);
    }
}