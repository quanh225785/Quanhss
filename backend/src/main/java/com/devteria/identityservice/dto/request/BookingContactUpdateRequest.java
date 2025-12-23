package com.devteria.identityservice.dto.request;

import java.util.List;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingContactUpdateRequest {
    @NotEmpty(message = "Participant names cannot be empty")
    List<String> participantNames;  // Danh sách họ tên người tham gia

    @Pattern(regexp = "^(0[3|5|7|8|9])[0-9]{8}$", message = "INVALID_PHONE_NUMBER")
    String contactPhone;
}
