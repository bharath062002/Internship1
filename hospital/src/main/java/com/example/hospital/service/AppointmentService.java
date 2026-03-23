package com.example.hospital.service;

import com.example.hospital.model.Appointment;
import com.example.hospital.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // book appointment
    public Appointment bookAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    // cancel appointment
    public void cancelAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    // view all appointments
    public List<Appointment> getAppointments() {
        return appointmentRepository.findAll();
    }
}