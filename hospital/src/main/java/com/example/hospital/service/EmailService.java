package com.example.hospital.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendEmail(String to, String message) {

        System.out.println("Sending email to: " + to);
        System.out.println("Message: " + message);
    }
}