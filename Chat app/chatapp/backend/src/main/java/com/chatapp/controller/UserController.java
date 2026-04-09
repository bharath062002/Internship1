package com.chatapp.controller;

import com.chatapp.dto.ChatDTOs.*;
import com.chatapp.model.User;
import com.chatapp.repository.UserRepository;
import com.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDTO updateRequest) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(userService.updateProfile(userId, updateRequest));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(userService.searchUsers(q));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(userService.getConversations(userId));
    }

    @PostMapping("/status")
    public ResponseEntity<Void> updateStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String status) {
        Long userId = getUserId(userDetails);
        userService.updateOnlineStatus(userId, User.OnlineStatus.valueOf(status.toUpperCase()));
        return ResponseEntity.ok().build();
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
