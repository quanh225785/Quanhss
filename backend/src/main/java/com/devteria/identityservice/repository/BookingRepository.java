package com.devteria.identityservice.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.Booking;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.Trip;
import com.devteria.identityservice.entity.User;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find bookings by user - OPTIMIZED with JOIN FETCH to avoid N+1
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.tour t " +
           "LEFT JOIN FETCH t.createdBy " +
           "LEFT JOIN FETCH b.trip " +
           "LEFT JOIN FETCH b.participants " +
           "WHERE b.user = :user " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findByUserWithDetailsOrderByCreatedAtDesc(@Param("user") User user);

    // Legacy method - keep for backward compatibility
    List<Booking> findByUserOrderByCreatedAtDesc(User user);

    // Find bookings by tour
    List<Booking> findByTourOrderByCreatedAtDesc(Tour tour);

    // Find bookings by trip
    List<Booking> findByTripOrderByCreatedAtDesc(Trip trip);

    // Find by booking code
    Optional<Booking> findByBookingCode(String bookingCode);

    // Count bookings created today (for generating booking code)
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt >= :startOfDay")
    long countBookingsCreatedToday(@Param("startOfDay") LocalDateTime startOfDay);

    // Check if user already booked this tour
    boolean existsByUserAndTour(User user, Tour tour);

    // Find expired unpaid bookings for auto-cancellation
    @Query("SELECT b FROM Booking b WHERE b.paymentStatus = :paymentStatus AND b.status != :excludeStatus AND b.createdAt < :cutoffTime")
    List<Booking> findByPaymentStatusAndStatusNotAndCreatedAtBefore(
        @Param("paymentStatus") com.devteria.identityservice.enums.PaymentStatus paymentStatus,
        @Param("excludeStatus") com.devteria.identityservice.enums.BookingStatus excludeStatus,
        @Param("cutoffTime") LocalDateTime cutoffTime
    );

    long countByStatus(com.devteria.identityservice.enums.BookingStatus status);

    long countByPaymentStatus(com.devteria.identityservice.enums.PaymentStatus paymentStatus);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.paymentStatus = :paymentStatus")
    Double sumTotalPriceByPaymentStatus(@Param("paymentStatus") com.devteria.identityservice.enums.PaymentStatus paymentStatus);

    // Find bookings for trip reminder (trip starts between startTime and endTime, status = CONFIRMED, not yet reminded)
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.tour " +
           "LEFT JOIN FETCH b.trip " +
           "WHERE b.status = :status " +
           "AND b.trip.startDate >= :startTime " +
           "AND b.trip.startDate < :endTime " +
           "AND b.reminderSent = false")
    List<Booking> findBookingsForTripReminder(
        @Param("status") com.devteria.identityservice.enums.BookingStatus status,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}
