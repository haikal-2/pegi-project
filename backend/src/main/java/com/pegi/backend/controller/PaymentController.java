package com.pegi.backend.controller;

import com.pegi.backend.entity.Payment;
import com.pegi.backend.service.PaymentService;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

import com.midtrans.Config;
import com.midtrans.ConfigFactory;
import com.midtrans.service.MidtransSnapApi;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // ==========================================
    // CLASS PENANGKAP DATA ANTI-BOCOR
    // ==========================================
    public static class ChargeRequest {
        private int totalAmount;
        private String paymentMethod;
        private String promoCode;
        private String serviceType;
        private String serviceName;

        public int getTotalAmount() { return totalAmount; }
        public void setTotalAmount(int totalAmount) { this.totalAmount = totalAmount; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getPromoCode() { return promoCode; }
        public void setPromoCode(String promoCode) { this.promoCode = promoCode; }

        public String getServiceType() { return serviceType; }
        public void setServiceType(String serviceType) { this.serviceType = serviceType; }

        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    }

    public static class StatusUpdateRequest {
        private String status; // "Berhasil" | "Ditolak" | "Menunggu"
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    @PostMapping("/api/payments")
    public Payment createPayment(@RequestBody Payment paymentRequest) {
        return paymentService.processPayment(paymentRequest);
    }

    @PostMapping("/api/payments/charge")
    public ResponseEntity<?> createTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChargeRequest requestData) {
        try {
            Config config = new Config(
                "Mid-server-9hUYhcOZyFsMxNUnIg2yA9hL",
                "Mid-client-Ccd_n6mieDntixKx",
                false
            );

            MidtransSnapApi snapApi = new ConfigFactory(config).getSnapApi();

            int totalAmount = requestData.getTotalAmount();
            String paymentMethod = requestData.getPaymentMethod();
            String orderId = "PEGI-" + System.currentTimeMillis();

            Map<String, Object> params = new HashMap<>();

            Map<String, Object> transactionDetails = new HashMap<>();
            transactionDetails.put("order_id", orderId);
            transactionDetails.put("gross_amount", totalAmount);

            params.put("transaction_details", transactionDetails);

            if (paymentMethod != null && !paymentMethod.trim().isEmpty()) {
                List<String> enabledPayments = new ArrayList<>();
                enabledPayments.add(paymentMethod);
                params.put("enabled_payments", enabledPayments);
            }

            String snapToken = snapApi.createTransactionToken(params);

            // Simpan record transaksi PENDING supaya muncul di tabel verifikasi admin
            String customerName = userDetails != null ? userDetails.getUsername() : "Guest";
            paymentService.recordChargeAttempt(
                    orderId,
                    (double) totalAmount,
                    paymentMethod,
                    customerName,
                    requestData.getServiceType(),
                    requestData.getServiceName()
            );

            Map<String, String> response = new HashMap<>();
            response.put("token", snapToken);
            response.put("orderId", orderId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Gagal generate token: " + e.getMessage());
        }
    }
    
}