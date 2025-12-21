package com.devteria.identityservice.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.dto.response.AgentStatsResponse;
import com.devteria.identityservice.dto.response.TourRevenueResponse;
import com.devteria.identityservice.dto.response.TripRevenueResponse;
import com.devteria.identityservice.entity.Booking;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.Trip;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.PaymentStatus;
import com.devteria.identityservice.enums.TourStatus;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.repository.BookingRepository;
import com.devteria.identityservice.repository.TourRepository;
import com.devteria.identityservice.repository.TripRepository;
import com.devteria.identityservice.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AgentService {
    UserRepository userRepository;
    TourRepository tourRepository;
    TripRepository tripRepository;
    BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public AgentStatsResponse getAgentStats() {
        // Get current agent
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User agent = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Đếm tổng số lượng
        List<Tour> myTours = tourRepository.findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(agent);
        long totalTours = myTours.size();
        
        // Get all trips for agent's tours
        long totalTrips = myTours.stream()
                .mapToLong(tour -> tripRepository.findByTourOrderByStartDateAsc(tour).size())
                .sum();
        
        // Get all bookings for agent's tours
        long totalBookings = myTours.stream()
                .mapToLong(tour -> bookingRepository.findByTourOrderByCreatedAtDesc(tour).size())
                .sum();

        // Đếm tours theo trạng thái
        long pendingTours = myTours.stream()
                .filter(t -> t.getStatus() == TourStatus.PENDING)
                .count();
        long approvedTours = myTours.stream()
                .filter(t -> t.getStatus() == TourStatus.APPROVED)
                .count();
        long rejectedTours = myTours.stream()
                .filter(t -> t.getStatus() == TourStatus.REJECTED)
                .count();
        long hiddenTours = myTours.stream()
                .filter(t -> t.getStatus() == TourStatus.HIDDEN)
                .count();

        // Tính doanh thu từ bookings đã thanh toán
        List<Tour> allTours = tourRepository.findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(agent);
        List<Booking> allBookings = allTours.stream()
                .flatMap(tour -> bookingRepository.findByTourOrderByCreatedAtDesc(tour).stream())
                .collect(Collectors.toList());
        
        // Tổng doanh thu từ bookings đã thanh toán
        double totalRevenue = allBookings.stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                .sum();
        
        // Doanh thu tháng này
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        double thisMonthRevenue = allBookings.stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
                .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(startOfMonth))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                .sum();

        // Thống kê theo tháng (6 tháng gần nhất)
        Map<String, Long> toursByMonth = getToursByMonth(myTours);
        Map<String, Long> bookingsByMonth = getBookingsByMonth(agent);
        Map<String, Double> revenueByMonth = getRevenueByMonth(agent);

        return AgentStatsResponse.builder()
                .totalTours(totalTours)
                .totalTrips(totalTrips)
                .totalBookings(totalBookings)
                .pendingTours(pendingTours)
                .approvedTours(approvedTours)
                .rejectedTours(rejectedTours)
                .hiddenTours(hiddenTours)
                .totalRevenue(totalRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .toursByMonth(toursByMonth)
                .bookingsByMonth(bookingsByMonth)
                .revenueByMonth(revenueByMonth)
                .build();
    }

    private Map<String, Long> getToursByMonth(List<Tour> tours) {
        Map<String, Long> result = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        // Khởi tạo 6 tháng gần nhất với giá trị 0
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = now.minusMonths(i);
            String monthKey = month.format(formatter);
            result.put(monthKey, 0L);
        }

        // Đếm tours theo tháng
        Map<String, Long> toursCount = tours.stream()
                .filter(t -> t.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        tour -> tour.getCreatedAt().format(formatter),
                        Collectors.counting()
                ));

        // Cập nhật kết quả
        result.putAll(toursCount);
        return result;
    }

    private Map<String, Long> getBookingsByMonth(User agent) {
        Map<String, Long> result = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        // Khởi tạo 6 tháng gần nhất với giá trị 0
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = now.minusMonths(i);
            String monthKey = month.format(formatter);
            result.put(monthKey, 0L);
        }

        // Get all bookings for agent's tours
        List<Tour> myTours = tourRepository.findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(agent);
        List<Booking> allBookings = myTours.stream()
                .flatMap(tour -> bookingRepository.findByTourOrderByCreatedAtDesc(tour).stream())
                .collect(Collectors.toList());

        // Đếm bookings theo tháng
        Map<String, Long> bookingsCount = allBookings.stream()
                .filter(b -> b.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        booking -> booking.getCreatedAt().format(formatter),
                        Collectors.counting()
                ));

        // Cập nhật kết quả
        result.putAll(bookingsCount);
        return result;
    }

    private Map<String, Double> getRevenueByMonth(User agent) {
        Map<String, Double> result = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        // Khởi tạo 6 tháng gần nhất với giá trị 0
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = now.minusMonths(i);
            String monthKey = month.format(formatter);
            result.put(monthKey, 0.0);
        }

        // Get all bookings for agent's tours (chỉ tính bookings đã thanh toán)
        List<Tour> myTours = tourRepository.findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(agent);
        List<Booking> paidBookings = myTours.stream()
                .flatMap(tour -> bookingRepository.findByTourOrderByCreatedAtDesc(tour).stream())
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
                .collect(Collectors.toList());

        // Tính doanh thu theo tháng
        Map<String, Double> revenueCount = paidBookings.stream()
                .filter(b -> b.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        booking -> booking.getCreatedAt().format(formatter),
                        Collectors.summingDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                ));

        // Cập nhật kết quả
        result.putAll(revenueCount);
        return result;
    }

    /**
     * Get detailed revenue report by tour and trip
     */
    @Transactional(readOnly = true)
    public List<TourRevenueResponse> getRevenueByTour() {
        // Get current agent
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User agent = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Get all tours for agent
        List<Tour> myTours = tourRepository.findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(agent);

        return myTours.stream()
                .map(tour -> {
                    // Get all bookings for this tour
                    List<Booking> tourBookings = bookingRepository.findByTourOrderByCreatedAtDesc(tour);
                    
                    // Calculate total bookings and revenue for tour
                    long totalBookings = tourBookings.size();
                    double totalRevenue = tourBookings.stream()
                            .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
                            .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                            .sum();

                    // Get all trips for this tour
                    List<Trip> trips = tripRepository.findByTourOrderByStartDateAsc(tour);
                    
                    // Calculate revenue by trip
                    List<TripRevenueResponse> tripRevenues = trips.stream()
                            .map(trip -> {
                                List<Booking> tripBookings = bookingRepository.findByTripOrderByCreatedAtDesc(trip);
                                long tripTotalBookings = tripBookings.size();
                                double tripTotalRevenue = tripBookings.stream()
                                        .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
                                        .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                                        .sum();
                                
                                return TripRevenueResponse.builder()
                                        .tripId(trip.getId())
                                        .startDate(trip.getStartDate())
                                        .endDate(trip.getEndDate())
                                        .totalBookings(tripTotalBookings)
                                        .totalRevenue(tripTotalRevenue)
                                        .build();
                            })
                            .collect(Collectors.toList());

                    return TourRevenueResponse.builder()
                            .tourId(tour.getId())
                            .tourName(tour.getName())
                            .tourImageUrl(tour.getImageUrl())
                            .totalBookings(totalBookings)
                            .totalRevenue(totalRevenue)
                            .trips(tripRevenues)
                            .build();
                })
                .collect(Collectors.toList());
    }
}

