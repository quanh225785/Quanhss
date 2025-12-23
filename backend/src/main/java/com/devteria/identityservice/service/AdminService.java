package com.devteria.identityservice.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.dto.response.AdminStatsResponse;
import com.devteria.identityservice.entity.Booking;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.BookingStatus;
import com.devteria.identityservice.enums.PaymentStatus;
import com.devteria.identityservice.enums.TourStatus;
import com.devteria.identityservice.repository.BookingRepository;
import com.devteria.identityservice.repository.TourRepository;
import com.devteria.identityservice.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminService {
    UserRepository userRepository;
    TourRepository tourRepository;
    BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public AdminStatsResponse getSystemStats() {
        // User Stats
        long totalUsers = userRepository.count();
        long totalGuests = userRepository.countByRoleName("USER");
        long totalAgents = userRepository.countByRoleName("AGENT");
        long totalAdmins = userRepository.countByRoleName("ADMIN");

        // Tour Stats
        long totalTours = tourRepository.count();
        long pendingTours = tourRepository.countByStatusAndIsActiveTrue(TourStatus.PENDING);
        long approvedTours = tourRepository.countByStatusAndIsActiveTrue(TourStatus.APPROVED);
        long rejectedTours = tourRepository.countByStatusAndIsActiveTrue(TourStatus.REJECTED);
        long hiddenTours = tourRepository.countByStatusAndIsActiveTrue(TourStatus.HIDDEN);

        // Booking Stats
        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);

        // Revenue Stats
        double totalRevenue = bookingRepository.sumTotalPriceByPaymentStatus(PaymentStatus.PAID);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        List<Booking> allBookings = bookingRepository.findAll();
        double thisMonthRevenue = allBookings.stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
                .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(startOfMonth))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                .sum();

        // Monthly Trends
        Map<String, Long> usersByMonth = getUsersByMonth();
        Map<String, Long> toursByMonth = getToursByMonth();
        Map<String, Long> bookingsByMonth = getBookingsByMonth();
        Map<String, Double> revenueByMonth = getRevenueByMonth();

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalGuests(totalGuests)
                .totalAgents(totalAgents)
                .totalAdmins(totalAdmins)
                .totalTours(totalTours)
                .pendingTours(pendingTours)
                .approvedTours(approvedTours)
                .rejectedTours(rejectedTours)
                .hiddenTours(hiddenTours)
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .confirmedBookings(confirmedBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .totalRevenue(totalRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .usersByMonth(usersByMonth)
                .toursByMonth(toursByMonth)
                .bookingsByMonth(bookingsByMonth)
                .revenueByMonth(revenueByMonth)
                .build();
    }

    private Map<String, Long> getUsersByMonth() {
        Map<String, Long> result = createEmptyMonthlyMap(0L);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        List<User> users = userRepository.findAll();
        Map<String, Long> usersCount = users.stream()
                .filter(u -> u.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        u -> u.getCreatedAt().format(formatter),
                        Collectors.counting()
                ));
        result.putAll(usersCount);
        return result;
    }

    private Map<String, Long> getToursByMonth() {
        Map<String, Long> result = createEmptyMonthlyMap(0L);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        List<Tour> tours = tourRepository.findAll();
        Map<String, Long> toursCount = tours.stream()
                .filter(t -> t.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCreatedAt().format(formatter),
                        Collectors.counting()
                ));
        result.putAll(toursCount);
        return result;
    }

    private Map<String, Long> getBookingsByMonth() {
        Map<String, Long> result = createEmptyMonthlyMap(0L);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        List<Booking> bookings = bookingRepository.findAll();
        Map<String, Long> bookingsCount = bookings.stream()
                .filter(b -> b.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getCreatedAt().format(formatter),
                        Collectors.counting()
                ));
        result.putAll(bookingsCount);
        return result;
    }

    private Map<String, Double> getRevenueByMonth() {
        Map<String, Double> result = createEmptyMonthlyMap(0.0);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
                .collect(Collectors.toList());
                
        Map<String, Double> revenueCount = bookings.stream()
                .filter(b -> b.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getCreatedAt().format(formatter),
                        Collectors.summingDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                ));
        result.putAll(revenueCount);
        return result;
    }

    private <T> Map<String, T> createEmptyMonthlyMap(T defaultValue) {
        Map<String, T> result = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = now.minusMonths(i);
            String monthKey = month.format(formatter);
            result.put(monthKey, defaultValue);
        }
        return result;
    }
}
