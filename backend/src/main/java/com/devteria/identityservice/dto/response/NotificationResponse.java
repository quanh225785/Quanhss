package com.devteria.identityservice.dto.response;

import java.time.LocalDateTime;

import com.devteria.identityservice.enums.NotificationType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    Long id;
    NotificationType type;
    String title;
    String message;
    Long referenceId;
    String referenceType;
    Boolean isRead;
    LocalDateTime createdAt;
}
