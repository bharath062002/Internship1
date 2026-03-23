package com.example.hospital.scheduler;

import com.example.hospital.model.Appointment;
import com.example.hospital.repository.AppointmentRepository;
import com.example.hospital.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AppointmentReminderScheduler {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private EmailService emailService;

    @Scheduled(fixedRate = 60000) // runs every 1 minute
    public void sendReminders() {

        List<Appointment> appointments = appointmentRepository.findAll();

        for (Appointment appointment : appointments) {

            LocalDateTime now = LocalDateTime.now();

            // check if appointment is within next 1 hour
            if (appointment.getAppointmentTime().isAfter(now) &&
                    appointment.getAppointmentTime().isBefore(now.plusHours(1))) {

                String email = appointment.getPatient().getEmail();

                emailService.sendEmail(
                        email,
                        "Reminder: You have an appointment at " + appointment.getAppointmentTime()
                );
            }
        }
    }
}