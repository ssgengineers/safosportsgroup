package com.nil.repository;

import com.nil.entity.BrandIntakeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandIntakeRequestRepository extends JpaRepository<BrandIntakeRequest, UUID> {
    
    Optional<BrandIntakeRequest> findByEmail(String email);
    
    List<BrandIntakeRequest> findByStatus(String status);
    
    Page<BrandIntakeRequest> findByStatus(String status, Pageable pageable);
    
    Page<BrandIntakeRequest> findByCompanyContainingIgnoreCase(String company, Pageable pageable);
    
    Page<BrandIntakeRequest> findByIndustryContainingIgnoreCase(String industry, Pageable pageable);
    
    long countByStatus(String status);
    
    boolean existsByEmail(String email);
}

