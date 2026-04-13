package com.smarthospital.controller;

import com.smarthospital.model.Doctor;
import com.smarthospital.model.User;
import com.smarthospital.repository.UserRepository;
import com.smarthospital.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<Doctor>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(doctorService.searchDoctors(search, page, size));
        }
        return ResponseEntity.ok(doctorService.getAllAvailableDoctors(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return doctorService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> createOrUpdateDoctorProfile(@RequestBody Map<String, Object> request,
                                                           Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        Doctor doctor = doctorService.findByUser(user).orElse(new Doctor());
        doctor.setUser(user);
        doctor.setSpecialization((String) request.get("specialization"));
        doctor.setQualification((String) request.get("qualification"));
        doctor.setDepartment((String) request.get("department"));
        doctor.setBio((String) request.get("bio"));
        doctor.setConsultationFee((String) request.get("consultationFee"));
        if (request.get("experienceYears") != null)
            doctor.setExperienceYears(Integer.parseInt(request.get("experienceYears").toString()));
        if (request.get("maxPatientsPerSlot") != null)
            doctor.setMaxPatientsPerSlot(Integer.parseInt(request.get("maxPatientsPerSlot").toString()));
        if (request.get("morningStartTime") != null)
            doctor.setMorningStartTime(LocalTime.parse(request.get("morningStartTime").toString()));
        if (request.get("morningEndTime") != null)
            doctor.setMorningEndTime(LocalTime.parse(request.get("morningEndTime").toString()));
        if (request.get("workingDays") != null)
            doctor.setWorkingDays((List<String>) request.get("workingDays"));

        return ResponseEntity.ok(doctorService.save(doctor));
    }

    @PutMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<?> toggleAvailability(@PathVariable Long id,
                                                  @RequestBody Map<String, Boolean> request) {
        Doctor doctor = doctorService.findById(id).orElseThrow();
        doctor.setAvailable(request.get("available"));
        return ResponseEntity.ok(doctorService.save(doctor));
    }
}
