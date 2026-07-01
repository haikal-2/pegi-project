package com.pegi.backend.service;

import com.pegi.backend.entity.Promo;
import com.pegi.backend.entity.enums.PromoStatus;
import com.pegi.backend.repository.PromoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromoService {

    private final PromoRepository promoRepository;

    public List<Promo> getAllPromos() {
        return promoRepository.findAll();
    }

    public Promo createPromo(Promo promo) {
        if (promo.getStatus() == null) {
            promo.setStatus(PromoStatus.DRAFT);
        }
        if (promo.getUsageCount() == null) {
            promo.setUsageCount(0);
        }
        return promoRepository.save(promo);
    }

    public Promo updatePromo(Long id, Promo incoming) {
        Promo existing = promoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Promo tidak ditemukan: " + id));

        existing.setTitle(incoming.getTitle());
        existing.setCode(incoming.getCode());
        existing.setCategory(incoming.getCategory());
        existing.setDiscountPercent(incoming.getDiscountPercent());
        existing.setStatus(incoming.getStatus());
        existing.setValidUntil(incoming.getValidUntil());
        existing.setUsageLimit(incoming.getUsageLimit());
        existing.setImg(incoming.getImg());

        return promoRepository.save(existing);
    }

    public void deletePromo(Long id) {
        promoRepository.deleteById(id);
    }

    /**
     * Validasi kode promo untuk dipakai user saat checkout.
     * Mengecek: kode ada, status AKTIF, belum kadaluarsa, kategori cocok, kuota masih ada.
     * Mengembalikan harga akhir setelah diskon.
     */
    public PromoValidationResult validateAndApply(String code, String category, Double originalPrice) {
        Promo promo = promoRepository.findByCode(code);

        if (promo == null) {
            return PromoValidationResult.invalid("Kode promo tidak ditemukan.");
        }
        if (promo.getStatus() != PromoStatus.AKTIF) {
            return PromoValidationResult.invalid("Promo ini tidak aktif.");
        }
        if (promo.getValidUntil() != null && promo.getValidUntil().isBefore(LocalDate.now())) {
            return PromoValidationResult.invalid("Promo ini sudah kadaluarsa.");
        }
        boolean categoryMatch = "Semua Kategori".equalsIgnoreCase(promo.getCategory())
            || promo.getCategory().equalsIgnoreCase(category);
        if (!categoryMatch) {
            return PromoValidationResult.invalid("Promo ini tidak berlaku untuk kategori ini.");
        }
        if (promo.getUsageLimit() != null && promo.getUsageCount() >= promo.getUsageLimit()) {
            return PromoValidationResult.invalid("Kuota promo ini sudah habis.");
        }

        double discountAmount = originalPrice * (promo.getDiscountPercent() / 100.0);
        double finalPrice = originalPrice - discountAmount;

        return PromoValidationResult.valid(promo, discountAmount, finalPrice);
    }

    public void incrementUsage(String code) {
        Promo promo = promoRepository.findByCode(code);
        if (promo != null) {
            promo.setUsageCount(promo.getUsageCount() + 1);
            promoRepository.save(promo);
        }
    }
    public Double applyDiscount(String code, Double originalPrice) {
    Promo promo = promoRepository.findByCode(code);

    if (promo == null) {
        throw new RuntimeException("Kode promo tidak ditemukan.");
    }
    if (promo.getStatus() != PromoStatus.AKTIF) {
        throw new RuntimeException("Promo ini tidak aktif.");
    }
    if (promo.getValidUntil() != null && promo.getValidUntil().isBefore(LocalDate.now())) {
        throw new RuntimeException("Promo ini sudah kadaluarsa.");
    }
    if (promo.getUsageLimit() != null && promo.getUsageCount() >= promo.getUsageLimit()) {
        throw new RuntimeException("Kuota promo ini sudah habis.");
    }

    double discountAmount = originalPrice * (promo.getDiscountPercent() / 100.0);
    double finalPrice = originalPrice - discountAmount;

    promo.setUsageCount(promo.getUsageCount() + 1);
    promoRepository.save(promo);

    return finalPrice;
}
}