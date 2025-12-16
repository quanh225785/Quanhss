package com.devteria.identityservice.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StartConversationRequest {
    String agentId;      // ID của agent để bắt đầu cuộc hội thoại
    Long tourId;         // ID của tour liên quan (optional)
    String initialMessage;  // Tin nhắn đầu tiên (optional)
}
