package com.smarthospital.controller;

import com.smarthospital.model.*;
import com.smarthospital.repository.UserRepository;
import com.smarthospital.service.AppointmentService;
import com.smarthospital.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPatients", userRepository.count());
        stats.put("totalDoctors", doctorService.getTotalDoctors());
        stats.put("totalAppointments", appointmentService.getTotalAppointments());
        stats.put("confirmedAppointments",
                appointmentService.getAppointmentsByStatus(Appointment.AppointmentStatus.CONFIRMED));
        stats.put("completedAppointments",
                appointmentService.getAppointmentsByStatus(Appointment.AppointmentStatus.COMPLETED));
        stats.put("cancelledAppointments",
                appointmentService.getAppointmentsByStatus(Appointment.AppointmentStatus.CANCELLED));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(userRepository.findAll(pageable));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id,
                                             @RequestBody Map<String, String> request) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(User.Role.valueOf(request.get("role")));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(Map.of("message", "Doctor deleted successfully"));
    }

    @GetMapping("/doctors")
    public ResponseEntity<Page<Doctor>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(doctorService.getAllAvailableDoctors(page, size));
    }
}
