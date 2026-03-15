package com.quickcart.controller;

import com.quickcart.entity.User;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates, Authentication auth) {
        String email = auth.getName();
        System.out.println("Attempting profile update for user: " + email);
        
        User userResult = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        final User user = userResult;
                
        if (updates.containsKey("name")) {
            user.setName(updates.get("name"));
        }
        
        if (updates.containsKey("mobileNumber")) {
            user.setMobileNumber(updates.get("mobileNumber"));
        }
        
        userRepository.save(user);
        System.out.println("Profile updated successfully for user: " + email);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> req, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        String currentPassword = req.get("currentPassword");
        String newPassword = req.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Incorrect current password"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @DeleteMapping("/deactivate")
    public ResponseEntity<?> deactivateAccount(Authentication auth) {
        String email = auth.getName();
        System.out.println("Processing PERMANENT DELETION for: " + email);
        
        User userResult = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        final User user = userResult;
                
        // Permanent deletion including all cascaded children (Orders, Addresses)
        userRepository.delete(user);
        
        System.out.println("User " + email + " and all associated data have been deleted.");
        return ResponseEntity.ok(Map.of("message", "Account and all data deleted successfully"));
    }
}
