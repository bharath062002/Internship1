package com.chatapp.dto;

import com.chatapp.model.Message;
import com.chatapp.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ChatDTOs {

    // ===== AUTH DTOs =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String displayName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String usernameOrEmail;
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private UserDTO user;
    }

    // ===== USER DTOs =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private Long id;
        private String username;
        private String email;
        private String displayName;
        private String avatarUrl;
        private String statusMessage;
        private User.OnlineStatus onlineStatus;
        private LocalDateTime lastSeen;
    }

    // ===== MESSAGE DTOs =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageDTO {
        private Long id;
        private UserDTO sender;
        private Long receiverId;
        private Long groupId;
        private String content;
        private Message.MessageType type;
        private Message.MessageStatus status;
        private String mediaUrl;
        private Long replyToId;
        private Boolean isDeleted;
        private LocalDateTime createdAt;
        private LocalDateTime readAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendMessageRequest {
        private Long receiverId;
        private Long groupId;
        private String content;
        private Message.MessageType type;
        private String mediaUrl;
        private Long replyToId;
    }

    // ===== WEBSOCKET DTOs =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WebSocketMessage {
        private String type;  // MESSAGE, TYPING, STATUS, READ_RECEIPT
        private Object payload;
        private String senderId;
        private Long timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypingEvent {
        private Long senderId;
        private Long receiverId;
        private Long groupId;
        private boolean typing;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdate {
        private Long userId;
        private User.OnlineStatus status;
        private LocalDateTime lastSeen;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadReceiptEvent {
        private Long messageId;
        private Long readByUserId;
        private LocalDateTime readAt;
    }

    // ===== GROUP DTOs =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateGroupRequest {
        private String name;
        private String description;
        private List<Long> memberIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupDTO {
        private Long id;
        private String name;
        private String description;
        private String avatarUrl;
        private UserDTO createdBy;
        private List<UserDTO> members;
        private int memberCount;
        private LocalDateTime createdAt;
    }

    // ===== CONVERSATION DTOs =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationDTO {
        private String conversationId;
        private UserDTO otherUser;
        private GroupDTO group;
        private MessageDTO lastMessage;
        private int unreadCount;
        private boolean isGroup;
    }

    // ===== NOTIFICATION DTOs =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationDTO {
        private Long id;
        private String title;
        private String body;
        private String type;
        private Long referenceId;
        private Boolean isRead;
        private LocalDateTime createdAt;
    }

    // ===== PAGINATION =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PagedResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}
