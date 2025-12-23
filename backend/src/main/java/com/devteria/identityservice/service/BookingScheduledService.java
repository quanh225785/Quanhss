package com.devteria.identityservice.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.entity.Booking;
import com.devteria.identityservice.enums.BookingStatus;
import com.devteria.identityservice.enums.PaymentStatus;
import com.devteria.identityservice.repository.BookingRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Scheduled task service for handling booking timeouts.
 * Automatically cancels bookings that haven't been paid within the timeout period.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingScheduledService {
    
    BookingRepository bookingRepository;
    
    // 10 minutes timeout for payment
    private static final int PAYMENT_TIMEOUT_MINUTES = 10;
    
    /**
     * Runs every minute to check for expired unpaid bookings.
     * Cancels any booking that:
     * - Has PENDING payment status
     * - Is not already CANCELLED
     * - Was created more than PAYMENT_TIMEOUT_MINUTES ago
     */
    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void cancelExpiredBookings() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(PAYMENT_TIMEOUT_MINUTES);
        
        List<Booking> expiredBookings = bookingRepository.findByPaymentStatusAndStatusNotAndCreatedAtBefore(
            PaymentStatus.PENDING,
            BookingStatus.CANCELLED,
            cutoffTime
        );
        
        if (!expiredBookings.isEmpty()) {
            log.info("Found {} expired unpaid bookings to cancel", expiredBookings.size());
            
            for (Booking booking : expiredBookings) {
                booking.setStatus(BookingStatus.CANCELLED);
                booking.setPaymentStatus(PaymentStatus.PENDING); // Keep as pending since never paid
                bookingRepository.save(booking);
                
                // Restore available slots in trip by reducing currentParticipants
                if (booking.getTrip() != null) {
                    int currentParticipants = booking.getTrip().getCurrentParticipants() != null 
                        ? booking.getTrip().getCurrentParticipants() : 0;
                    booking.getTrip().setCurrentParticipants(
                        Math.max(0, currentParticipants - booking.getNumberOfParticipants())
                    );
                }
                
                log.info("Auto-cancelled expired booking: {} (created at: {})", 
                    booking.getBookingCode(), booking.getCreatedAt());
            }
        }
    }
}
