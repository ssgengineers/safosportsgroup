package com.nil.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nil.dto.AthleteIntakeRequestDTO;
import com.nil.dto.BrandIntakeRequestDTO;
import com.nil.dto.IntakeResponseDTO;
import com.nil.entity.AthleteIntakeRequest;
import com.nil.entity.BrandIntakeRequest;
import com.nil.repository.AthleteIntakeRequestRepository;
import com.nil.repository.BrandIntakeRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Public controller for intake form submissions.
 * These endpoints do not require authentication since they are
 * for new users signing up for the platform.
 */
@RestController
@RequestMapping("/api/v1/intake")
@Tag(name = "Intake", description = "Public endpoints for athlete and brand signup forms")
public class IntakeController {

    private final AthleteIntakeRequestRepository athleteIntakeRepo;
    private final BrandIntakeRequestRepository brandIntakeRepo;
    private final ObjectMapper objectMapper;

    public IntakeController(
            AthleteIntakeRequestRepository athleteIntakeRepo,
            BrandIntakeRequestRepository brandIntakeRepo,
            ObjectMapper objectMapper) {
        this.athleteIntakeRepo = athleteIntakeRepo;
        this.brandIntakeRepo = brandIntakeRepo;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/athlete")
    @Operation(
        summary = "Submit athlete signup form",
        description = "Submits a new athlete application. This creates a pending request that will be reviewed by admins."
    )
    public ResponseEntity<IntakeResponseDTO> submitAthleteIntake(
            @RequestBody AthleteIntakeRequestDTO dto) {
        
        if (athleteIntakeRepo.existsByEmail(dto.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(IntakeResponseDTO.builder()
                    .status("ERROR")
                    .message("An application with this email already exists.")
                    .build());
        }

        String additionalSocialsJson = null;
        if (dto.getAdditionalSocials() != null && !dto.getAdditionalSocials().isEmpty()) {
            try {
                additionalSocialsJson = objectMapper.writeValueAsString(dto.getAdditionalSocials());
            } catch (JsonProcessingException e) {
                additionalSocialsJson = "[]";
            }
        }

        AthleteIntakeRequest request = AthleteIntakeRequest.builder()
            .firstName(dto.getFirstName())
            .lastName(dto.getLastName())
            .email(dto.getEmail())
            .dateOfBirth(dto.getDateOfBirth())
            .location(dto.getLocation())
            .school(dto.getSchool())
            .sport(dto.getSport())
            .position(dto.getPosition())
            .primarySocialPlatform(dto.getPrimarySocial() != null ? dto.getPrimarySocial().getPlatform() : null)
            .primarySocialHandle(dto.getPrimarySocial() != null ? dto.getPrimarySocial().getHandle() : null)
            .additionalSocials(additionalSocialsJson)
            .bio(dto.getBio())
            .goals(dto.getGoals())
            .status("PENDING")
            .build();

        AthleteIntakeRequest saved = athleteIntakeRepo.save(request);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(IntakeResponseDTO.builder()
                .id(saved.getId())
                .status("PENDING")
                .message("Thank you for your application! Our team will review it within 24-48 hours.")
                .submittedAt(saved.getCreatedAt())
                .build());
    }

    @GetMapping("/athlete/check")
    @Operation(
        summary = "Check if athlete email exists",
        description = "Checks if an application with the given email already exists"
    )
    public ResponseEntity<Map<String, Object>> checkAthleteEmail(@RequestParam String email) {
        boolean exists = athleteIntakeRepo.existsByEmail(email);
        return ResponseEntity.ok(Map.of(
            "email", email,
            "exists", exists,
            "message", exists ? "An application with this email already exists." : "Email is available."
        ));
    }

    @PostMapping("/brand")
    @Operation(
        summary = "Submit brand partnership form",
        description = "Submits a new brand partnership application. This creates a pending request that will be reviewed by admins."
    )
    public ResponseEntity<IntakeResponseDTO> submitBrandIntake(
            @RequestBody BrandIntakeRequestDTO dto) {
        
        if (brandIntakeRepo.existsByEmail(dto.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(IntakeResponseDTO.builder()
                    .status("ERROR")
                    .message("An application with this email already exists.")
                    .build());
        }

        BrandIntakeRequest request = BrandIntakeRequest.builder()
            .company(dto.getCompany())
            .contactFirstName(dto.getContactFirstName())
            .contactLastName(dto.getContactLastName())
            .contactTitle(dto.getContactTitle())
            .email(dto.getEmail())
            .phone(dto.getPhone())
            .website(dto.getWebsite())
            .industry(dto.getIndustry())
            .companySize(dto.getCompanySize())
            .budget(dto.getBudget())
            .description(dto.getDescription())
            .targetAudience(dto.getTargetAudience())
            .goals(dto.getGoals())
            .timeline(dto.getTimeline())
            .athletePreferences(dto.getAthletePreferences())
            .status("PENDING")
            .build();

        BrandIntakeRequest saved = brandIntakeRepo.save(request);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(IntakeResponseDTO.builder()
                .id(saved.getId())
                .status("PENDING")
                .message("Thank you for your interest! Our partnership team will reach out within 24 hours.")
                .submittedAt(saved.getCreatedAt())
                .build());
    }

    @GetMapping("/brand/check")
    @Operation(
        summary = "Check if brand email exists",
        description = "Checks if an application with the given email already exists"
    )
    public ResponseEntity<Map<String, Object>> checkBrandEmail(@RequestParam String email) {
        boolean exists = brandIntakeRepo.existsByEmail(email);
        return ResponseEntity.ok(Map.of(
            "email", email,
            "exists", exists,
            "message", exists ? "An application with this email already exists." : "Email is available."
        ));
    }

    @GetMapping("/stats")
    @Operation(
        summary = "Get intake statistics",
        description = "Returns counts of pending, approved, and rejected applications"
    )
    public ResponseEntity<Map<String, Object>> getIntakeStats() {
        return ResponseEntity.ok(Map.of(
            "athletes", Map.of(
                "pending", athleteIntakeRepo.countByStatus("PENDING"),
                "approved", athleteIntakeRepo.countByStatus("APPROVED"),
                "rejected", athleteIntakeRepo.countByStatus("REJECTED"),
                "total", athleteIntakeRepo.count()
            ),
            "brands", Map.of(
                "pending", brandIntakeRepo.countByStatus("PENDING"),
                "approved", brandIntakeRepo.countByStatus("APPROVED"),
                "rejected", brandIntakeRepo.countByStatus("REJECTED"),
                "total", brandIntakeRepo.count()
            )
        ));
    }
}

