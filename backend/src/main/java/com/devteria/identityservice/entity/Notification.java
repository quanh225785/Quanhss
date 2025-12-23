package com.devteria.identityservice.entity;

import java.time.LocalDateTime;

import com.devteria.identityservice.enums.NotificationType;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    User recipient;  // Agent nhận thông báo

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    NotificationType type;

    @Column(nullable = false)
    String title;

    @Column(length = 500)
    String message;

    // ID tham chiếu (booking ID, tour ID, etc.)
    Long referenceId;

    // Loại tham chiếu ("BOOKING", "TOUR", "REVIEW", etc.)
    String referenceType;

    @Builder.Default
    Boolean isRead = false;

    LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isRead == null) {
            isRead = false;
        }
    }
}
