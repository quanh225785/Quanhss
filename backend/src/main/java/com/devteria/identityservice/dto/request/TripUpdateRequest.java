package com.devteria.identityservice.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TripUpdateRequest {
    
    LocalDateTime startDate;
    
    LocalDateTime endDate;
    
    @Min(value = 1, message = "Max participants must be at least 1")
    Integer maxParticipants;
    
    Boolean isActive;
}
