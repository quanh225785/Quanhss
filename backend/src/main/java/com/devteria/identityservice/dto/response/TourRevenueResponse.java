package com.devteria.identityservice.dto.response;

import java.util.List;

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
public class TourRevenueResponse {
    Long tourId;
    String tourName;
    String tourImageUrl;
    Long totalBookings; // Tổng số đặt chỗ
    Double totalRevenue; // Tổng doanh thu từ bookings đã thanh toán
    List<TripRevenueResponse> trips; // Doanh thu theo từng chuyến
}

