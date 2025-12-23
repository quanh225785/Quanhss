package com.devteria.identityservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.dto.request.SendMessageRequest;
import com.devteria.identityservice.dto.request.StartConversationRequest;
import com.devteria.identityservice.dto.response.ChatConversationResponse;
import com.devteria.identityservice.dto.response.ChatMessageResponse;
import com.devteria.identityservice.entity.ChatConversation;
import com.devteria.identityservice.entity.ChatMessage;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.repository.ChatConversationRepository;
import com.devteria.identityservice.repository.ChatMessageRepository;
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
public class ChatService {

    ChatConversationRepository conversationRepository;
    ChatMessageRepository messageRepository;
    UserRepository userRepository;
    TourRepository tourRepository;
    SimpMessagingTemplate messagingTemplate;

    private User getCurrentUser() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private String getFullName(User user) {
        if (user.getFirstName() != null && user.getLastName() != null) {
            return user.getFirstName() + " " + user.getLastName();
        }
        return user.getFirstName() != null ? user.getFirstName()
                : user.getLastName() != null ? user.getLastName() : "User";
    }

    private String getInitial(User user) {
        if (user.getFirstName() != null && !user.getFirstName().isEmpty()) {
            return user.getFirstName().substring(0, 1).toUpperCase();
        }
        return "U";
    }

    /**
     * Lấy danh sách cuộc hội thoại của user hiện tại
     */
    public List<ChatConversationResponse> getMyConversations() {
        User currentUser = getCurrentUser();
        boolean isAgent = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("AGENT"));

        List<ChatConversation> conversations;
        if (isAgent) {
            conversations = conversationRepository.findByAgentId(currentUser.getId());
        } else {
            conversations = conversationRepository.findByUserId(currentUser.getId());
        }

        return conversations.stream()
                .map(conv -> mapToConversationResponse(conv, currentUser, isAgent))
                .collect(Collectors.toList());
    }

    private ChatConversationResponse mapToConversationResponse(ChatConversation conv, User currentUser,
            boolean isAgent) {
        User partner = isAgent ? conv.getUser() : conv.getAgent();
        ChatMessage lastMessage = messageRepository.findLastMessage(conv.getId());
        Long unreadCount = messageRepository.countUnreadMessages(conv.getId(), currentUser.getId());

        return ChatConversationResponse.builder()
                .id(conv.getId())
                .partnerId(partner.getId())
                .partnerName(getFullName(partner))
                .partnerInitial(getInitial(partner))
                .tourId(conv.getTour() != null ? conv.getTour().getId() : null)
                .tourName(conv.getTour() != null ? conv.getTour().getName() : null)
                .lastMessage(lastMessage != null
                        ? (lastMessage.getContent() != null ? lastMessage.getContent() : "[Hình ảnh]")
                        : null)
                .lastMessageAt(conv.getLastMessageAt())
                .unreadCount(unreadCount)
                .createdAt(conv.getCreatedAt())
                .build();
    }

    /**
     * Lấy tin nhắn trong cuộc hội thoại
     */
    @Transactional
    public List<ChatMessageResponse> getMessages(Long conversationId) {
        User currentUser = getCurrentUser();
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Kiểm tra quyền truy cập
        if (!conversation.getUser().getId().equals(currentUser.getId()) &&
                !conversation.getAgent().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Đánh dấu tin nhắn đã đọc
        messageRepository.markAsRead(conversationId, currentUser.getId());

        List<ChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        return messages.stream()
                .map(msg -> mapToMessageResponse(msg, currentUser))
                .collect(Collectors.toList());
    }

    private ChatMessageResponse mapToMessageResponse(ChatMessage msg, User currentUser) {
        User sender = msg.getSender();
        return ChatMessageResponse.builder()
                .id(msg.getId())
                .conversationId(msg.getConversation().getId())
                .senderId(sender.getId())
                .senderName(getFullName(sender))
                .senderInitial(getInitial(sender))
                .isCurrentUser(sender.getId().equals(currentUser.getId()))
                .content(msg.getContent())
                .imageUrl(msg.getImageUrl())
                .isRead(msg.getIsRead())
                .createdAt(msg.getCreatedAt())
                .build();
    }

    /**
     * Bắt đầu cuộc hội thoại mới hoặc lấy cuộc hội thoại đã có
     */
    @Transactional
    public ChatConversationResponse startConversation(StartConversationRequest request) {
        User currentUser = getCurrentUser();

        // Lấy agent - có thể từ agentId trực tiếp hoặc từ tour
        User agent;
        Tour tour = null;

        if (request.getTourId() != null) {
            tour = tourRepository.findById(request.getTourId())
                    .orElseThrow(() -> new AppException(ErrorCode.TOUR_NOT_FOUND));
        }

        if (request.getAgentId() != null) {
            agent = userRepository.findById(request.getAgentId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        } else if (tour != null && tour.getCreatedBy() != null) {
            // Nếu không có agentId nhưng có tourId, lấy agent từ tour
            agent = tour.getCreatedBy();
        } else {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        // Kiểm tra agent có role AGENT không
        boolean isAgent = agent.getRoles().stream()
                .anyMatch(role -> role.getName().equals("AGENT"));
        if (!isAgent) {
            throw new AppException(ErrorCode.USER_NOT_AGENT);
        }

        // Tìm cuộc hội thoại đã có
        ChatConversation conversation;
        if (tour != null) {
            conversation = conversationRepository.findByUserIdAndAgentIdAndTourId(
                    currentUser.getId(), agent.getId(), tour.getId())
                    .orElse(null);
        } else {
            // Tìm conversation tổng quát (không có tour)
            conversation = conversationRepository.findByUserIdAndAgentIdWithNoTour(currentUser.getId(), agent.getId())
                    .orElse(null);
            
            // Nếu không có conversation tổng quát, tạo mới (không lấy conversation có tour khác)
        }

        // Nếu chưa có, tạo mới
        if (conversation == null) {
            conversation = ChatConversation.builder()
                    .user(currentUser)
                    .agent(agent)
                    .tour(tour)
                    .build();
            conversation = conversationRepository.save(conversation);
        }

        // Gửi tin nhắn đầu tiên nếu có
        if (request.getInitialMessage() != null && !request.getInitialMessage().trim().isEmpty()) {
            ChatMessage message = ChatMessage.builder()
                    .conversation(conversation)
                    .sender(currentUser)
                    .content(request.getInitialMessage())
                    .build();
            messageRepository.save(message);

            conversation.setLastMessageAt(LocalDateTime.now());
            conversationRepository.save(conversation);
        }

        return mapToConversationResponse(conversation, currentUser, false);
    }

    /**
     * Gửi tin nhắn
     */
    @Transactional
    public ChatMessageResponse sendMessage(SendMessageRequest request) {
        User currentUser = getCurrentUser();
        ChatConversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Kiểm tra quyền truy cập
        if (!conversation.getUser().getId().equals(currentUser.getId()) &&
                !conversation.getAgent().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Kiểm tra có nội dung không
        if ((request.getContent() == null || request.getContent().trim().isEmpty()) &&
                (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty())) {
            throw new AppException(ErrorCode.MESSAGE_EMPTY);
        }

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .sender(currentUser)
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .build();
        message = messageRepository.save(message);

        // Cập nhật thời gian tin nhắn cuối
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        ChatMessageResponse response = mapToMessageResponse(message, currentUser);

        // Broadcast qua WebSocket - broadcast raw message without isCurrentUser flag
        // Let frontend determine isCurrentUser by comparing senderId
        broadcastMessageToConversation(message);

        return response;
    }

    /**
     * Broadcast tin nhắn qua WebSocket
     * Gửi tin nhắn RAW (không có isCurrentUser) để frontend tự xác định
     */
    private void broadcastMessageToConversation(ChatMessage message) {
        if (messagingTemplate != null) {
            User sender = message.getSender();
            ChatMessageResponse response = ChatMessageResponse.builder()
                    .id(message.getId())
                    .conversationId(message.getConversation().getId())
                    .senderId(sender.getId())
                    .senderName(getFullName(sender))
                    .senderInitial(getInitial(sender))
                    .isCurrentUser(null) // Không set, để frontend tự xác định
                    .content(message.getContent())
                    .imageUrl(message.getImageUrl())
                    .isRead(message.getIsRead())
                    .createdAt(message.getCreatedAt())
                    .build();

            String destination = "/topic/conversation/" + message.getConversation().getId();
            messagingTemplate.convertAndSend(destination, response);
            log.info("Message broadcast to: {}", destination);
        }
    }

    /**
     * Đánh dấu tin nhắn đã đọc
     */
    @Transactional
    public void markAsRead(Long conversationId) {
        User currentUser = getCurrentUser();
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Kiểm tra quyền truy cập
        if (!conversation.getUser().getId().equals(currentUser.getId()) &&
                !conversation.getAgent().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        messageRepository.markAsRead(conversationId, currentUser.getId());
    }
}
