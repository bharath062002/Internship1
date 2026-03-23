package com.example.hospital.service;

import com.example.hospital.model.Patient;
import com.example.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public Optional<Patient> login(String email) {
        return userRepository.findByEmail(email);
    }
}