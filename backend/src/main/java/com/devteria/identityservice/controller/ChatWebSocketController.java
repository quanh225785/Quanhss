package com.devteria.identityservice.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.devteria.identityservice.dto.request.SendMessageRequest;
import com.devteria.identityservice.dto.response.ChatMessageResponse;
import com.devteria.identityservice.service.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    /**
     * Handle incoming chat messages via WebSocket
     * Client sends to: /app/chat.send
     * Message is broadcast to: /topic/conversation/{conversationId}
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request) {
        try {
            log.info("Received WebSocket message for conversation: {}", request.getConversationId());
            
            // Save message and get response
            ChatMessageResponse response = chatService.sendMessage(request);
            
            // Broadcast to conversation topic
            String destination = "/topic/conversation/" + request.getConversationId();
            messagingTemplate.convertAndSend(destination, response);
            
            log.info("Message broadcast to: {}", destination);
        } catch (Exception e) {
            log.error("Error processing WebSocket message", e);
        }
    }

    /**
     * Broadcast a message to a specific conversation
     * Called from ChatService when a message is sent via REST API
     */
    public void broadcastMessage(ChatMessageResponse message) {
        String destination = "/topic/conversation/" + message.getConversationId();
        messagingTemplate.convertAndSend(destination, message);
        log.info("Message broadcast via REST to: {}", destination);
    }

    /**
     * Send notification to a specific user
     * Used for new conversation notifications
     */
    public void notifyUser(String recipientId, Object notification) {
        messagingTemplate.convertAndSendToUser(
                recipientId,
                "/queue/notifications",
                notification
        );
    }
}
