package com.example.hospital.model;

import jakarta.persistence.*;

@Entity
@Table(name = "schedules")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String day;
    private String startTime;
    private String endTime;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

}