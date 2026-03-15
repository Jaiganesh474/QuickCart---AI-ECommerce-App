package com.quickcart.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.PrintWriter;
import java.io.StringWriter;

@RestController
public class MailTestController {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @GetMapping("/api/test-mail")
    public String testMail() {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo("test@example.com");
            message.setSubject("Test Brevo Spring Boot");
            message.setText("This is a test message.");
            mailSender.send(message);
            return "SUCCESS";
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            return "ERROR:\n" + e.getMessage() + "\n\n" + sw.toString();
        }
    }
}
