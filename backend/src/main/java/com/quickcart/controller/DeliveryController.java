package com.quickcart.controller;

import com.quickcart.entity.Order;
import com.quickcart.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@PreAuthorize("hasRole('DELIVERY_AGENT')")
public class DeliveryController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/available")
    public ResponseEntity<List<Order>> getAvailableOrders() {
        return ResponseEntity.ok(orderService.getAvailableForDelivery());
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getAgentOrders(authentication.getName()));
    }

    @PostMapping("/pick/{orderId}")
    public ResponseEntity<?> pickOrder(@PathVariable Long orderId, Authentication authentication) {
        try {
            return ResponseEntity.ok(orderService.assignDeliveryAgent(orderId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/deliver/{orderId}")
    public ResponseEntity<?> deliverOrder(@PathVariable Long orderId, @RequestBody Map<String, String> body) {
        try {
            String otp = body.get("otp");
            return ResponseEntity.ok(orderService.confirmDeliveryWithOtp(orderId, otp));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
