package com.devteria.identityservice.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/ai-chat")
@Slf4j
public class AiChatController {
    private final ChatClient chatClient;

    public AiChatController(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultSystem(
                        """
                                Bạn là một trợ lý du lịch thông minh của hệ thống Quanhss.
                                Bạn giúp người dùng tìm kiếm tour du lịch, gợi ý địa điểm và trả lời thắc mắc về các chuyến đi.
                                Sử dụng các công cụ được cung cấp để lấy dữ liệu thực tế từ hệ thống.
                                Trả lời bằng tiếng Việt một cách thân thiện và chuyên nghiệp.
                                Nếu không tìm thấy tour nào, hãy gợi ý người dùng thử thay đổi tiêu chí tìm kiếm.

                                Khi tìm kiếm tour, hãy hỏi người dùng về các tiêu chí nếu họ chưa cung cấp đủ (thành phố, ngân sách, số ngày).
                                Khi gợi ý địa điểm, hãy sử dụng danh sách địa điểm có sẵn trong hệ thống.
                                """)
                .defaultAdvisors(new MessageChatMemoryAdvisor(new InMemoryChatMemory()))
                .build();
    }

    public record ChatRequest(String message) {
    }

    public record ChatResponse(String reply) {
    }

    @PostMapping
    public ApiResponse<ChatResponse> chat(@RequestBody ChatRequest request) {
        log.info("User AI chat: {}", request.message());

        try {
            String reply = chatClient.prompt()
                    .user(request.message())
                    .functions("getAllActiveToursTools", "searchToursTool", "getTourDetailsTool", "listLocationsTool")
                    .call()
                    .content();

            return ApiResponse.<ChatResponse>builder()
                    .result(new ChatResponse(reply))
                    .build();
        } catch (Exception e) {
            log.error("AI Chat error: ", e);
            return ApiResponse.<ChatResponse>builder()
                    .code(9999)
                    .message("AI service temporarily unavailable. Please make sure AI API Key is configured.")
                    .result(new ChatResponse("Xin lỗi, tôi đang gặp chút trục trặc kỹ thuật. Vui lòng thử lại sau."))
                    .build();
        }
    }
}
