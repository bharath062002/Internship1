package com.chatapp.websocket;

import com.chatapp.dto.ChatDTOs.*;
import com.chatapp.model.User;
import com.chatapp.repository.UserRepository;
import com.chatapp.service.MessageService;
import com.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final MessageService messageService;
    private final UserService userService;
    private final UserRepository userRepository;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        Long senderId = getUserId(principal.getName());
        messageService.sendMessage(senderId, request);
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingEvent event, Principal principal) {
        Long senderId = getUserId(principal.getName());
        messageService.sendTypingEvent(senderId, event.getReceiverId(), event.getGroupId(), event.isTyping());
    }

    @MessageMapping("/chat.read")
    public void markRead(@Payload ReadReceiptEvent event, Principal principal) {
        Long userId = getUserId(principal.getName());
        if (event.getMessageId() != null) {
            messageService.markAsRead(userId, event.getReadByUserId());
        }
    }

    @EventListener
    public void handleWebSocketConnect(SessionConnectedEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        if (headers.getUser() != null) {
            String username = headers.getUser().getName();
            try {
                Long userId = getUserId(username);
                userService.updateOnlineStatus(userId, User.OnlineStatus.ONLINE);
                log.info("User connected: {}", username);
            } catch (Exception e) {
                log.warn("Could not update status for user: {}", username);
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        if (headers.getUser() != null) {
            String username = headers.getUser().getName();
            try {
                Long userId = getUserId(username);
                userService.updateOnlineStatus(userId, User.OnlineStatus.OFFLINE);
                log.info("User disconnected: {}", username);
            } catch (Exception e) {
                log.warn("Could not update status for user: {}", username);
            }
        }
    }

    private Long getUserId(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username))
                .getId();
    }
}
