package com.devteria.identityservice.enums;

public enum NotificationType {
    // Thông báo cho Agent
    NEW_BOOKING,        // Có đặt chỗ mới
    BOOKING_CANCELLED,  // Đặt chỗ bị hủy
    NEW_REVIEW,         // Có đánh giá mới
    TOUR_APPROVED,      // Tour được duyệt
    TOUR_REJECTED,      // Tour bị từ chối
    REPORT_WARNING,     // Cảnh báo vi phạm từ báo cáo
    
    // Thông báo cho Customer
    CHECKIN_CONFIRMED,  // Xác nhận check-in thành công
    REVIEW_REPLIED,     // Agent đã phản hồi đánh giá
    TRIP_REMINDER       // Nhắc nhở chuyến đi sắp diễn ra (1 ngày trước)
}
