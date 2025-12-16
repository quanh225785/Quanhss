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

    // Find bookings by user
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
}
