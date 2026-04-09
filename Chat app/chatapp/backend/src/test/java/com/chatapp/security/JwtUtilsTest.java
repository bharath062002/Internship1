package com.chatapp.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilsTest {

    private JwtUtils jwtUtils;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret",
                "test-secret-key-for-unit-tests-long-enough-12345678901234567890");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpiration", 86400000L);
        ReflectionTestUtils.setField(jwtUtils, "refreshExpiration", 604800000L);

        userDetails = User.builder()
                .username("alice")
                .password("password")
                .authorities(List.of())
                .build();
    }

    @Test
    void generateToken_and_extractUsername() {
        String token = jwtUtils.generateToken(userDetails);
        assertThat(token).isNotBlank();
        assertThat(jwtUtils.extractUsername(token)).isEqualTo("alice");
    }

    @Test
    void validateToken_valid() {
        String token = jwtUtils.generateToken(userDetails);
        assertThat(jwtUtils.validateToken(token)).isTrue();
        assertThat(jwtUtils.isTokenValid(token, userDetails)).isTrue();
    }

    @Test
    void validateToken_tampered_returnsFalse() {
        String token = jwtUtils.generateToken(userDetails) + "tampered";
        assertThat(jwtUtils.validateToken(token)).isFalse();
    }

    @Test
    void generateRefreshToken_isValid() {
        String refresh = jwtUtils.generateRefreshToken(userDetails);
        assertThat(refresh).isNotBlank();
        assertThat(jwtUtils.validateToken(refresh)).isTrue();
    }
}
