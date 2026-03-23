package com.example.hospital.service;

import com.example.hospital.model.Doctor;
import com.example.hospital.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    // add doctor
    public Doctor addDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    // get all doctors
    public List<Doctor> getDoctors() {
        return doctorRepository.findAll();
    }

    // delete doctor
    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }
}