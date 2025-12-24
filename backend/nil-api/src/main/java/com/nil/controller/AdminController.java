package com.nil.controller;

import com.nil.entity.AthleteIntakeRequest;
import com.nil.entity.BrandIntakeRequest;
import com.nil.repository.AthleteIntakeRequestRepository;
import com.nil.repository.BrandIntakeRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin", description = "Admin endpoints for managing intake requests")
@SecurityRequirement(name = "bearer-jwt")
public class AdminController {

    private final AthleteIntakeRequestRepository athleteIntakeRepo;
    private final BrandIntakeRequestRepository brandIntakeRepo;

    public AdminController(
            AthleteIntakeRequestRepository athleteIntakeRepo,
            BrandIntakeRequestRepository brandIntakeRepo) {
        this.athleteIntakeRepo = athleteIntakeRepo;
        this.brandIntakeRepo = brandIntakeRepo;
    }

    @GetMapping("/intake/athletes")
    @Operation(summary = "Get all athlete intake requests")
    public ResponseEntity<Page<AthleteIntakeRequest>> getAthleteRequests(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String status) {
        
        Page<AthleteIntakeRequest> requests;
        if (status != null && !status.isEmpty()) {
            requests = athleteIntakeRepo.findByStatus(status, pageable);
        } else {
            requests = athleteIntakeRepo.findAll(pageable);
        }
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/intake/brands")
    @Operation(summary = "Get all brand intake requests")
    public ResponseEntity<Page<BrandIntakeRequest>> getBrandRequests(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String status) {
        
        Page<BrandIntakeRequest> requests;
        if (status != null && !status.isEmpty()) {
            requests = brandIntakeRepo.findByStatus(status, pageable);
        } else {
            requests = brandIntakeRepo.findAll(pageable);
        }
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/intake/athletes/{id}")
    @Operation(summary = "Get athlete intake request by ID")
    public ResponseEntity<AthleteIntakeRequest> getAthleteRequest(@PathVariable UUID id) {
        return athleteIntakeRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/intake/brands/{id}")
    @Operation(summary = "Get brand intake request by ID")
    public ResponseEntity<BrandIntakeRequest> getBrandRequest(@PathVariable UUID id) {
        return brandIntakeRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/intake/athletes/{id}/status")
    @Operation(summary = "Update athlete request status")
    public ResponseEntity<AthleteIntakeRequest> updateAthleteStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        return athleteIntakeRepo.findById(id)
            .map(req -> {
                req.setStatus(request.get("status"));
                if (request.containsKey("adminNotes")) {
                    req.setAdminNotes(request.get("adminNotes"));
                }
                return ResponseEntity.ok(athleteIntakeRepo.save(req));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/intake/brands/{id}/status")
    @Operation(summary = "Update brand request status")
    public ResponseEntity<BrandIntakeRequest> updateBrandStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        return brandIntakeRepo.findById(id)
            .map(req -> {
                req.setStatus(request.get("status"));
                if (request.containsKey("adminNotes")) {
                    req.setAdminNotes(request.get("adminNotes"));
                }
                return ResponseEntity.ok(brandIntakeRepo.save(req));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

