package com.quickcart.repository;

import com.quickcart.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByEmailAndOtpOrderByIdDesc(String email, String otp);

    void deleteByEmail(String email);
}
