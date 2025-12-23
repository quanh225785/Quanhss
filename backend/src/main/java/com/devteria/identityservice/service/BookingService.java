package com.devteria.identityservice.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.dto.request.BookingCreationRequest;
import com.devteria.identityservice.dto.response.BookingResponse;
import com.devteria.identityservice.entity.Booking;
import com.devteria.identityservice.entity.Participant;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.Trip;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.BookingStatus;
import com.devteria.identityservice.enums.NotificationType;
import com.devteria.identityservice.enums.PaymentStatus;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.repository.BookingRepository;
import com.devteria.identityservice.repository.ReviewRepository;
import com.devteria.identityservice.repository.TourRepository;
import com.devteria.identityservice.repository.TripRepository;
import com.devteria.identityservice.repository.UserRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingService {

    BookingRepository bookingRepository;
    ReviewRepository reviewRepository;
    TourRepository tourRepository;
    TripRepository tripRepository;
    UserRepository userRepository;
    S3Client s3Client;
    NotificationService notificationService;
    EmailVerify emailVerify;

    @NonFinal
    @Value("${aws.s3.bucket-name}")
    String bucketName;

    @NonFinal
    @Value("${aws.s3.endpoint}")
    String endpoint;

    /**
     * Create a new booking for a trip
     */
    @Transactional
    public BookingResponse createBooking(BookingCreationRequest request) {
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Get trip
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        Tour tour = trip.getTour();

        // Validate trip is active
        if (!trip.getIsActive()) {
            throw new RuntimeException("This trip is not available for booking");
        }

        // Validate participants
        if (request.getParticipantNames() == null || request.getParticipantNames().isEmpty()) {
            throw new RuntimeException("At least one participant is required");
        }

        int numberOfParticipants = request.getParticipantNames().size();

        // Check availability
        int currentParticipants = trip.getCurrentParticipants() != null ? trip.getCurrentParticipants() : 0;
        if (currentParticipants + numberOfParticipants > trip.getMaxParticipants()) {
            throw new RuntimeException("Not enough spots available. Available: "
                    + (trip.getMaxParticipants() - currentParticipants));
        }

        // Check if trip has expired
        if (trip.getEndDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This trip has already ended");
        }

        // Generate booking code
        String bookingCode = generateBookingCode();

        // Calculate total price
        Double totalPrice = tour.getPrice() != null
                ? tour.getPrice() * numberOfParticipants
                : 0.0;

        // Create booking
        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .tour(tour)
                .trip(trip)
                .status(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .totalPrice(totalPrice)
                .contactPhone(request.getContactPhone())
                .note(request.getNote())
                .build();

        // Add participants
        for (String name : request.getParticipantNames()) {
            Participant participant = Participant.builder()
                    .fullName(name.trim())
                    .build();
            booking.addParticipant(participant);
        }

        // Save booking
        booking = bookingRepository.save(booking);

        // Generate and upload QR code
        String qrCodeUrl = generateAndUploadQRCode(bookingCode);
        booking.setQrCodeUrl(qrCodeUrl);
        booking = bookingRepository.save(booking);

        // Update trip current participants
        trip.setCurrentParticipants(
                (trip.getCurrentParticipants() != null ? trip.getCurrentParticipants() : 0) + numberOfParticipants);
        tripRepository.save(trip);

        log.info("Booking created: {} for trip: {} (tour: {}) by user: {}",
                bookingCode, trip.getId(), tour.getName(), username);

        // Gửi notification cho Agent owner của tour
        try {
            User agent = tour.getCreatedBy();
            String userName = user.getFirstName() != null 
                    ? user.getFirstName() + " " + user.getLastName() 
                    : user.getUsername();
            notificationService.createNotification(
                    agent,
                    NotificationType.NEW_BOOKING,
                    "Đặt tour mới!",
                    String.format("%s vừa đặt tour %s với %d người", userName, tour.getName(), numberOfParticipants),
                    tour.getId(),  // Gửi tourId để agent có thể navigate đến trang quản lý chuyến
                    "TOUR"
            );
        } catch (Exception e) {
            log.error("Failed to send notification for booking: {}", bookingCode, e);
            // Don't fail the booking if notification fails
        }

        return mapToResponse(booking);
    }

    /**
     * Get bookings for current user - OPTIMIZED to avoid N+1
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Use optimized query with JOIN FETCH
        List<Booking> bookings = bookingRepository.findByUserWithDetailsOrderByCreatedAtDesc(user);
        
        if (bookings.isEmpty()) {
            return List.of();
        }

        // Batch load review status for all bookings in one query
        List<Long> bookingIds = bookings.stream()
                .map(Booking::getId)
                .collect(Collectors.toList());
        
        Set<Long> bookingsWithReviews = new HashSet<>(
                reviewRepository.findBookingIdsWithReviews(bookingIds)
        );

        // Map to response with pre-loaded review status
        return bookings.stream()
                .map(booking -> mapToResponseWithReviewStatus(booking, bookingsWithReviews.contains(booking.getId())))
                .collect(Collectors.toList());
    }

    /**
     * Get bookings for a tour (for agent/owner)
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsForTour(Long tourId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        // Check if user is the owner of the tour
        if (!tour.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to view bookings for this tour");
        }

        return bookingRepository.findByTourOrderByCreatedAtDesc(tour)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get bookings for a trip (for agent/owner)
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsForTrip(Long tripId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        Tour tour = trip.getTour();

        // Check if user is the owner of the tour
        if (!tour.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to view bookings for this trip");
        }

        return bookingRepository.findByTripOrderByCreatedAtDesc(trip)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get booking by ID
     */
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        return mapToResponse(booking);
    }

    /**
     * Cancel booking
     */
    @Transactional
    public BookingResponse cancelBooking(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check if user owns this booking
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to cancel this booking");
        }

        // Check if already cancelled
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        // Update trip current participants
        Trip trip = booking.getTrip();
        int numberOfParticipants = booking.getNumberOfParticipants();
        trip.setCurrentParticipants(
                Math.max(0, (trip.getCurrentParticipants() != null ? trip.getCurrentParticipants() : 0)
                        - numberOfParticipants));
        tripRepository.save(trip);

        // Update booking status
        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        log.info("Booking cancelled: {}", booking.getBookingCode());

        return mapToResponse(booking);
    }

    /**
     * Mock payment - confirm payment for a booking
     */
    @Transactional
    public BookingResponse confirmPayment(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check if user owns this booking
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to pay for this booking");
        }

        // Update payment status
        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking = bookingRepository.save(booking);

        log.info("Payment confirmed for booking: {}", booking.getBookingCode());

        // Gửi email thông báo đặt tour thành công
        try {
            emailVerify.sendBookingSuccessEmail(booking);
        } catch (Exception e) {
            log.error("Failed to send booking success email for booking: {}", booking.getBookingCode(), e);
        }

        return mapToResponse(booking);
    }

    /**
     * Check-in using booking code (for agent)
     */
    @Transactional
    public BookingResponse checkIn(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify tour ownership
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!booking.getTour().getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to check-in for this tour");
        }

        // Mark as completed
        booking.setStatus(BookingStatus.COMPLETED);
        booking = bookingRepository.save(booking);

        log.info("Check-in completed for booking: {}", bookingCode);

        return mapToResponse(booking);
    }

    // ==================== Helper methods ====================

    /**
     * Generate booking code in format: BK-YYYYMMDD-XXX
     */
    private String generateBookingCode() {
        LocalDate today = LocalDate.now();
        String dateStr = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // Count bookings created today
        LocalDateTime startOfDay = today.atStartOfDay();
        long count = bookingRepository.countBookingsCreatedToday(startOfDay);

        return String.format("BK-%s-%03d", dateStr, count + 1);
    }

    /**
     * Generate QR code and upload to S3
     */
    private String generateAndUploadQRCode(String bookingCode) {
        try {
            // Generate QR code
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(
                    "BOOKING:" + bookingCode,
                    BarcodeFormat.QR_CODE,
                    300, 300);

            BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

            // Convert to byte array
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();

            // Upload to S3
            String key = "qrcodes/" + bookingCode + ".png";

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("image/png")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(imageBytes));

            String qrUrl = endpoint + "/" + bucketName + "/" + key;
            log.info("QR code uploaded: {}", qrUrl);

            return qrUrl;

        } catch (Exception e) {
            log.error("Failed to generate QR code for booking: {}", bookingCode, e);
            return null; // Return null if QR generation fails, booking can still proceed
        }
    }

    /**
     * Map Booking entity to BookingResponse
     */
    private BookingResponse mapToResponse(Booking booking) {
        return mapToResponseWithReviewStatus(booking, reviewRepository.existsByBookingId(booking.getId()));
    }

    /**
     * Map Booking entity to BookingResponse with pre-loaded review status (avoids N+1)
     */
    private BookingResponse mapToResponseWithReviewStatus(Booking booking, boolean hasReview) {
        Tour tour = booking.getTour();
        Trip trip = booking.getTrip();
        User user = booking.getUser();

        List<String> participantNames = booking.getParticipants().stream()
                .map(Participant::getFullName)
                .collect(Collectors.toList());

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .tourId(tour.getId())
                .tourName(tour.getName())
                .tourImageUrl(tour.getImageUrl())
                .tourNumberOfDays(tour.getNumberOfDays())
                // Trip info
                .tripId(trip != null ? trip.getId() : null)
                .tripStartDate(trip != null ? trip.getStartDate() : null)
                .tripEndDate(trip != null ? trip.getEndDate() : null)
                .userName(user.getFirstName() != null ? user.getFirstName() + " " + user.getLastName()
                        : user.getUsername())
                .userEmail(user.getEmail())
                .participantNames(participantNames)
                .numberOfParticipants(participantNames.size())
                .status(booking.getStatus().name())
                .paymentStatus(booking.getPaymentStatus().name())
                .totalPrice(booking.getTotalPrice())
                .contactPhone(booking.getContactPhone())
                .note(booking.getNote())
                .qrCodeUrl(booking.getQrCodeUrl())
                .hasReview(hasReview)
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
