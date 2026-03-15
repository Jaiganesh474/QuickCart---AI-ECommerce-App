package com.quickcart.controller;

import com.quickcart.entity.Coupon;
import com.quickcart.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @GetMapping
    public ResponseEntity<List<Coupon>> getAll() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping
    public ResponseEntity<Coupon> create(@RequestBody Coupon coupon) {
        System.out.println("CREATING COUPON: code=" + coupon.getCode() + ", amount=" + coupon.getDiscountAmount());
        try {
            return ResponseEntity.ok(couponService.createCoupon(coupon));
        } catch (Exception e) {
            System.err.println("FAILED TO CREATE COUPON: " + e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validate(@RequestParam String code, @RequestParam double amount) {
        try {
            Coupon coupon = couponService.validateCoupon(code, amount);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("discountAmount", coupon.getDiscountAmount());
            response.put("code", coupon.getCode());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
