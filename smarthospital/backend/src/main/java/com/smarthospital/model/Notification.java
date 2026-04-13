package com.smarthospital.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String title;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private boolean read = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NotificationType {
        APPOINTMENT_BOOKED, APPOINTMENT_CONFIRMED, APPOINTMENT_CANCELLED,
        APPOINTMENT_REMINDER, QUEUE_UPDATE, SYSTEM
    }
}
