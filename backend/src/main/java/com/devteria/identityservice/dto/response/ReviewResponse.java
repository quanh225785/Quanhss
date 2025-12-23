package com.devteria.identityservice.dto.response;

import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {
    Long id;
    Long bookingId;
    String bookingCode;
    Long tourId;
    String tourName;
    String tourImageUrl;
    String userId;
    String userName;
    String userAvatar;
    Integer rating;
    String content;
    String agentReply;
    LocalDateTime agentRepliedAt;
    LocalDateTime createdAt;
}
