package com.smarthospital.service;

import com.smarthospital.model.Doctor;
import com.smarthospital.model.User;
import com.smarthospital.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public Page<Doctor> getAllAvailableDoctors(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return doctorRepository.findByAvailable(true, pageable);
    }

    public Page<Doctor> searchDoctors(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return doctorRepository.searchDoctors(keyword, pageable);
    }

    public Optional<Doctor> findById(Long id) {
        return doctorRepository.findById(id);
    }

    public Optional<Doctor> findByUser(User user) {
        return doctorRepository.findByUser(user);
    }

    public Doctor save(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public long getTotalDoctors() {
        return doctorRepository.count();
    }

    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }
}
