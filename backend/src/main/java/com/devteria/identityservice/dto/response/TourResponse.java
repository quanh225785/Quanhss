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
    String vehicle;
    Boolean isOptimized;
    Double totalDistance;  // meters
    Long totalTime;  // milliseconds
    String routePolyline;
    List<TourPointResponse> points;
    String createdByUsername;
    LocalDateTime createdAt;
    Boolean isActive;
    String status;  // PENDING, APPROVED, REJECTED
    String rejectionReason;

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
        // Location details
        Long locationId;
        String locationName;
        String locationAddress;
        Double latitude;
        Double longitude;
    }
}
