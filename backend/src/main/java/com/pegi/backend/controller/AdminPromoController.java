package com.pegi.backend.controller;

import com.pegi.backend.entity.Promo;
import com.pegi.backend.entity.enums.PromoStatus;
import com.pegi.backend.repository.PromoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/promos")
@RequiredArgsConstructor
public class AdminPromoController {

    private final PromoRepository promoRepository;

    @GetMapping
    public List<Map<String, Object>> getAllPromos() {
        return promoRepository.findAll().stream().map(this::toFrontend).toList();
    }

    @PostMapping
    public Map<String, Object> createPromo(@RequestBody Map<String, Object> data) {
        Promo promo = new Promo();
        mapToEntity(data, promo);
        return toFrontend(promoRepository.save(promo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updatePromo(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return promoRepository.findById(id).map(promo -> {
            mapToEntity(data, promo);
            return ResponseEntity.ok(toFrontend(promoRepository.save(promo)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromo(@PathVariable Long id) {
        promoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void mapToEntity(Map<String, Object> data, Promo promo) {
        if (data.get("title") != null) promo.setTitle(data.get("title").toString());
        if (data.get("code") != null) promo.setCode(data.get("code").toString());
        if (data.get("category") != null) promo.setCategory(data.get("category").toString());
        if (data.get("img") != null) promo.setImg(data.get("img").toString());

        // "20%" atau "20" -> 20.0
        if (data.get("discount") != null) {
            String raw = data.get("discount").toString().replace("%", "").trim();
            try { promo.setDiscountPercent(Double.parseDouble(raw)); } catch (Exception ignored) {}
        }

        // "2024-01-01" -> LocalDate
        if (data.get("validUntil") != null && !data.get("validUntil").toString().isBlank()) {
            try { promo.setValidUntil(LocalDate.parse(data.get("validUntil").toString())); } catch (Exception ignored) {}
        }

        // "Aktif" -> AKTIF, "Draft" -> DRAFT, "Berakhir" -> BERAKHIR
        if (data.get("status") != null) {
            try {
                promo.setStatus(PromoStatus.valueOf(data.get("status").toString().toUpperCase()
                        .replace("İ", "I")));
            } catch (Exception ignored) {
                promo.setStatus(PromoStatus.DRAFT);
            }
        }

        if (data.get("usageLimit") != null) {
            try { promo.setUsageLimit(Integer.parseInt(data.get("usageLimit").toString())); } catch (Exception ignored) {}
        }
        if (data.get("usageCount") != null) {
            try { promo.setUsageCount(Integer.parseInt(data.get("usageCount").toString())); } catch (Exception ignored) {}
        }
    }

    private Map<String, Object> toFrontend(Promo p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId().toString());
        map.put("title", p.getTitle());
        map.put("code", p.getCode());
        map.put("category", p.getCategory());
        map.put("img", p.getImg() != null ? p.getImg() : "");
        map.put("discount", p.getDiscountPercent() != null ? p.getDiscountPercent().intValue() + "%" : "0%");
        map.put("validUntil", p.getValidUntil() != null ? p.getValidUntil().toString() : "");
        map.put("usageCount", p.getUsageCount() != null ? p.getUsageCount() : 0);
        map.put("usageLimit", p.getUsageLimit() != null ? p.getUsageLimit() : 0);

        String statusLabel = "Draft";
        if (p.getStatus() != null) {
            statusLabel = switch (p.getStatus()) {
                case AKTIF -> "Aktif";
                case BERAKHIR -> "Berakhir";
                default -> "Draft";
            };
        }
        map.put("status", statusLabel);
        return map;
    }
}