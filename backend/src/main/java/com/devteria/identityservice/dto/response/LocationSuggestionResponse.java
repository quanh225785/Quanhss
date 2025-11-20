package com.devteria.identityservice.dto.response;

import java.time.LocalDateTime;

import com.devteria.identityservice.enums.SuggestionStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LocationSuggestionResponse {
    Long id;
    String name;
    String address;
    String description;
    String refId;
    Double latitude;
    Double longitude;
    Integer cityId;
    String cityName;
    Integer districtId;
    String districtName;
    Integer wardId;
    String wardName;
    String houseNumber;
    String streetName;
    SuggestionStatus status;
    String suggestedByUsername;
    String suggestedByUserId;
    LocalDateTime createdAt;
    LocalDateTime reviewedAt;
    String reviewedByUsername;
    String rejectionReason;
}
