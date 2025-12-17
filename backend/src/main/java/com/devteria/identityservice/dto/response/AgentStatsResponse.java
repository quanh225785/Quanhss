package com.devteria.identityservice.dto.response;

import java.util.Map;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AgentStatsResponse {
    // Tổng số lượng
    Long totalTours;
    Long totalTrips;
    Long totalBookings;
    
    // Tours theo trạng thái
    Long pendingTours;
    Long approvedTours;
    Long rejectedTours;
    Long hiddenTours;
    
    // Doanh thu
    Double totalRevenue; // Tổng doanh thu từ bookings đã thanh toán
    Double thisMonthRevenue; // Doanh thu tháng này
    
    // Thống kê theo tháng (6 tháng gần nhất)
    Map<String, Long> toursByMonth; // Key: "YYYY-MM", Value: số lượng tour
    Map<String, Long> bookingsByMonth; // Key: "YYYY-MM", Value: số lượng booking
    Map<String, Double> revenueByMonth; // Key: "YYYY-MM", Value: doanh thu (VNĐ)
}

