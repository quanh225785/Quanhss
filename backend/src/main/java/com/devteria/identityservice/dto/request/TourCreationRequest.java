package com.devteria.identityservice.dto.request;

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
    String vehicle;  // car, motorcycle
    Boolean useOptimization;  // true to use TSP, false for manual order
    Boolean roundtrip;  // for TSP: return to start point
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
    }
}
