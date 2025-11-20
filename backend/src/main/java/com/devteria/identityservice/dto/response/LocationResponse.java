package com.devteria.identityservice.dto.response;

import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LocationResponse {
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
    LocalDateTime createdAt;
    String createdByUsername;
    Long approvedFromSuggestionId;
}
