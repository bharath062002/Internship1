package com.chatapp.controller;

import com.chatapp.dto.ChatDTOs.*;
import com.chatapp.model.User;
import com.chatapp.repository.UserRepository;
import com.chatapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SendMessageRequest request) {
        Long senderId = getUserId(userDetails);
        return ResponseEntity.ok(messageService.sendMessage(senderId, request));
    }

    @GetMapping("/private/{receiverId}")
    public ResponseEntity<PagedResponse<MessageDTO>> getPrivateMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long receiverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(messageService.getPrivateMessages(userId, receiverId, page, size));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<PagedResponse<MessageDTO>> getGroupMessages(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(messageService.getGroupMessages(groupId, page, size));
    }

    @PostMapping("/read/{senderId}")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long senderId) {
        Long userId = getUserId(userDetails);
        messageService.markAsRead(userId, senderId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<MessageDTO> deleteMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long messageId) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(messageService.deleteMessage(messageId, userId));
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
