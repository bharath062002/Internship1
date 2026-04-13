package com.smarthospital.service;

import com.smarthospital.model.*;
import com.smarthospital.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Appointment bookAppointment(User patient, Long doctorId, LocalDate date,
                                        LocalTime time, String reason) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        int count = appointmentRepository.countByDoctorAndDate(doctor, date);
        if (count >= doctor.getMaxPatientsPerSlot()) {
            throw new RuntimeException("Doctor's schedule is fully booked for this date");
        }

        Integer maxQueue = appointmentRepository.findMaxQueueNumber(doctor, date);
        int queueNumber = (maxQueue == null ? 0 : maxQueue) + 1;

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(date);
        appointment.setAppointmentTime(time);
        appointment.setReason(reason);
        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        appointment.setQueueNumber(queueNumber);
        appointment.setCurrentQueuePosition(queueNumber);
        appointment.setTokenNumber("TKN-" + date.format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + String.format("%03d", queueNumber));

        Appointment saved = appointmentRepository.save(appointment);

        notificationService.sendNotification(patient,
                "Appointment Confirmed",
                "Your appointment with Dr. " + doctor.getUser().getFullName() +
                " is confirmed for " + date + " at " + time +
                ". Queue #" + queueNumber + " | Token: " + saved.getTokenNumber(),
                Notification.NotificationType.APPOINTMENT_BOOKED);

        return saved;
    }

    @Transactional
    public Appointment cancelAppointment(Long appointmentId, User user, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getPatient().getId().equals(user.getId()) &&
                user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Unauthorized to cancel this appointment");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        Appointment saved = appointmentRepository.save(appointment);

        updateQueuePositions(appointment.getDoctor(), appointment.getAppointmentDate(),
                appointment.getQueueNumber());

        notificationService.sendNotification(appointment.getPatient(),
                "Appointment Cancelled",
                "Your appointment #" + appointment.getTokenNumber() + " has been cancelled.",
                Notification.NotificationType.APPOINTMENT_CANCELLED);

        return saved;
    }

    private void updateQueuePositions(Doctor doctor, LocalDate date, int cancelledQueueNumber) {
        List<Appointment> appointments = appointmentRepository
                .findByDoctorAndAppointmentDateOrderByQueueNumber(doctor, date);
        for (Appointment apt : appointments) {
            if (apt.getQueueNumber() > cancelledQueueNumber &&
                    apt.getStatus() != Appointment.AppointmentStatus.CANCELLED) {
                apt.setCurrentQueuePosition(apt.getCurrentQueuePosition() - 1);
                appointmentRepository.save(apt);
                notificationService.sendNotification(apt.getPatient(),
                        "Queue Update",
                        "Your queue position has been updated to " + apt.getCurrentQueuePosition(),
                        Notification.NotificationType.QUEUE_UPDATE);
            }
        }
    }

    public Page<Appointment> getPatientAppointments(User patient, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookedAt").descending());
        return appointmentRepository.findByPatientOrderByBookedAtDesc(patient, pageable);
    }

    public Page<Appointment> getDoctorAppointments(Doctor doctor, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return appointmentRepository.findByDoctorOrderByAppointmentDateAscAppointmentTimeAsc(doctor, pageable);
    }

    public List<Appointment> getQueueForDoctor(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return appointmentRepository.findByDoctorAndAppointmentDateOrderByQueueNumber(doctor, date);
    }

    public Optional<Appointment> findById(Long id) {
        return appointmentRepository.findById(id);
    }

    public Appointment save(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public long getTotalAppointments() {
        return appointmentRepository.count();
    }

    public long getAppointmentsByStatus(Appointment.AppointmentStatus status) {
        return appointmentRepository.countByStatus(status);
    }
}
