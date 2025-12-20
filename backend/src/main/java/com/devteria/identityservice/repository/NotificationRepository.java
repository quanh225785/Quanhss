package com.devteria.identityservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.Notification;
import com.devteria.identityservice.entity.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Lấy notifications của user sắp xếp theo thời gian mới nhất
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    
    // Lấy top 20 notifications mới nhất
    List<Notification> findTop20ByRecipientOrderByCreatedAtDesc(User recipient);
    
    // Đếm số notification chưa đọc
    Long countByRecipientAndIsReadFalse(User recipient);
    
    // Đánh dấu tất cả notification của user là đã đọc
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :recipientId AND n.isRead = false")
    void markAllAsReadByRecipientId(@Param("recipientId") String recipientId);
}
