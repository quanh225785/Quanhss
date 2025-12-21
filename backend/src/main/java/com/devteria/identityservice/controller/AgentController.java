package com.devteria.identityservice.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.response.AgentStatsResponse;
import com.devteria.identityservice.dto.response.TourRevenueResponse;
import com.devteria.identityservice.service.AgentService;

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
}

