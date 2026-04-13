package com.smarthospital.repository;

import com.smarthospital.model.Appointment;
import com.smarthospital.model.Doctor;
import com.smarthospital.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Page<Appointment> findByPatientOrderByBookedAtDesc(User patient, Pageable pageable);
    Page<Appointment> findByDoctorOrderByAppointmentDateAscAppointmentTimeAsc(Doctor doctor, Pageable pageable);
    List<Appointment> findByDoctorAndAppointmentDateOrderByQueueNumber(Doctor doctor, LocalDate date);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor = :doctor " +
           "AND a.appointmentDate = :date AND a.status != 'CANCELLED'")
    int countByDoctorAndDate(Doctor doctor, LocalDate date);

    @Query("SELECT MAX(a.queueNumber) FROM Appointment a WHERE a.doctor = :doctor " +
           "AND a.appointmentDate = :date")
    Integer findMaxQueueNumber(Doctor doctor, LocalDate date);

    List<Appointment> findByReminderSentFalseAndAppointmentDateAndStatus(
            LocalDate date, Appointment.AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.bookedAt BETWEEN :start AND :end")
    List<Appointment> findAppointmentsInPeriod(LocalDateTime start, LocalDateTime end);

    long countByStatus(Appointment.AppointmentStatus status);
}
