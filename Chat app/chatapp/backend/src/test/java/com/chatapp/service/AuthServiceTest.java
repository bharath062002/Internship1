package com.chatapp.service;

import com.chatapp.dto.ChatDTOs.LoginRequest;
import com.chatapp.dto.ChatDTOs.RegisterRequest;
import com.chatapp.dto.ChatDTOs.AuthResponse;
import com.chatapp.model.User;
import com.chatapp.repository.UserRepository;
import com.chatapp.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtils jwtUtils;
    @Mock AuthenticationManager authenticationManager;
    @Mock UserDetailsServiceImpl userDetailsService;
    @InjectMocks AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("alice")
                .email("alice@demo.com")
                .password("encoded-password")
                .displayName("Alice")
                .onlineStatus(User.OnlineStatus.OFFLINE)
                .build();
    }

    @Test
    void register_success() {
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.existsByEmail("alice@demo.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(userRepository.save(any())).thenReturn(sampleUser);

        var details = org.springframework.security.core.userdetails.User
                .builder().username("alice").password("x").authorities(java.util.List.of()).build();
        when(userDetailsService.loadUserByUsername("alice")).thenReturn(details);
        when(jwtUtils.generateToken(any())).thenReturn("access-token");
        when(jwtUtils.generateRefreshToken(any())).thenReturn("refresh-token");

        RegisterRequest req = RegisterRequest.builder()
                .username("alice").email("alice@demo.com")
                .password("secret").displayName("Alice").build();

        AuthResponse res = authService.register(req);

        assertThat(res.getAccessToken()).isEqualTo("access-token");
        assertThat(res.getUser().getUsername()).isEqualTo("alice");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateUsername_throws() {
        when(userRepository.existsByUsername("alice")).thenReturn(true);

        RegisterRequest req = RegisterRequest.builder()
                .username("alice").email("new@demo.com").password("secret").build();

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Username already taken");
    }

    @Test
    void login_success() {
        Authentication mockAuth = mock(Authentication.class);
        var details = org.springframework.security.core.userdetails.User
                .builder().username("alice").password("x").authorities(java.util.List.of()).build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        when(mockAuth.getPrincipal()).thenReturn(details);
        when(userRepository.findByUsernameOrEmail("alice", "alice"))
                .thenReturn(Optional.of(sampleUser));
        when(jwtUtils.generateToken(any())).thenReturn("access-token");
        when(jwtUtils.generateRefreshToken(any())).thenReturn("refresh-token");

        LoginRequest req = LoginRequest.builder()
                .usernameOrEmail("alice").password("secret").build();

        AuthResponse res = authService.login(req);

        assertThat(res.getAccessToken()).isEqualTo("access-token");
        assertThat(res.getUser().getEmail()).isEqualTo("alice@demo.com");
    }
}
