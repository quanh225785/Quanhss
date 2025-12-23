package com.devteria.identityservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
        UNCATEGORIZED_EXCEPTION(9999, "Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
        INVALID_KEY(1001, "Lỗi không xác định", HttpStatus.BAD_REQUEST),
        USER_EXISTED(1002, "Người dùng đã tồn tại", HttpStatus.BAD_REQUEST),
        USERNAME_INVALID(1003, "Tên đăng nhập phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
        INVALID_PASSWORD(1004, "Mật khẩu phải có ít nhất 6 ký tự và có ít nhất 1 chữ cái", HttpStatus.BAD_REQUEST),
        USER_NOT_EXISTED(1005, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
        UNAUTHENTICATED(1006, "Tên đăng nhập hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
        UNAUTHORIZED(1007, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
        INVALID_DOB(1008, "Tuổi của bạn phải ít nhất {min}", HttpStatus.BAD_REQUEST),
        EMAIL_NOT_VERIFIED(1009, "Email chưa được xác thực", HttpStatus.FORBIDDEN),
        INVALID_VERIFICATION_TOKEN(1010, "Mã xác thực không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
        INVALID_RESET_TOKEN(1011, "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
        EMAIL_ALREADY_EXISTS(1012, "Email đã tồn tại", HttpStatus.BAD_REQUEST),
        INVALID_EMAIL(1012, "Định dạng email không hợp lệ", HttpStatus.BAD_REQUEST),
        LOCATION_SUGGESTION_NOT_FOUND(1013, "Không tìm thấy đề xuất địa điểm", HttpStatus.NOT_FOUND),
        LOCATION_SUGGESTION_ALREADY_PROCESSED(1014, "Đề xuất địa điểm đã được xử lý",
                        HttpStatus.BAD_REQUEST),
        LOCATION_NAME_ALREADY_EXISTS(1015, "Địa điểm với tên này đã tồn tại", HttpStatus.BAD_REQUEST),
        LOCATION_NOT_FOUND(1016, "Không tìm thấy địa điểm", HttpStatus.NOT_FOUND),
        COORDINATES_REQUIRED(1017, "Yêu cầu vĩ độ và kinh độ cho đề xuất địa điểm", HttpStatus.BAD_REQUEST),
        USER_LOCATION_REQUIRED(1018, "Yêu cầu vị trí hiện tại của người dùng để tìm kiếm địa điểm gần đây",
                        HttpStatus.BAD_REQUEST),
        TOUR_NOT_FOUND(1019, "Không tìm thấy tour", HttpStatus.NOT_FOUND),
        CONVERSATION_NOT_FOUND(1020, "Không tìm thấy cuộc trò chuyện", HttpStatus.NOT_FOUND),
        USER_NOT_AGENT(1021, "Người dùng không phải là đại lý", HttpStatus.BAD_REQUEST),
        MESSAGE_EMPTY(1022, "Yêu cầu nội dung tin nhắn hoặc hình ảnh", HttpStatus.BAD_REQUEST),
        BOOKING_NOT_FOUND(1023, "Không tìm thấy đặt chỗ", HttpStatus.NOT_FOUND),
        BOOKING_NOT_COMPLETED(1024, "Đặt chỗ chưa hoàn thành", HttpStatus.BAD_REQUEST),
        REVIEW_ALREADY_EXISTS(1025, "Đánh giá đã tồn tại cho đặt chỗ này", HttpStatus.BAD_REQUEST),
        INVALID_RATING(1026, "Đánh giá phải từ 1 đến 5", HttpStatus.BAD_REQUEST),
        REVIEW_NOT_FOUND(1027, "Không tìm thấy đánh giá", HttpStatus.NOT_FOUND),
        NOTIFICATION_NOT_FOUND(1028, "Không tìm thấy thông báo", HttpStatus.NOT_FOUND),
        ACCOUNT_LOCKED(1029, "Tài khoản đã bị khóa", HttpStatus.FORBIDDEN),
        CURRENT_PASSWORD_INVALID(1030, "Mật khẩu hiện tại không hợp lệ", HttpStatus.BAD_REQUEST),
        REPORT_NOT_FOUND(1031, "Không tìm thấy báo cáo", HttpStatus.NOT_FOUND),
        REPORT_ALREADY_PROCESSED(1032, "Báo cáo đã được xử lý", HttpStatus.BAD_REQUEST),
        CANNOT_REPORT_SELF(1033, "Không thể tự báo cáo bản thân", HttpStatus.BAD_REQUEST),
        ALREADY_REPORTED(1034, "Bạn đã báo cáo đối tượng này trước đó", HttpStatus.BAD_REQUEST),
        ;

        ErrorCode(int code, String message, HttpStatusCode statusCode) {
                this.code = code;
                this.message = message;
                this.statusCode = statusCode;
        }

        private final int code;
        private final String message;
        private final HttpStatusCode statusCode;
}
