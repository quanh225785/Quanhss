package com.devteria.identityservice.dto.response;

import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {
    Long id;
    Long conversationId;
    
    // Thông tin người gửi
    String senderId;
    String senderName;
    String senderInitial;
    Boolean isCurrentUser;  // true nếu người đang đọc là người gửi
    
    String content;
    String imageUrl;
    Boolean isRead;
    
    LocalDateTime createdAt;
}
