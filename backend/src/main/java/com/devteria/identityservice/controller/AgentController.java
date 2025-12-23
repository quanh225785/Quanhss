package com.devteria.identityservice.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.response.AgentPublicResponse;
import com.devteria.identityservice.dto.response.AgentStatsResponse;
import com.devteria.identityservice.dto.response.TourResponse;
import com.devteria.identityservice.dto.response.TourRevenueResponse;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.repository.ReviewRepository;
import com.devteria.identityservice.repository.TourRepository;
import com.devteria.identityservice.service.AgentService;
import com.devteria.identityservice.service.TourService;
import com.devteria.identityservice.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/agent")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AgentController {
    AgentService agentService;
    UserService userService;
    TourRepository tourRepository;
    ReviewRepository reviewRepository;
    TourService tourService;

    /**
     * Get agent dashboard statistics
     * GET /agent/stats
     */
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/stats")
    ApiResponse<AgentStatsResponse> getAgentStats() {
        log.info("Fetching agent dashboard statistics");
        return ApiResponse.<AgentStatsResponse>builder()
                .result(agentService.getAgentStats())
                .build();
    }

    /**
     * Get detailed revenue report by tour and trip
     * GET /agent/revenue
     */
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/revenue")
    ApiResponse<List<TourRevenueResponse>> getRevenueByTour() {
        log.info("Fetching revenue report by tour and trip");
        return ApiResponse.<List<TourRevenueResponse>>builder()
                .result(agentService.getRevenueByTour())
                .build();
    }

    /**
     * Get public profile of an agent (accessible by all authenticated users)
     * GET /agent/profile/{agentId}
     */
    @GetMapping("/profile/{agentId}")
    ApiResponse<AgentPublicResponse> getAgentPublicProfile(@PathVariable String agentId) {
        log.info("Getting public profile for agent: {}", agentId);
        
        // Get agent info
        User agent = userService.getAgentById(agentId);
        
        // Get approved tours by this agent
        List<Tour> tours = tourRepository.findApprovedToursByAgentId(agentId);
        
        // Get statistics
        Double avgRating = reviewRepository.findAverageRatingByAgentId(agentId);
        Integer totalReviews = reviewRepository.countByAgentId(agentId);
        
        // Convert tours to TourResponse
        List<TourResponse> tourResponses = tours.stream()
                .map(tourService::toTourResponse)
                .collect(Collectors.toList());
        
        AgentPublicResponse response = AgentPublicResponse.builder()
                .id(agent.getId())
                .username(agent.getUsername())
                .firstName(agent.getFirstName())
                .lastName(agent.getLastName())
                .avatar(agent.getAvatar())
                .totalTours(tours.size())
                .totalReviews(totalReviews != null ? totalReviews : 0)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null)
                .tours(tourResponses)
                .build();
        
        return ApiResponse.<AgentPublicResponse>builder()
                .result(response)
                .build();
    }
}
