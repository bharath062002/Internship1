package com.smarthospital.scheduler;

import com.smarthospital.model.Appointment;
import com.smarthospital.model.Notification;
import com.smarthospital.repository.AppointmentRepository;
import com.smarthospital.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class AppointmentReminderScheduler {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NotificationService notificationService;

    // Runs every day at 8 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void sendAppointmentReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Appointment> appointments = appointmentRepository
                .findByReminderSentFalseAndAppointmentDateAndStatus(
                        tomorrow, Appointment.AppointmentStatus.CONFIRMED);

        for (Appointment appointment : appointments) {
            notificationService.sendNotification(
                    appointment.getPatient(),
                    "Appointment Reminder",
                    "Reminder: You have an appointment tomorrow with Dr. " +
                            appointment.getDoctor().getUser().getFullName() +
                            " at " + appointment.getAppointmentTime() +
                            ". Token: " + appointment.getTokenNumber(),
                    Notification.NotificationType.APPOINTMENT_REMINDER
            );
            appointment.setReminderSent(true);
            appointmentRepository.save(appointment);
            System.out.println("[SCHEDULER] Reminder sent for appointment: " + appointment.getTokenNumber());
        }
    }

    // Runs every hour to clean up no-shows
    @Scheduled(fixedRate = 3600000)
    public void markNoShows() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        List<Appointment> appointments = appointmentRepository
                .findByReminderSentFalseAndAppointmentDateAndStatus(
                        yesterday, Appointment.AppointmentStatus.CONFIRMED);
        for (Appointment appointment : appointments) {
            appointment.setStatus(Appointment.AppointmentStatus.NO_SHOW);
            appointmentRepository.save(appointment);
        }
    }
}
