package com.devteria.identityservice.dto.request;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TourCreationRequest {
    String name;
    String description;
    Double price;
    Integer numberOfDays;  // Number of days for the tour (default 1)
    String vehicle;  // car, motorcycle
    Boolean useOptimization;  // true to use TSP, false for manual order
    Boolean roundtrip;  // for TSP: return to start point
    String imageUrl;  // S3 URL for tour thumbnail (after upload) - backward compatibility
    List<String> imageUrls;  // List of S3 URLs for multiple tour images
    List<TourPointRequest> points;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class TourPointRequest {
        Long locationId;
        Integer orderIndex;
        String note;
        Integer stayDurationMinutes;
        // Itinerary fields
        Integer dayNumber;  // Which day of the tour (1, 2, 3...)
        String startTime;   // Time slot, e.g., "08:00", "09:30"
        String activity;    // What to do, e.g., "Ăn sáng tại Mì Quảng 1A"
        String imageUrl;    // S3 URL for tour point image (after upload)
    }
}
