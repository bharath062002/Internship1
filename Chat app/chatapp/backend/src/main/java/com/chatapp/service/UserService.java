package com.chatapp.service;

import com.chatapp.dto.ChatDTOs.*;
import com.chatapp.model.User;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuthService authService;

    @Cacheable(value = "users", key = "#userId")
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        return authService.mapToUserDTO(user);
    }

    public List<UserDTO> searchUsers(String query) {
        return userRepository.searchUsers(query).stream()
                .map(authService::mapToUserDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public UserDTO updateProfile(Long userId, UserDTO updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updateRequest.getDisplayName() != null) user.setDisplayName(updateRequest.getDisplayName());
        if (updateRequest.getAvatarUrl() != null) user.setAvatarUrl(updateRequest.getAvatarUrl());
        if (updateRequest.getStatusMessage() != null) user.setStatusMessage(updateRequest.getStatusMessage());

        userRepository.save(user);
        return authService.mapToUserDTO(user);
    }

    @Transactional
    @CacheEvict(value = "onlineStatus", key = "#userId")
    public void updateOnlineStatus(Long userId, User.OnlineStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setOnlineStatus(status);
        if (status == User.OnlineStatus.OFFLINE) {
            user.setLastSeen(LocalDateTime.now());
        }
        userRepository.save(user);

        // Broadcast status change to all users
        StatusUpdate update = StatusUpdate.builder()
                .userId(userId)
                .status(status)
                .lastSeen(user.getLastSeen())
                .build();

        messagingTemplate.convertAndSend("/topic/status", update);
        log.info("User {} status updated to {}", userId, status);
    }

    public List<ConversationDTO> getConversations(Long userId) {
        List<Long> partnerIds = messageRepository.findConversationPartnerIds(userId);

        return partnerIds.stream().map(partnerId -> {
            UserDTO partner = getUserById(partnerId);
            List<com.chatapp.model.Message> lastMsgList = messageRepository.findLastPrivateMessage(
                    userId, partnerId, PageRequest.of(0, 1));

            MessageDTO lastMessage = lastMsgList.isEmpty() ? null
                    : authService != null ? mapMsg(lastMsgList.get(0)) : null;

            long unread = messageRepository.countUnreadMessages(userId, partnerId);

            return ConversationDTO.builder()
                    .conversationId("private_" + Math.min(userId, partnerId) + "_" + Math.max(userId, partnerId))
                    .otherUser(partner)
                    .lastMessage(lastMessage)
                    .unreadCount((int) unread)
                    .isGroup(false)
                    .build();
        }).collect(Collectors.toList());
    }

    private MessageDTO mapMsg(com.chatapp.model.Message m) {
        return MessageDTO.builder()
                .id(m.getId())
                .sender(authService.mapToUserDTO(m.getSender()))
                .content(m.getContent())
                .type(m.getType())
                .status(m.getStatus())
                .isDeleted(m.getIsDeleted())
                .createdAt(m.getCreatedAt())
                .build();
    }

    // Scheduled task: mark away users as offline after 5 minutes
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupStaleStatuses() {
        // In production, track heartbeat timestamps in Redis
        log.debug("Running status cleanup task");
    }
}
