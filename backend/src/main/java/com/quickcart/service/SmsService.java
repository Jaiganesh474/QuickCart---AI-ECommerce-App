package com.quickcart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromNumber;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendSms(String mobileNumber, String message) {
        if (mobileNumber == null || mobileNumber.isEmpty()) {
            System.err.println("SMS Failed: Mobile number is empty");
            return;
        }

        if (accountSid == null || accountSid.isEmpty() || accountSid.contains("YOUR_TWILIO")) {
            System.err.println("SMS Failed: Twilio credentials not configured in application.properties");
            return;
        }

        // Format number: Twilio requires E.164 format (+91...)
        String formattedNumber = mobileNumber.trim();
        if (formattedNumber.length() == 10) {
            formattedNumber = "+91" + formattedNumber;
        } else if (!formattedNumber.startsWith("+")) {
            formattedNumber = "+" + formattedNumber;
        }

        String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            // Twilio uses Basic Auth (SID as username, Token as password)
            String auth = accountSid + ":" + authToken;
            String encodedAuth = java.util.Base64.getEncoder().encodeToString(auth.getBytes());
            headers.set("Authorization", "Basic " + encodedAuth);

            org.springframework.util.MultiValueMap<String, String> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("To", formattedNumber);
            body.add("From", fromNumber);
            body.add("Body", message);

            HttpEntity<org.springframework.util.MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
            
            System.out.println("DEBUG: Sending Twilio SMS to " + formattedNumber);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            System.out.println("DEBUG: Twilio Response: " + response.getBody());
            
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            System.err.println("CRITICAL: Twilio API Error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("Failed to send Twilio SMS to " + formattedNumber + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
