package com.quickcart.repository;

import com.quickcart.entity.Notification;
import com.quickcart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserIsNullOrderByCreatedAtDesc(); // For Admin/System notifications
}
