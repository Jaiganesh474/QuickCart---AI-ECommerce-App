package com.quickcart.service;

import com.quickcart.entity.OtpVerification;
import com.quickcart.entity.Role;
import com.quickcart.entity.User;
import com.quickcart.repository.OtpVerificationRepository;
import com.quickcart.repository.UserRepository;
import com.quickcart.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpVerificationRepository otpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SmsService smsService;

    // Generate random 4-digit OTP
    private String generateOtp() {
        return String.format("%04d", new Random().nextInt(10000));
    }

    public String initiateRegistration(String name, String email, String password, String mobileNumber, String roleStr) throws Exception {
        if (userRepository.existsByEmail(email)) {
            throw new Exception("Email is already registered.");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setMobileNumber(mobileNumber);
        
        Role role = Role.USER;
        if (roleStr != null) {
            try {
                role = Role.valueOf(roleStr.toUpperCase());
            } catch (Exception e) {}
        }
        user.setRole(role);
        user.setVerified(true);
        userRepository.save(user);

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getName(), user.getMobileNumber());
    }

    public String verifyRegistrationOtp(String email, String otp) throws Exception {
        verifyOtp(email, otp);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));
        user.setVerified(true);
        userRepository.save(user);

        // Send Welcome email
        emailService.sendEmail(email, "Welcome to QuickCart!",
                "Hello " + user.getName()
                        + ",\n\nYour account has been successfully created. Welcome to the future of smart E-Commerce!");

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getName(), user.getMobileNumber());
    }

    public String login(String email, String password) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("Invalid credentials"));

        if (!user.isVerified()) {
            throw new Exception("Email not verified. Please verify your email first.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid credentials");
        }

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getName(), user.getMobileNumber());
    }

    public void forgotPassword(String email) throws Exception {
        if (!userRepository.existsByEmail(email)) {
            throw new Exception("Email not found");
        }
        User user = userRepository.findByEmail(email).get();
        sendOtpNotifications(email, user.getMobileNumber(), "QuickCart: Password Reset OTP");
    }

    public void verifyAndResetPassword(String email, String otp, String newPassword) throws Exception {
        verifyOtp(email, otp);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        emailService.sendEmail(email, "Password Reset Successful",
                "Your QuickCart password has been reset successfully. If this wasn't you, please contact support immediately.");
    }

    public void initiateSellerVerification(String email) throws Exception {
        if (!userRepository.existsByEmail(email)) {
            throw new Exception("User not found. Please register an account first.");
        }
        User user = userRepository.findByEmail(email).get();
        sendOtpNotifications(email, user.getMobileNumber(), "QuickCart: Seller Verification OTP");
    }

    public String verifySeller(String email, String otp) throws Exception {
        verifyOtp(email, otp);
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setRole(Role.ADMIN);
        userRepository.save(user);

        emailService.sendEmail(email, "Welcome as a QuickCart Seller!",
                "Congratulations! Your account has been upgraded to a QuickCart Seller account. You can now access the Admin Dashboard to manage your store.");

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getName(), user.getMobileNumber());
    }

    public void initiateAgentVerification(String email) throws Exception {
        if (!userRepository.existsByEmail(email)) {
            throw new Exception("User not found. Please register an account first.");
        }
        User user = userRepository.findByEmail(email).get();
        sendOtpNotifications(email, user.getMobileNumber(), "QuickCart: Delivery Agent Verification OTP");
    }

    public String verifyAgent(String email, String otp) throws Exception {
        verifyOtp(email, otp);
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setRole(Role.DELIVERY_AGENT);
        userRepository.save(user);

        emailService.sendEmail(email, "Welcome as a QuickCart Delivery Agent!",
                "Congratulations! Your account has been upgraded to a QuickCart Delivery Agent account. You can now access the Delivery Hub to manage your assigned orders.");

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getName(), user.getMobileNumber());
    }

    public String switchToCustomer(String email) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));
        
        if (user.getRole() == Role.ADMIN) {
            throw new Exception("Admins are not allowed to switch back to customer accounts.");
        }
        
        user.setRole(Role.USER);
        userRepository.save(user);

        emailService.sendEmail(email, "Role Updated: You are now a Customer",
                "Your account role has been updated. You are now a Standard Customer on QuickCart. You can now shop and place orders normally!");

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getName(), user.getMobileNumber());
    }

    private void sendOtpNotifications(String email, String mobileNumber, String subject) {
        String otp = generateOtp();

        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setEmail(email);
        otpVerification.setOtp(otp);
        otpVerification.setExpiryTime(LocalDateTime.now().plusMinutes(10));
        otpRepository.save(otpVerification);

        // Send Email
        emailService.sendEmail(email, subject,
                "Your QuickCart OTP is: " + otp
                        + "\n\nIt will expire in 10 minutes. Please do not share this code with anyone.");
        
        // Send SMS
        if (mobileNumber != null && !mobileNumber.isEmpty()) {
            smsService.sendSms(mobileNumber, "Hello! Your QuickCart verification code is " + otp + ". Valid for 10 mins. Happy Shopping!");
        }
    }

    private void verifyOtp(String email, String otp) throws Exception {
        OtpVerification otpVerification = otpRepository.findTopByEmailAndOtpOrderByIdDesc(email, otp)
                .orElseThrow(() -> new Exception("Invalid OTP"));

        if (otpVerification.isExpired()) {
            throw new Exception("OTP has expired");
        }

        // Clean up OTP after use
        if (otpVerification.getId() != null) {
            otpRepository.deleteById(otpVerification.getId());
        }
    }
    public User getProfile(String email) throws Exception {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));
    }
}
