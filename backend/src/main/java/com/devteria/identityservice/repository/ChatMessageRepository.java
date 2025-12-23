package com.devteria.identityservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    Long countUnreadMessages(@Param("conversationId") Long conversationId, @Param("userId") String userId);
    
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    void markAsRead(@Param("conversationId") Long conversationId, @Param("userId") String userId);
    
    @Query("SELECT m FROM ChatMessage m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt DESC LIMIT 1")
    ChatMessage findLastMessage(@Param("conversationId") Long conversationId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE (m.conversation.user.id = :userId OR m.conversation.agent.id = :userId) AND m.sender.id != :userId AND m.isRead = false")
    Long countAllUnreadMessages(@Param("userId") String userId);
}
