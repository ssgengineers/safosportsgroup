package com.nil.controller;

import com.nil.service.S3Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
@Tag(name = "Media", description = "Media upload and management endpoints")
public class MediaController {

    private static final Logger logger = LoggerFactory.getLogger(MediaController.class);

    private final S3Service s3Service;

    public MediaController(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    @PostMapping("/upload/athlete")
    @Operation(summary = "Upload athlete media file", description = "Upload a media file (photo, video) for an athlete")
    @PreAuthorize("hasRole('ATHLETE')")
    public ResponseEntity<Map<String, String>> uploadAthleteMedia(
            @RequestParam("file") MultipartFile file) {
        try {
            String key = s3Service.uploadAthleteMedia(file);
            String presignedUrl = s3Service.generatePresignedUrl(key);

            Map<String, String> response = new HashMap<>();
            response.put("key", key);
            response.put("url", presignedUrl);
            response.put("message", "File uploaded successfully");

            logger.info("Athlete media uploaded: {}", key);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error uploading athlete media: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/upload/brand")
    @Operation(summary = "Upload brand logo", description = "Upload a logo for a brand")
    @PreAuthorize("hasRole('BRAND')")
    public ResponseEntity<Map<String, String>> uploadBrandLogo(
            @RequestParam("file") MultipartFile file) {
        try {
            String key = s3Service.uploadBrandLogo(file);
            String presignedUrl = s3Service.generatePresignedUrl(key);

            Map<String, String> response = new HashMap<>();
            response.put("key", key);
            response.put("url", presignedUrl);
            response.put("message", "Logo uploaded successfully");

            logger.info("Brand logo uploaded: {}", key);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error uploading brand logo: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/presigned-url")
    @Operation(summary = "Generate presigned URL", description = "Generate a presigned URL for secure file access")
    public ResponseEntity<Map<String, String>> generatePresignedUrl(
            @RequestParam String key,
            @RequestParam(defaultValue = "60") int expirationMinutes) {
        try {
            String url = s3Service.generatePresignedUrl(key, expirationMinutes);

            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            response.put("expirationMinutes", String.valueOf(expirationMinutes));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error generating presigned URL: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate presigned URL: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{key}")
    @Operation(summary = "Delete media file", description = "Delete a media file from S3")
    @PreAuthorize("hasAnyRole('ATHLETE', 'BRAND', 'ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable String key) {
        try {
            s3Service.deleteFile(key);

            Map<String, String> response = new HashMap<>();
            response.put("message", "File deleted successfully");
            response.put("key", key);

            logger.info("Media file deleted: {}", key);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error deleting file: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/exists/{key}")
    @Operation(summary = "Check if file exists", description = "Check if a file exists in S3")
    public ResponseEntity<Map<String, Object>> fileExists(@PathVariable String key) {
        boolean exists = s3Service.fileExists(key);

        Map<String, Object> response = new HashMap<>();
        response.put("key", key);
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }
}

