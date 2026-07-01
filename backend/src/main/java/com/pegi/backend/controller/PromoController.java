package com.pegi.backend.controller;

import com.pegi.backend.service.PromoService;
import com.pegi.backend.service.PromoValidationResult;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/promos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PromoController {

    private final PromoService promoService;

    @PostMapping("/validate")
    public ResponseEntity<PromoValidationResult> validatePromo(@RequestBody ValidatePromoRequest request) {
        PromoValidationResult result = promoService.validateAndApply(
            request.getCode(),
            request.getCategory(),
            request.getOriginalPrice()
        );

        if (!result.isValid()) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @Data
    public static class ValidatePromoRequest {
        private String code;
        private String category;     // "Hotel" atau "Tiket Pesawat" (dipakai untuk destinasi, lihat catatan di bawah)
        private Double originalPrice;
    }
}