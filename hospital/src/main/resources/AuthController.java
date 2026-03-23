package com.example.hospital.controller;

import com.example.hospital.model.Patient;
import com.example.hospital.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private PatientService patientService;

    // register patient
    @PostMapping("/register")
    public Patient register(@RequestBody Patient patient) {
        return patientService.registerPatient(patient);
    }

}