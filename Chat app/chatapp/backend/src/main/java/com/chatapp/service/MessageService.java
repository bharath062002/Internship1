package com.chatapp.service;

import com.chatapp.dto.ChatDTOs.*;
import com.chatapp.model.Message;
import com.chatapp.model.Notification;
import com.chatapp.model.User;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.NotificationRepository;
import com.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuthService authService;

    @Transactional
    @CacheEvict(value = "messages", allEntries = true)
    public MessageDTO sendMessage(Long senderId, SendMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Message.MessageBuilder builder = Message.builder()
                .sender(sender)
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : Message.MessageType.TEXT)
                .status(Message.MessageStatus.SENT)
                .mediaUrl(request.getMediaUrl())
                .replyToId(request.getReplyToId());

        if (request.getReceiverId() != null) {
            User receiver = userRepository.findById(request.getReceiverId())
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));
            builder.receiver(receiver);
        }

        Message message = messageRepository.save(builder.build());
        MessageDTO dto = mapToMessageDTO(message);

        // Push via WebSocket
        if (request.getReceiverId() != null) {
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(request.getReceiverId()),
                    "/queue/messages",
                    dto
            );
            createNotification(message.getReceiver(), "New message from " + sender.getDisplayName(), request.getContent(), Notification.NotificationType.NEW_MESSAGE, message.getId());
        } else if (request.getGroupId() != null) {
            messagingTemplate.convertAndSend("/topic/group/" + request.getGroupId(), dto);
        }

        return dto;
    }

    @Cacheable(value = "messages", key = "#userId1 + '-' + #userId2 + '-' + #page")
    public PagedResponse<MessageDTO> getPrivateMessages(Long userId1, Long userId2, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findPrivateMessages(userId1, userId2, pageable);

        return PagedResponse.<MessageDTO>builder()
                .content(messages.getContent().stream().map(this::mapToMessageDTO).collect(Collectors.toList()))
                .page(messages.getNumber())
                .size(messages.getSize())
                .totalElements(messages.getTotalElements())
                .totalPages(messages.getTotalPages())
                .last(messages.isLast())
                .build();
    }

    public PagedResponse<MessageDTO> getGroupMessages(Long groupId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByGroupIdOrderByCreatedAtAsc(groupId, pageable);

        return PagedResponse.<MessageDTO>builder()
                .content(messages.getContent().stream().map(this::mapToMessageDTO).collect(Collectors.toList()))
                .page(messages.getNumber())
                .size(messages.getSize())
                .totalElements(messages.getTotalElements())
                .totalPages(messages.getTotalPages())
                .last(messages.isLast())
                .build();
    }

    @Transactional
    public void markAsRead(Long userId, Long senderId) {
        messageRepository.markMessagesAsRead(userId, senderId);

        ReadReceiptEvent receipt = ReadReceiptEvent.builder()
                .readByUserId(userId)
                .readAt(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSendToUser(
                String.valueOf(senderId),
                "/queue/read-receipts",
                receipt
        );
    }

    public void sendTypingEvent(Long senderId, Long receiverId, Long groupId, boolean typing) {
        TypingEvent event = TypingEvent.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .groupId(groupId)
                .typing(typing)
                .build();

        if (receiverId != null) {
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(receiverId),
                    "/queue/typing",
                    event
            );
        } else if (groupId != null) {
            messagingTemplate.convertAndSend("/topic/group/" + groupId + "/typing", event);
        }
    }

    @Transactional
    public MessageDTO deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this message");
        }

        message.setIsDeleted(true);
        message.setContent("This message was deleted");
        messageRepository.save(message);
        return mapToMessageDTO(message);
    }

    private void createNotification(User user, String title, String body, Notification.NotificationType type, Long refId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .body(body.length() > 100 ? body.substring(0, 100) + "..." : body)
                .type(type)
                .referenceId(refId)
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        NotificationDTO dto = NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .body(notification.getBody())
                .type(notification.getType().name())
                .referenceId(notification.getReferenceId())
                .isRead(false)
                .createdAt(notification.getCreatedAt())
                .build();

        messagingTemplate.convertAndSendToUser(
                String.valueOf(user.getId()),
                "/queue/notifications",
                dto
        );
    }

    public MessageDTO mapToMessageDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .sender(authService.mapToUserDTO(message.getSender()))
                .receiverId(message.getReceiver() != null ? message.getReceiver().getId() : null)
                .groupId(message.getGroup() != null ? message.getGroup().getId() : null)
                .content(message.getContent())
                .type(message.getType())
                .status(message.getStatus())
                .mediaUrl(message.getMediaUrl())
                .replyToId(message.getReplyToId())
                .isDeleted(message.getIsDeleted())
                .createdAt(message.getCreatedAt())
                .readAt(message.getReadAt())
                .build();
    }
}
