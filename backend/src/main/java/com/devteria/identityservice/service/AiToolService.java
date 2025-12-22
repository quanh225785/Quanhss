package com.devteria.identityservice.service;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import com.devteria.identityservice.dto.response.LocationResponse;
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

    @Bean
    @Description("Lấy tất cả các tour du lịch đang hoạt động để gợi ý cho người dùng.")
    public java.util.function.Function<AllToursRequest, List<TourResponse>> getAllActiveToursTools() {
        return request -> {
            log.info("AI calling getAllActiveToursTools");
            return tourService.getAllActiveTours();
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
    @Description("Lấy danh sách tất cả các địa điểm du lịch khả dụng để gợi ý cho người dùng.")
    public java.util.function.Function<LocationRequest, List<LocationResponse>> listLocationsTool() {
        return request -> {
            log.info("AI calling listLocationsTool");
            return locationService.getAllLocations();
        };
    }
}
