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
    Long tripId;  // ID của chuyến được đặt (thay vì tourId)
    List<String> participantNames;  // Danh sách họ tên người tham gia
    String contactPhone;
    String note;
}
