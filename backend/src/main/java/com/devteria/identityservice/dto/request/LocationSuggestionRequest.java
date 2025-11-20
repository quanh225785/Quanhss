package com.devteria.identityservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LocationSuggestionRequest {
    @NotBlank(message = "NAME_REQUIRED")
    @Size(min = 3, max = 255, message = "NAME_INVALID_LENGTH")
    String name;

    @NotBlank(message = "ADDRESS_REQUIRED")
    String address;

    @NotBlank(message = "DESCRIPTION_REQUIRED")
    String description;

    // Required: Data from Vietmap API (coordinates are mandatory)
    String refId;

    @jakarta.validation.constraints.NotNull(message = "COORDINATES_REQUIRED")
    Double latitude;

    @jakarta.validation.constraints.NotNull(message = "COORDINATES_REQUIRED")
    Double longitude;
    Integer cityId;
    String cityName;
    Integer districtId;
    String districtName;
    Integer wardId;
    String wardName;
    String houseNumber;
    String streetName;
}
