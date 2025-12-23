package com.devteria.identityservice.dto.request;

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
public class TourUpdateRequest {
    String description;
    List<String> imageUrls;
    List<TourPointUpdateRequest> points;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class TourPointUpdateRequest {
        Long id;
        String note;
        String activity;
        String imageUrl;
    }
}
