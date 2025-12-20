package com.devteria.identityservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.dto.request.ReviewCreationRequest;
import com.devteria.identityservice.dto.request.ReviewReplyRequest;
import com.devteria.identityservice.dto.response.ReviewResponse;
import com.devteria.identityservice.entity.Booking;
import com.devteria.identityservice.entity.Review;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.BookingStatus;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.repository.BookingRepository;
import com.devteria.identityservice.repository.ReviewRepository;
import com.devteria.identityservice.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReviewService {
    
    ReviewRepository reviewRepository;
    BookingRepository bookingRepository;
    UserRepository userRepository;
    
    /**
     * Create a new review for a completed booking
     */
    @Transactional
    public ReviewResponse createReview(ReviewCreationRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Get booking and validate
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        // Check if booking belongs to user
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        // Check if booking is completed
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new AppException(ErrorCode.BOOKING_NOT_COMPLETED);
        }
        
        // Check if review already exists
        if (reviewRepository.existsByBookingId(request.getBookingId())) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }
        
        // Validate rating
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new AppException(ErrorCode.INVALID_RATING);
        }
        
        // Create review
        Review review = Review.builder()
                .booking(booking)
                .user(user)
                .tour(booking.getTour())
                .rating(request.getRating())
                .content(request.getContent())
                .build();
        
        review = reviewRepository.save(review);
        log.info("Created review {} for booking {}", review.getId(), booking.getBookingCode());
        
        return mapToResponse(review);
    }
    
    /**
     * Get reviews for a specific tour (public)
     */
    public List<ReviewResponse> getReviewsByTour(Long tourId) {
        return reviewRepository.findByTourIdOrderByCreatedAtDesc(tourId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all reviews for tours owned by current agent
     */
    public List<ReviewResponse> getReviewsForAgent() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        return reviewRepository.findByTour_CreatedByIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get reviews created by current user
     */
    public List<ReviewResponse> getMyReviews() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Agent reply to a review
     */
    @Transactional
    public ReviewResponse replyToReview(Long reviewId, ReviewReplyRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User agent = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        
        // Check if agent owns the tour
        if (!review.getTour().getCreatedBy().getId().equals(agent.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        // Update reply
        review.setAgentReply(request.getReplyContent());
        review.setAgentRepliedAt(LocalDateTime.now());
        
        review = reviewRepository.save(review);
        log.info("Agent {} replied to review {}", agent.getUsername(), reviewId);
        
        return mapToResponse(review);
    }
    
    /**
     * Check if a booking has been reviewed
     */
    public boolean hasReview(Long bookingId) {
        return reviewRepository.existsByBookingId(bookingId);
    }
    
    /**
     * Map Review entity to ReviewResponse
     */
    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .bookingId(review.getBooking().getId())
                .bookingCode(review.getBooking().getBookingCode())
                .tourId(review.getTour().getId())
                .tourName(review.getTour().getName())
                .tourImageUrl(review.getTour().getImageUrl())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFirstName() + 
                         (review.getUser().getLastName() != null ? " " + review.getUser().getLastName() : ""))
                .userAvatar(review.getUser().getAvatar())
                .rating(review.getRating())
                .content(review.getContent())
                .agentReply(review.getAgentReply())
                .agentRepliedAt(review.getAgentRepliedAt())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
