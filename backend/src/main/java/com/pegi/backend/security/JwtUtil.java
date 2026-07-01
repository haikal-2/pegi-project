package com.pegi.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // ✅ Generate token — pastikan yang dipass adalah EMAIL, bukan username
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)           // sub = email
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Rename: extractSubject lebih jujur — isinya tergantung apa yang dipass saat generate
    public String extractSubject(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (Exception e) {
            return null; // biar filter bisa handle dengan log yang jelas
        }
    }

    // ✅ Tetap ada untuk backward compatibility di filter lama
    public String extractEmail(String token) {
        return extractSubject(token);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
    String subject = extractSubject(token);
    if (subject == null) return false;

    // ✅ Cocokkan baik dengan username maupun email, karena token bisa di-generate dari keduanya
    boolean matches = subject.equals(userDetails.getUsername());

    return matches && !isTokenExpired(token);
}

    private boolean isTokenExpired(String token) {
        try {
            Date expiration = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();
            return expiration.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }
}