package com.quickcart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(name = "discount_amount")
    @com.fasterxml.jackson.annotation.JsonProperty("discountAmount")
    private Double discountAmount = 0.0;

    private LocalDateTime expiryDate;

    private boolean active = true;

    private double minOrderAmount = 0.0;
}
