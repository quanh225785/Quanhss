package com.devteria.identityservice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.BookingCreationRequest;
import com.devteria.identityservice.dto.response.ApiResponse;
import com.devteria.identityservice.dto.response.BookingResponse;
import com.devteria.identityservice.service.BookingService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingController 
    BookingService bookingService;

    /**
     * Create a new booking (USER)
     */
    @PostMapping
    public ApiResponse<BookingResponse> createBooking(@RequestBody BookingCreationRequest request) {
        log.info("Creating booking for tour: {}", request.getTourId());
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.createBooking(request))
                .build();
    }

    /**
     * Get my bookings (USER)
     */
    @GetMapping("/my")
    public ApiResponse<List<BookingResponse>> getMyBookings() {
        return ApiResponse.<List<BookingResponse>>builder()
                .result(bookingService.getMyBookings())
                .build();
    }

    /**
     * Get booking by ID (USER)
     */
    @GetMapping("/{id}")
    public ApiResponse<BookingResponse> getBookingById(@PathVariable Long id) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.getBookingById(id))
                .build();
    }

    /**
     * Cancel booking (USER)
     */
    @PutMapping("/{id}/cancel")
    public ApiResponse<BookingResponse> cancelBooking(@PathVariable Long id) {
        log.info("Cancelling booking: {}", id);
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.cancelBooking(id))
                .build();
    }

    /**
     * Mock payment - confirm payment (USER)
     */
    @PutMapping("/{id}/pay")
    public ApiResponse<BookingResponse> confirmPayment(@PathVariable Long id) {
        log.info("Processing payment for booking: {}", id);
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.confirmPayment(id))
                .build();
    }

    /**
     * Get bookings for a specific tour (AGENT - owner only)
     */
    @GetMapping("/tour/{tourId}")
    public ApiResponse<List<BookingResponse>> getBookingsForTour(@PathVariable Long tourId) {
        log.info("Getting bookings for tour: {}", tourId);
        return ApiResponse.<List<BookingResponse>>builder()
                .result(bookingService.getBookingsForTour(tourId))
                .build();
    }

    /**
     * Check-in using booking code (AGENT)
     */
    @PutMapping("/checkin/{bookingCode}")
    public ApiResponse<BookingResponse> checkIn(@PathVariable String bookingCode) {
        log.info("Check-in for booking: {}", bookingCode);
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.checkIn(bookingCode))
                .build();
    }
}
