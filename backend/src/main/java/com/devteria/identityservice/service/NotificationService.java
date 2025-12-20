package com.devteria.identityservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.dto.response.NotificationResponse;
import com.devteria.identityservice.entity.Notification;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.NotificationType;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.repository.NotificationRepository;
import com.devteria.identityservice.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationService {

    NotificationRepository notificationRepository;
    UserRepository userRepository;
    SimpMessagingTemplate messagingTemplate;

    /**
     * Tạo notification và gửi qua WebSocket
     */
    @Transactional
    public NotificationResponse createNotification(
            User recipient,
            NotificationType type,
            String title,
            String message,
            Long referenceId,
            String referenceType) {
        
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
        
        notification = notificationRepository.save(notification);
        log.info("Created notification for user {}: {}", recipient.getId(), title);
        
        NotificationResponse response = mapToResponse(notification);
        
        // Gửi realtime notification qua WebSocket
        sendRealtimeNotification(recipient.getId(), response);
        
        return response;
    }

    /**
     * Gửi notification qua WebSocket đến user cụ thể
     */
    private void sendRealtimeNotification(String recipientId, NotificationResponse notification) {
        try {
            String destination = "/topic/notifications/" + recipientId;
            messagingTemplate.convertAndSend(destination, notification);
            log.info("Sent realtime notification to {}: {}", destination, notification.getTitle());
        } catch (Exception e) {
            log.error("Failed to send realtime notification to user {}", recipientId, e);
        }
    }

    /**
     * Lấy danh sách notifications của user hiện tại
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        User currentUser = getCurrentUser();
        List<Notification> notifications = notificationRepository
                .findTop20ByRecipientOrderByCreatedAtDesc(currentUser);
        
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số notification chưa đọc
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount() {
        User currentUser = getCurrentUser();
        return notificationRepository.countByRecipientAndIsReadFalse(currentUser);
    }

    /**
     * Đánh dấu 1 notification là đã đọc
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        
        User currentUser = getCurrentUser();
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
        log.info("Marked notification {} as read", notificationId);
    }

    /**
     * Đánh dấu tất cả notifications của user hiện tại là đã đọc
     */
    @Transactional
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        notificationRepository.markAllAsReadByRecipientId(currentUser.getId());
        log.info("Marked all notifications as read for user {}", currentUser.getId());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
