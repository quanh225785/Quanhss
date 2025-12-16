package com.devteria.identityservice.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendMessageRequest {
    Long conversationId;  // ID cuộc hội thoại
    String content;       // Nội dung tin nhắn (nullable nếu chỉ gửi ảnh)
    String imageUrl;      // URL ảnh (nullable nếu chỉ gửi text)
}
