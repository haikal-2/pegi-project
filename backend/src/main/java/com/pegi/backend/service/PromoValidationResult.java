package com.pegi.backend.service;

import com.pegi.backend.entity.Promo;
import lombok.Data;

@Data
public class PromoValidationResult {
    private boolean valid;
    private String message;
    private Promo promo;
    private Double discountAmount;
    private Double finalPrice;

    public static PromoValidationResult invalid(String message) {
        PromoValidationResult result = new PromoValidationResult();
        result.setValid(false);
        result.setMessage(message);
        return result;
    }

    public static PromoValidationResult valid(Promo promo, Double discountAmount, Double finalPrice) {
        PromoValidationResult result = new PromoValidationResult();
        result.setValid(true);
        result.setPromo(promo);
        result.setDiscountAmount(discountAmount);
        result.setFinalPrice(finalPrice);
        return result;
    }
}