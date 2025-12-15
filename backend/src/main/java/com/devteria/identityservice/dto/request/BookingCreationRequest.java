package com.devteria.identityservice.dto.request;

import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingCreationRequest {
    Long tourId;
    List<String> participantNames;  // Danh sách họ tên người tham gia
    String contactPhone;
    String note;
}
