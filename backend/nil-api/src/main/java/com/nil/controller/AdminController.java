package com.nil.controller;

import com.nil.entity.AthleteIntakeRequest;
import com.nil.entity.BrandIntakeRequest;
import com.nil.repository.AthleteIntakeRequestRepository;
import com.nil.repository.BrandIntakeRequestRepository;
import com.nil.service.ClerkInvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin", description = "Admin endpoints for managing intake requests")
@SecurityRequirement(name = "bearer-jwt")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final AthleteIntakeRequestRepository athleteIntakeRepo;
    private final BrandIntakeRequestRepository brandIntakeRepo;
    private final ClerkInvitationService clerkInvitationService;

    public AdminController(
            AthleteIntakeRequestRepository athleteIntakeRepo,
            BrandIntakeRequestRepository brandIntakeRepo,
            ClerkInvitationService clerkInvitationService) {
        this.athleteIntakeRepo = athleteIntakeRepo;
        this.brandIntakeRepo = brandIntakeRepo;
        this.clerkInvitationService = clerkInvitationService;
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
                String newStatus = request.get("status");
                String oldStatus = req.getStatus();
                req.setStatus(newStatus);
                
                if (request.containsKey("adminNotes")) {
                    req.setAdminNotes(request.get("adminNotes"));
                }
                
                // Send Clerk invitation when status changes to APPROVED
                if ("APPROVED".equalsIgnoreCase(newStatus) && !"APPROVED".equalsIgnoreCase(oldStatus)) {
                    log.info("Approving athlete request for {} - sending Clerk invitation", req.getEmail());
                    String invitationId = clerkInvitationService.sendInvitation(
                            req.getEmail(),
                            req.getFirstName(),
                            req.getLastName()
                    );
                    
                    if (invitationId != null) {
                        req.setClerkInvitationId(invitationId);
                        req.setInvitationSentAt(Instant.now());
                        log.info("Clerk invitation sent successfully. Invitation ID: {}", invitationId);
                    } else {
                        log.warn("Failed to send Clerk invitation for athlete request {}", req.getId());
                    }
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
                String newStatus = request.get("status");
                String oldStatus = req.getStatus();
                req.setStatus(newStatus);
                
                if (request.containsKey("adminNotes")) {
                    req.setAdminNotes(request.get("adminNotes"));
                }
                
                // Send Clerk invitation when status changes to APPROVED
                if ("APPROVED".equalsIgnoreCase(newStatus) && !"APPROVED".equalsIgnoreCase(oldStatus)) {
                    log.info("Approving brand request for {} - sending Clerk invitation", req.getEmail());
                    String invitationId = clerkInvitationService.sendInvitation(
                            req.getEmail(),
                            req.getContactFirstName(),
                            req.getContactLastName()
                    );
                    
                    if (invitationId != null) {
                        req.setClerkInvitationId(invitationId);
                        req.setInvitationSentAt(Instant.now());
                        log.info("Clerk invitation sent successfully. Invitation ID: {}", invitationId);
                    } else {
                        log.warn("Failed to send Clerk invitation for brand request {}", req.getId());
                    }
                }
                
                return ResponseEntity.ok(brandIntakeRepo.save(req));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

