package com.devteria.identityservice.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TourResponse {
    Long id;
    String name;
    String description;
    Double price;
    Integer numberOfDays;  // Number of days for the tour
    String vehicle;
    Boolean isOptimized;
    Double totalDistance;  // meters
    Long totalTime;  // milliseconds
    String routePolyline;
    String imageUrl;  // S3 URL for tour thumbnail
    List<TourPointResponse> points;
    String createdByUsername;
    LocalDateTime createdAt;
    Boolean isActive;
    String status;  // PENDING, APPROVED, REJECTED, HIDDEN
    String rejectionReason;
    
    // Trip statistics (thống kê chuyến)
    List<TripResponse> trips;  // Danh sách các chuyến
    Integer totalTrips;  // Tổng số chuyến
    Integer activeTrips;  // Số chuyến còn mở


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class TourPointResponse {
        Long id;
        Integer orderIndex;
        String note;
        Integer stayDurationMinutes;
        // Itinerary fields
        Integer dayNumber;   // Which day (1, 2, 3...)
        String startTime;    // Time slot, e.g., "08:00"
        String activity;     // What to do at this location
        String imageUrl;     // S3 URL for tour point image
        // Location details
        Long locationId;
        String locationName;
        String locationAddress;
        Double latitude;
        Double longitude;
    }
}
