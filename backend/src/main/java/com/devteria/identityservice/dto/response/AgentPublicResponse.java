package com.devteria.identityservice.dto.response;

import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AgentPublicResponse {
    String id;
    String username;
    String firstName;
    String lastName;
    String avatar;
    
    // Statistics
    Integer totalTours;
    Integer totalReviews;
    Double averageRating;
    
    // Tours by this agent
    List<TourResponse> tours;
}
