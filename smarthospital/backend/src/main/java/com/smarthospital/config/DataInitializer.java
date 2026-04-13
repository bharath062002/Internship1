package com.smarthospital.config;

import com.smarthospital.model.Doctor;
import com.smarthospital.model.User;
import com.smarthospital.repository.DoctorRepository;
import com.smarthospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // Admin
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@smarthospital.com");
        admin.setPassword(encoder.encode("admin123"));
        admin.setFullName("System Admin");
        admin.setRole(User.Role.ADMIN);
        admin.setPhone("+91-9000000001");
        userRepository.save(admin);

        // Doctors
        String[][] doctorData = {
            {"dr.sharma", "dr.sharma@smarthospital.com", "Dr. Rajesh Sharma", "+91-9000000002", "Cardiologist", "MBBS, MD (Cardiology)", "Cardiology", "15"},
            {"dr.patel", "dr.patel@smarthospital.com", "Dr. Priya Patel", "+91-9000000003", "Neurologist", "MBBS, DM (Neurology)", "Neurology", "12"},
            {"dr.kumar", "dr.kumar@smarthospital.com", "Dr. Amit Kumar", "+91-9000000004", "Orthopedic Surgeon", "MBBS, MS (Ortho)", "Orthopedics", "10"},
            {"dr.singh", "dr.singh@smarthospital.com", "Dr. Sunita Singh", "+91-9000000005", "Pediatrician", "MBBS, MD (Pediatrics)", "Pediatrics", "8"},
            {"dr.mehta", "dr.mehta@smarthospital.com", "Dr. Ravi Mehta", "+91-9000000006", "Dermatologist", "MBBS, DVD", "Dermatology", "6"}
        };

        for (String[] d : doctorData) {
            User u = new User();
            u.setUsername(d[0]);
            u.setEmail(d[1]);
            u.setPassword(encoder.encode("doctor123"));
            u.setFullName(d[2]);
            u.setPhone(d[3]);
            u.setRole(User.Role.DOCTOR);
            userRepository.save(u);

            Doctor doc = new Doctor();
            doc.setUser(u);
            doc.setSpecialization(d[4]);
            doc.setQualification(d[5]);
            doc.setDepartment(d[6]);
            doc.setExperienceYears(Integer.parseInt(d[7]));
            doc.setConsultationFee("₹500");
            doc.setAvailable(true);
            doc.setMaxPatientsPerSlot(20);
            doc.setMorningStartTime(LocalTime.of(9, 0));
            doc.setMorningEndTime(LocalTime.of(13, 0));
            doc.setEveningStartTime(LocalTime.of(17, 0));
            doc.setEveningEndTime(LocalTime.of(20, 0));
            doc.setRating(4.5);
            doc.setTotalReviews(120);
            doc.setWorkingDays(Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"));
            doc.setBio("Experienced specialist with over " + d[7] + " years of clinical practice.");
            doctorRepository.save(doc);
        }

        // Patients
        String[][] patientData = {
            {"patient1", "patient1@email.com", "Ramesh Verma", "+91-9100000001", "O+", "35", "Male"},
            {"patient2", "patient2@email.com", "Anita Sharma", "+91-9100000002", "A+", "28", "Female"},
            {"patient3", "patient3@email.com", "Vikram Nair", "+91-9100000003", "B+", "42", "Male"}
        };

        for (String[] p : patientData) {
            User u = new User();
            u.setUsername(p[0]);
            u.setEmail(p[1]);
            u.setPassword(encoder.encode("patient123"));
            u.setFullName(p[2]);
            u.setPhone(p[3]);
            u.setBloodGroup(p[4]);
            u.setAge(Integer.parseInt(p[5]));
            u.setGender(p[6]);
            u.setRole(User.Role.PATIENT);
            userRepository.save(u);
        }

        System.out.println("✅ SmartHospital demo data initialized successfully!");
        System.out.println("👤 Admin: admin / admin123");
        System.out.println("🩺 Doctor: dr.sharma / doctor123");
        System.out.println("🧑 Patient: patient1 / patient123");
    }
}
