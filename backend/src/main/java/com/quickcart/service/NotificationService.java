package com.quickcart.service;

import com.quickcart.entity.Notification;
import com.quickcart.entity.User;
import com.quickcart.repository.NotificationRepository;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public void createNotification(String userEmail, String message, String type, String relatedId) {
        Notification notification = new Notification();
        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            notification.setUser(user);
        }
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedId(relatedId);
        notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && user.getRole().name().equals("ADMIN")) {
            return notificationRepository.findByUserIsNullOrderByCreatedAtDesc();
        }
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
