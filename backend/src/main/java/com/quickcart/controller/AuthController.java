package com.quickcart.controller;

import com.quickcart.dto.*;
import com.quickcart.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            authService.initiateRegistration(request.getName(), request.getEmail(), request.getPassword(), request.getMobileNumber());
            return ResponseEntity.ok(new ApiResponse(true, "OTP sent to email and mobile"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/verify-register")
    public ResponseEntity<?> verifyRegister(@RequestBody VerifyOtpRequest request) {
        try {
            String token = authService.verifyRegistrationOtp(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(new AuthResponse(true, "Registration successful", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(new AuthResponse(true, "Login successful", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok(new ApiResponse(true, "OTP sent to email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            authService.verifyAndResetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
            return ResponseEntity.ok(new ApiResponse(true, "Password reset successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/become-seller")
    public ResponseEntity<?> becomeSeller(@RequestBody ForgotPasswordRequest request) {
        try {
            authService.initiateSellerVerification(request.getEmail());
            return ResponseEntity.ok(new ApiResponse(true, "Seller OTP sent to email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/verify-seller")
    public ResponseEntity<?> verifySeller(@RequestBody VerifyOtpRequest request) {
        try {
            String token = authService.verifySeller(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(new AuthResponse(true, "Upgraded to Seller", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/become-agent")
    public ResponseEntity<?> becomeAgent(@RequestBody ForgotPasswordRequest request) {
        try {
            authService.initiateAgentVerification(request.getEmail());
            return ResponseEntity.ok(new ApiResponse(true, "Agent OTP sent to email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/verify-agent")
    public ResponseEntity<?> verifyAgent(@RequestBody VerifyOtpRequest request) {
        try {
            String token = authService.verifyAgent(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(new AuthResponse(true, "Upgraded to Delivery Agent", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/switch-to-customer")
    public ResponseEntity<?> switchToCustomer(@RequestBody ForgotPasswordRequest request) {
        try {
            String token = authService.switchToCustomer(request.getEmail());
            return ResponseEntity.ok(new AuthResponse(true, "Role switched to Customer successfully", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
