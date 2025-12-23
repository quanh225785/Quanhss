package com.devteria.identityservice.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProcessReportRequest {
    
    Boolean approved;  // true = duyệt, false = từ chối
    
    String adminNote;  // Ghi chú của admin (optional)
}
