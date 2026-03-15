package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // Target user (null for system-wide/admin notifications depending on logic)

    private String message;
    private String type; // ORDER, INFO, CANCEL_REQUEST
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private String relatedId; // e.g. Order ID
}
