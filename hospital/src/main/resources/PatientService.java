package com.example.hospital.service;

import com.example.hospital.model.Patient;
import com.example.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    // register patient
    public Patient registerPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    // view all patients
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // view patient profile
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id).orElse(null);
    }
}