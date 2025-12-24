package com.nil.repository;

import com.nil.entity.AthleteIntakeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AthleteIntakeRequestRepository extends JpaRepository<AthleteIntakeRequest, UUID> {
    
    Optional<AthleteIntakeRequest> findByEmail(String email);
    
    List<AthleteIntakeRequest> findByStatus(String status);
    
    Page<AthleteIntakeRequest> findByStatus(String status, Pageable pageable);
    
    Page<AthleteIntakeRequest> findBySchoolContainingIgnoreCase(String school, Pageable pageable);
    
    Page<AthleteIntakeRequest> findBySportContainingIgnoreCase(String sport, Pageable pageable);
    
    long countByStatus(String status);
    
    boolean existsByEmail(String email);
}

