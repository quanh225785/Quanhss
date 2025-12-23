package com.devteria.identityservice.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.entity.Booking;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.Trip;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.BookingStatus;
import com.devteria.identityservice.enums.NotificationType;
import com.devteria.identityservice.repository.BookingRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Scheduled service for sending trip reminder notifications to customers.
 * Sends reminders 1 day before the trip starts.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TripReminderService {

    BookingRepository bookingRepository;
    NotificationService notificationService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Runs every hour to check for trips starting in the next 24-25 hours.
     * Sends reminder notifications to customers with confirmed bookings.
     * Each booking is only reminded once (tracked by reminderSent flag).
     */
    @Scheduled(fixedRate = 3600000) // Run every hour (3600000 ms)
    @Transactional
    public void sendTripReminders() {
        LocalDateTime now = LocalDateTime.now();
        // Find trips starting between 23 and 25 hours from now (gives 2-hour window to catch all)
        LocalDateTime reminderStart = now.plusHours(23);
        LocalDateTime reminderEnd = now.plusHours(25);

        log.info("Checking for trip reminders between {} and {}", reminderStart, reminderEnd);

        List<Booking> bookingsToRemind = bookingRepository.findBookingsForTripReminder(
                BookingStatus.CONFIRMED,
                reminderStart,
                reminderEnd
        );

        if (bookingsToRemind.isEmpty()) {
            log.debug("No bookings found for trip reminder");
            return;
        }

        log.info("Found {} bookings to send trip reminders", bookingsToRemind.size());

        for (Booking booking : bookingsToRemind) {
            try {
                sendReminderNotification(booking);
                
                // Mark as reminded to prevent duplicate notifications
                booking.setReminderSent(true);
                bookingRepository.save(booking);
                
                log.info("Sent trip reminder for booking: {}", booking.getBookingCode());
            } catch (Exception e) {
                log.error("Failed to send trip reminder for booking: {}", booking.getBookingCode(), e);
            }
        }
    }

    /**
     * Send reminder notification to customer
     */
    private void sendReminderNotification(Booking booking) {
        User customer = booking.getUser();
        Tour tour = booking.getTour();
        Trip trip = booking.getTrip();

        String startDateStr = trip.getStartDate().format(DATE_FORMATTER);
        int numParticipants = booking.getNumberOfParticipants();

        String message = String.format(
                "Chuyến đi \"%s\" của bạn sẽ bắt đầu vào ngày %s. " +
                "Bạn đã đăng ký %d người tham gia. " +
                "Hãy chuẩn bị hành lý và đến điểm tập trung đúng giờ nhé!",
                tour.getName(),
                startDateStr,
                numParticipants
        );

        notificationService.createNotification(
                customer,
                NotificationType.TRIP_REMINDER,
                "Nhắc nhở: Chuyến đi sắp bắt đầu!",
                message,
                booking.getId(),
                "BOOKING"
        );
    }

    /**
     * Manual method to send reminder for a specific booking (for testing or manual trigger)
     */
    @Transactional
    public void sendReminderForBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getReminderSent()) {
            log.warn("Reminder already sent for booking: {}", booking.getBookingCode());
            return;
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            log.warn("Cannot send reminder for non-confirmed booking: {}", booking.getBookingCode());
            return;
        }

        sendReminderNotification(booking);
        booking.setReminderSent(true);
        bookingRepository.save(booking);

        log.info("Manually sent trip reminder for booking: {}", booking.getBookingCode());
    }
}
