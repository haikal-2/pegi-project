package com.pegi.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import com.pegi.backend.service.QRCodeService;

@RestController
@RequestMapping("/api/qrcode")
public class QrCodeController {

    @Autowired
    private QRCodeService qrCodeService;

    
    @GetMapping(value = "/{bookingId}", produces = MediaType.IMAGE_PNG_VALUE)
    public byte[] getQRCode(@PathVariable String bookingId) throws Exception {
        
        return qrCodeService.generateQRCode("BookingID: " + bookingId, 250, 250);
    }
}