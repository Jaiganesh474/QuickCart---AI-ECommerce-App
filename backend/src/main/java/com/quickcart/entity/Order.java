package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String orderId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "order")
    private List<OrderItem> items = new ArrayList<>();

    private double totalAmount;
    @Column(name = "discount_amount")
    @com.fasterxml.jackson.annotation.JsonProperty("discountAmount")
    private Double discountAmount = 0.0;
    private double marketplaceFee = 0.0;
    private double finalAmount;

    @Column(length = 50)
    private String paymentMethod; // COD, RAZORPAY

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private OrderStatus status = OrderStatus.PENDING;

    private LocalDateTime orderDate = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    private LocalDateTime expectedDeliveryDate;

    @PrePersist
    protected void onCreate() {
        orderDate = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @ManyToOne
    private Address deliveryAddress;

    @Column(length = 100)
    private String trackingNumber;

    @Column(length = 50)
    private String paymentStatus = "COMPLETED";

    @Column(length = 6)
    private String deliveryOtp;

    @ManyToOne
    @JoinColumn(name = "delivery_agent_id")
    private User deliveryAgent;
}
