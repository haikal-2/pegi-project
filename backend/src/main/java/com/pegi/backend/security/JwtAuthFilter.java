package com.pegi.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/") ||
               path.startsWith("/api/reviews/") ||
               path.startsWith("/api/payments/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        // ✅ FIX: tolak token kosong / literal string "null" / "undefined"
        // sebelum sampai ke JwtUtil — ini akar penyebab IllegalArgumentException
        if (token.isBlank() || token.equals("null") || token.equals("undefined")) {
            log.debug("❌ Token tidak valid (kosong/null/undefined string) pada: {}", request.getServletPath());
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String identifier = jwtUtil.extractEmail(token);
            log.debug("🔑 JWT identifier extracted: {}", identifier);

            if (identifier != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = userDetailsService.loadUserByUsername(identifier);

                if (jwtUtil.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("✅ Auth set untuk: {} | Roles: {}", identifier, userDetails.getAuthorities());
                } else {
                    log.warn("⚠️ Token tidak valid untuk user: {}", identifier);
                }
            }
        } catch (UsernameNotFoundException e) {
            log.error("❌ User tidak ditemukan di database: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.warn("⏰ Token expired untuk request: {}", request.getServletPath());
            SecurityContextHolder.clearContext();
        } catch (io.jsonwebtoken.MalformedJwtException | IllegalArgumentException e) {
            // ✅ Tangkap juga MalformedJwtException & IllegalArgumentException secara eksplisit
            log.warn("🔴 Token format tidak valid: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            log.error("🔴 JWT filter error [{}]: {}", e.getClass().getSimpleName(), e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}