package com.devteria.identityservice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.request.SendMessageRequest;
import com.devteria.identityservice.dto.request.StartConversationRequest;
import com.devteria.identityservice.dto.response.ChatConversationResponse;
import com.devteria.identityservice.dto.response.ChatMessageResponse;
import com.devteria.identityservice.service.ChatService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatController {

    ChatService chatService;

    /**
     * Lấy danh sách cuộc hội thoại của user hiện tại
     */
    @GetMapping("/conversations")
    public ApiResponse<List<ChatConversationResponse>> getConversations() {
        return ApiResponse.<List<ChatConversationResponse>>builder()
                .code(1000)
                .result(chatService.getMyConversations())
                .build();
    }

    /**
     * Lấy tin nhắn trong cuộc hội thoại
     */
    @GetMapping("/conversations/{id}/messages")
    public ApiResponse<List<ChatMessageResponse>> getMessages(@PathVariable Long id) {
        return ApiResponse.<List<ChatMessageResponse>>builder()
                .code(1000)
                .result(chatService.getMessages(id))
                .build();
    }

    /**
     * Bắt đầu cuộc hội thoại mới hoặc lấy cuộc hội thoại đã có
     */
    @PostMapping("/conversations")
    public ApiResponse<ChatConversationResponse> startConversation(@RequestBody StartConversationRequest request) {
        return ApiResponse.<ChatConversationResponse>builder()
                .code(1000)
                .result(chatService.startConversation(request))
                .build();
    }

    /**
     * Gửi tin nhắn
     */
    @PostMapping("/messages")
    public ApiResponse<ChatMessageResponse> sendMessage(@RequestBody SendMessageRequest request) {
        return ApiResponse.<ChatMessageResponse>builder()
                .code(1000)
                .result(chatService.sendMessage(request))
                .build();
    }

    /**
     * Đánh dấu tin nhắn đã đọc
     */
    @PostMapping("/conversations/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id) {
        chatService.markAsRead(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Messages marked as read")
                .build();
    }
}
