package com.devteria.identityservice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.response.NotificationResponse;
import com.devteria.identityservice.service.NotificationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationController {

    NotificationService notificationService;

    /**
     * Lấy danh sách notifications của user hiện tại
     * GET /notifications
     */
    @GetMapping
    public ApiResponse<List<NotificationResponse>> getMyNotifications() {
        log.info("Getting notifications for current user");
        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getMyNotifications())
                .build();
    }

    /**
     * Lấy số notification chưa đọc
     * GET /notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        return ApiResponse.<Long>builder()
                .result(notificationService.getUnreadCount())
                .build();
    }

    /**
     * Đánh dấu 1 notification là đã đọc
     * PUT /notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id) {
        log.info("Marking notification {} as read", id);
        notificationService.markAsRead(id);
        return ApiResponse.<Void>builder()
                .message("Notification marked as read")
                .build();
    }

    /**
     * Đánh dấu tất cả notifications là đã đọc
     * PUT /notifications/read-all
     */
    @PutMapping("/read-all")
    public ApiResponse<Void> markAllAsRead() {
        log.info("Marking all notifications as read");
        notificationService.markAllAsRead();
        return ApiResponse.<Void>builder()
                .message("All notifications marked as read")
                .build();
    }
}
