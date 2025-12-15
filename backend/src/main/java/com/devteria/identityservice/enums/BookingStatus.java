package com.devteria.identityservice.enums;

public enum BookingStatus {
    PENDING,    // Chờ xác nhận
    CONFIRMED,  // Đã xác nhận
    CANCELLED,  // Đã hủy
    COMPLETED   // Đã hoàn thành (sau khi tour kết thúc)
}
