package com.devteria.identityservice.dto.response;

import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatConversationResponse {
    Long id;
    
    // Thông tin đối tác chat (user hoặc agent)
    String partnerId;
    String partnerName;
    String partnerInitial;
    
    // Thông tin tour liên quan (nếu có)
    Long tourId;
    String tourName;
    
    // Tin nhắn cuối cùng
    String lastMessage;
    LocalDateTime lastMessageAt;
    
    // Số tin nhắn chưa đọc
    Long unreadCount;
    
    LocalDateTime createdAt;
}
