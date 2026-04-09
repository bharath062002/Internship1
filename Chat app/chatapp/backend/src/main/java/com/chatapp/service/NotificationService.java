package com.chatapp.service;

import com.chatapp.dto.ChatDTOs.*;
import com.chatapp.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public PagedResponse<NotificationDTO> getNotifications(Long userId, int page, int size) {
        Page<com.chatapp.model.Notification> notifications =
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));

        return PagedResponse.<NotificationDTO>builder()
                .content(notifications.getContent().stream().map(n -> NotificationDTO.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .body(n.getBody())
                        .type(n.getType().name())
                        .referenceId(n.getReferenceId())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build()).collect(Collectors.toList()))
                .page(notifications.getNumber())
                .size(notifications.getSize())
                .totalElements(notifications.getTotalElements())
                .totalPages(notifications.getTotalPages())
                .last(notifications.isLast())
                .build();
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }
}
