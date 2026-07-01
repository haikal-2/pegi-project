package com.pegi.backend.security;

import com.pegi.backend.entity.User;
import com.pegi.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
        public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User tidak ditemukan: " + identifier));

        // ✅ Fallback: kalau username kosong/null, pakai email sebagai identifier UserDetails
        String principalUsername = (user.getUsername() != null && !user.getUsername().isBlank())
                ? user.getUsername()
                : user.getEmail();

        return org.springframework.security.core.userdetails.User.builder()
                .username(principalUsername)
                .password(user.getPassword())
                .roles(user.getRole().getName().name())
                .build();
        }

   
}