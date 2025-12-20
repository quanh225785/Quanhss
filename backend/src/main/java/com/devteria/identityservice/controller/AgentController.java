package com.devteria.identityservice.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.response.AgentStatsResponse;
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
}

