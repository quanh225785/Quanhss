package com.devteria.identityservice.dto.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TripRevenueResponse {
    Long tripId;
    LocalDateTime startDate;
    LocalDateTime endDate;
    Long totalBookings; // Tổng số đặt chỗ cho chuyến này
    Double totalRevenue; // Tổng doanh thu từ bookings đã thanh toán
}

