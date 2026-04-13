package com.smarthospital.repository;

import com.smarthospital.model.Doctor;
import com.smarthospital.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    List<Doctor> findBySpecialization(String specialization);
    Page<Doctor> findByAvailable(boolean available, Pageable pageable);
    
    @Query("SELECT d FROM Doctor d WHERE d.available = true AND " +
           "(LOWER(d.specialization) LIKE LOWER(CONCAT('%',:keyword,'%')) OR " +
           "LOWER(d.department) LIKE LOWER(CONCAT('%',:keyword,'%')) OR " +
           "LOWER(d.user.fullName) LIKE LOWER(CONCAT('%',:keyword,'%')))")
    Page<Doctor> searchDoctors(String keyword, Pageable pageable);
    
    List<Doctor> findByDepartment(String department);
}
