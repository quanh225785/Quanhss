package com.devteria.identityservice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.request.ReviewCreationRequest;
import com.devteria.identityservice.dto.request.ReviewReplyRequest;
import com.devteria.identityservice.dto.response.ReviewResponse;
import com.devteria.identityservice.service.ReviewService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReviewController {
    ReviewService reviewService;

    /**
     * Create a new review (USER - for completed booking)
     */
    @PostMapping
    public ApiResponse<ReviewResponse> createReview(@RequestBody ReviewCreationRequest request) {
        log.info("Creating review for booking: {}", request.getBookingId());
        return ApiResponse.<ReviewResponse>builder()
                .result(reviewService.createReview(request))
                .build();
    }

    /**
     * Get reviews created by current user
     */
    @GetMapping("/my")
    public ApiResponse<List<ReviewResponse>> getMyReviews() {
        return ApiResponse.<List<ReviewResponse>>builder()
                .result(reviewService.getMyReviews())
                .build();
    }

    /**
     * Get reviews for a specific tour (public)
     */
    @GetMapping("/tour/{tourId}")
    public ApiResponse<List<ReviewResponse>> getReviewsByTour(@PathVariable Long tourId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .result(reviewService.getReviewsByTour(tourId))
                .build();
    }

    /**
     * Get all reviews for agent's tours (AGENT)
     */
    @GetMapping("/agent")
    public ApiResponse<List<ReviewResponse>> getReviewsForAgent() {
        log.info("Getting reviews for agent");
        return ApiResponse.<List<ReviewResponse>>builder()
                .result(reviewService.getReviewsForAgent())
                .build();
    }

    /**
     * Agent reply to a review (AGENT)
     */
    @PutMapping("/{id}/reply")
    public ApiResponse<ReviewResponse> replyToReview(
            @PathVariable Long id,
            @RequestBody ReviewReplyRequest request) {
        log.info("Agent replying to review: {}", id);
        return ApiResponse.<ReviewResponse>builder()
                .result(reviewService.replyToReview(id, request))
                .build();
    }

    /**
     * Check if a booking has been reviewed
     */
    @GetMapping("/booking/{bookingId}/exists")
    public ApiResponse<Boolean> hasReview(@PathVariable Long bookingId) {
        return ApiResponse.<Boolean>builder()
                .result(reviewService.hasReview(bookingId))
                .build();
    }
}
