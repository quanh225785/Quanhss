package com.devteria.identityservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.ChatConversation;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
    
    @Query("SELECT c FROM ChatConversation c WHERE c.user.id = :userId ORDER BY c.lastMessageAt DESC")
    List<ChatConversation> findByUserId(@Param("userId") String userId);
    
    @Query("SELECT c FROM ChatConversation c WHERE c.agent.id = :agentId ORDER BY c.lastMessageAt DESC")
    List<ChatConversation> findByAgentId(@Param("agentId") String agentId);
    
    // Find conversation with no tour (general chat with agent)
    @Query("SELECT c FROM ChatConversation c WHERE c.user.id = :userId AND c.agent.id = :agentId AND c.tour IS NULL")
    Optional<ChatConversation> findByUserIdAndAgentIdWithNoTour(@Param("userId") String userId, @Param("agentId") String agentId);
    
    // Find all conversations between user and agent (for lookup)
    @Query("SELECT c FROM ChatConversation c WHERE c.user.id = :userId AND c.agent.id = :agentId ORDER BY c.lastMessageAt DESC")
    List<ChatConversation> findByUserIdAndAgentId(@Param("userId") String userId, @Param("agentId") String agentId);
    
    @Query("SELECT c FROM ChatConversation c WHERE c.user.id = :userId AND c.agent.id = :agentId AND c.tour.id = :tourId")
    Optional<ChatConversation> findByUserIdAndAgentIdAndTourId(
            @Param("userId") String userId, 
            @Param("agentId") String agentId,
            @Param("tourId") Long tourId);
}
