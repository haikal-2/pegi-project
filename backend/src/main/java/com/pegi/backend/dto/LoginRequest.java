package com.pegi.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String identifier; // INI WAJIB IDENTIFIER, JANGAN USERNAME/EMAIL
    private String password;
}
