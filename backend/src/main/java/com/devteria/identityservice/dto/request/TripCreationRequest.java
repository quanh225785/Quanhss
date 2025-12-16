package com.devteria.identityservice.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TripCreationRequest {
    
    @NotNull(message = "Tour ID is required")
    Long tourId;
    
    @NotNull(message = "Start date is required")
    LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    LocalDateTime endDate;
    
    @NotNull(message = "Max participants is required")
    @Min(value = 1, message = "Max participants must be at least 1")
    Integer maxParticipants;
}
