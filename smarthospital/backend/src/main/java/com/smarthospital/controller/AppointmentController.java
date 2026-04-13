package com.smarthospital.controller;

import com.smarthospital.model.*;
import com.smarthospital.repository.UserRepository;
import com.smarthospital.service.AppointmentService;
import com.smarthospital.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, Object> request,
                                              Authentication auth) {
        User patient = userRepository.findByUsername(auth.getName()).orElseThrow();
        Long doctorId = Long.parseLong(request.get("doctorId").toString());
        LocalDate date = LocalDate.parse(request.get("date").toString());
        LocalTime time = LocalTime.parse(request.get("time").toString());
        String reason = (String) request.get("reason");

        try {
            Appointment appointment = appointmentService.bookAppointment(patient, doctorId, date, time, reason);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id,
                                                @RequestBody Map<String, String> request,
                                                Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        String reason = request.getOrDefault("reason", "Cancelled by patient");
        try {
            Appointment appointment = appointmentService.cancelAppointment(id, user, reason);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Page<Appointment>> getMyAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        User patient = userRepository.findByUsername(auth.getName()).orElseThrow();
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patient, page, size));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<Appointment>> getDoctorAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        Doctor doctor = doctorService.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctor, page, size));
    }

    @GetMapping("/queue/{doctorId}")
    public ResponseEntity<List<Appointment>> getQueue(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getQueueForDoctor(doctorId, date));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                           @RequestBody Map<String, String> request) {
        Appointment appointment = appointmentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(Appointment.AppointmentStatus.valueOf(request.get("status")));
        if (request.containsKey("notes")) {
            appointment.setNotes(request.get("notes"));
        }
        return ResponseEntity.ok(appointmentService.save(appointment));
    }
}
