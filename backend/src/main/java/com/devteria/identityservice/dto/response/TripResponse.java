package com.devteria.identityservice.dto.response;

import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TripResponse {
    Long id;
    Long tourId;
    String tourName;
    LocalDateTime startDate;
    LocalDateTime endDate;
    Integer maxParticipants;
    Integer currentParticipants;
    Integer availableSlots;  // maxParticipants - currentParticipants
    Boolean isActive;
    Boolean isFull;
    LocalDateTime createdAt;
}
