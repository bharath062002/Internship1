package com.smarthospital.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String specialization;
    private String qualification;
    private Integer experienceYears;
    private String consultationFee;
    private String department;
    private String bio;
    private String profileImage;
    private boolean available = true;

    // Schedule
    private LocalTime morningStartTime;
    private LocalTime morningEndTime;
    private LocalTime eveningStartTime;
    private LocalTime eveningEndTime;
    private Integer maxPatientsPerSlot = 20;

    @ElementCollection
    @CollectionTable(name = "doctor_working_days", joinColumns = @JoinColumn(name = "doctor_id"))
    @Column(name = "working_day")
    private List<String> workingDays;

    private Double rating = 0.0;
    private Integer totalReviews = 0;
}
