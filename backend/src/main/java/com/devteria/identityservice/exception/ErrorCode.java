package com.devteria.identityservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_VERIFIED(1009, "Email not verified", HttpStatus.FORBIDDEN),
    INVALID_VERIFICATION_TOKEN(1010, "Invalid or expired verification token", HttpStatus.BAD_REQUEST),
    INVALID_RESET_TOKEN(1011, "Invalid or expired password reset token", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS(1012, "Email already exists", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1012, "Invalid email format", HttpStatus.BAD_REQUEST),
    LOCATION_SUGGESTION_NOT_FOUND(1013, "Location suggestion not found", HttpStatus.NOT_FOUND),
    LOCATION_SUGGESTION_ALREADY_PROCESSED(1014, "Location suggestion has already been processed",
            HttpStatus.BAD_REQUEST),
    LOCATION_NAME_ALREADY_EXISTS(1015, "Location with this name already exists", HttpStatus.BAD_REQUEST),
    LOCATION_NOT_FOUND(1016, "Location not found", HttpStatus.NOT_FOUND),
    COORDINATES_REQUIRED(1017, "Latitude and longitude are required for location suggestion", HttpStatus.BAD_REQUEST),
    USER_LOCATION_REQUIRED(1018, "User current location is required for searching nearby places",
            HttpStatus.BAD_REQUEST),
    TOUR_NOT_FOUND(1019, "Tour not found", HttpStatus.NOT_FOUND),
    CONVERSATION_NOT_FOUND(1020, "Conversation not found", HttpStatus.NOT_FOUND),
    USER_NOT_AGENT(1021, "User is not an agent", HttpStatus.BAD_REQUEST),
    MESSAGE_EMPTY(1022, "Message content or image is required", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_FOUND(1023, "Booking not found", HttpStatus.NOT_FOUND),
    BOOKING_NOT_COMPLETED(1024, "Booking is not completed yet", HttpStatus.BAD_REQUEST),
    REVIEW_ALREADY_EXISTS(1025, "Review already exists for this booking", HttpStatus.BAD_REQUEST),
    INVALID_RATING(1026, "Rating must be between 1 and 5", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_FOUND(1027, "Review not found", HttpStatus.NOT_FOUND),
    NOTIFICATION_NOT_FOUND(1028, "Notification not found", HttpStatus.NOT_FOUND),
    ACCOUNT_LOCKED(1029, "Account has been locked", HttpStatus.FORBIDDEN),
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
