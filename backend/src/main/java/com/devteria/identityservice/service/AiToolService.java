package com.devteria.identityservice.service;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import com.devteria.identityservice.dto.response.LocationResponse;
import com.devteria.identityservice.dto.response.ReviewResponse;
import com.devteria.identityservice.dto.response.TourResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service providing tools for the AI Chatbot via Function Calling.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class AiToolService {
    private final TourService tourService;
    private final LocationSuggestionService locationService;
    private final ReviewService reviewService;

    public record TourSearchRequest(
            String keyword,
            Double minPrice,
            Double maxPrice,
            Integer numberOfDays,
            String vehicle,
            String cityName) {
    }

    public record TourDetailRequest(Long id) {
    }

    public record CityRequest(String cityName) {
    }

    // OpenAI requires at least one property in the schema
    public record LocationRequest(String filter) {
        public LocationRequest() {
            this(null);
        }
    }

    public record AllToursRequest(String dummy) {
        public AllToursRequest() {
            this(null);
        }
    }

    public record TrendingToursRequest(String dummy) {
        public TrendingToursRequest() {
            this(null);
        }
    }

    @Bean
    @Description("Lấy tất cả các tour du lịch đang hoạt động để gợi ý cho người dùng.")
    public java.util.function.Function<AllToursRequest, List<TourResponse>> getAllActiveToursTools() {
        return request -> {
            log.info("AI calling getAllActiveToursTools");
            return tourService.getAllActiveTours();
        };
    }

    @Bean
    @Description("Lấy danh sách các tour du lịch phổ biến và được đặt nhiều nhất (trending tours). Tour có nhiều booking nhất sẽ được ưu tiên hiển thị.")
    public java.util.function.Function<TrendingToursRequest, List<TourResponse>> getTrendingToursTool() {
        return request -> {
            log.info("AI calling getTrendingToursTool");
            return tourService.getTrendingTours();
        };
    }

    @Bean
    @Description("Tìm kiếm các tour du lịch đang hoạt động dựa trên các tiêu chí như từ khóa, giá, số ngày, phương tiện và thành phố.")
    public java.util.function.Function<TourSearchRequest, List<TourResponse>> searchToursTool() {
        return request -> {
            log.info("AI calling searchToursTool with: {}", request);
            return tourService.searchTours(
                    request.keyword(),
                    request.minPrice(),
                    request.maxPrice(),
                    request.numberOfDays(),
                    request.vehicle(),
                    request.cityName());
        };
    }

    @Bean
    @Description("Lấy thông tin chi tiết của một tour du lịch cụ thể bằng ID.")
    public java.util.function.Function<TourDetailRequest, TourResponse> getTourDetailsTool() {
        return request -> {
            log.info("AI calling getTourDetailsTool with ID: {}", request.id());
            return tourService.getTourById(request.id());
        };
    }

    @Bean
    @Description("Lấy danh sách tất cả các địa điểm du lịch khả dụng.")
    public java.util.function.Function<LocationRequest, List<LocationResponse>> listLocationsTool() {
        return request -> {
            log.info("AI calling listLocationsTool");
            return locationService.getAllLocations();
        };
    }

    @Bean
    @Description("Lấy danh sách các địa điểm du lịch tại một thành phố cụ thể.")
    public java.util.function.Function<CityRequest, List<LocationResponse>> getLocationsByCityTool() {
        return request -> {
            log.info("AI calling getLocationsByCityTool for city: {}", request.cityName());
            return locationService.getLocationsByCity(request.cityName());
        };
    }

    @Bean
    @Description("Lấy các đánh giá của người dùng về một tour du lịch cụ thể bằng ID.")
    public java.util.function.Function<TourDetailRequest, List<ReviewResponse>> getTourReviewsTool() {
        return request -> {
            log.info("AI calling getTourReviewsTool for tour ID: {}", request.id());
            return reviewService.getReviewsByTour(request.id());
        };
    }
}
