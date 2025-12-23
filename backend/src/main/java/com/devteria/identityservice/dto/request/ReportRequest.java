package com.devteria.identityservice.dto.request;

import com.devteria.identityservice.enums.ReportTargetType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportRequest {
    
    @NotNull(message = "Loại đối tượng không được để trống")
    ReportTargetType targetType;
    
    @NotBlank(message = "ID đối tượng không được để trống")
    String targetId;
    
    @NotBlank(message = "Lý do báo cáo không được để trống")
    @Size(min = 10, message = "Lý do báo cáo phải có ít nhất 10 ký tự")
    String reason;
}
