package com.nil.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Proxies matching requests to the FastAPI AI service.
 *
 * The frontend calls this endpoint with a Clerk JWT.
 * Spring Boot authenticates the request, then forwards it
 * to the internal AI service (which has no auth of its own).
 */
@RestController
@RequestMapping("/api/v1/matching")
@Tag(name = "Matching", description = "AI-powered athlete-brand matching (proxied to AI service)")
@SecurityRequirement(name = "bearer-jwt")
public class MatchingProxyController {

    private static final Logger log = LoggerFactory.getLogger(MatchingProxyController.class);

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public MatchingProxyController(
            @Value("${ai.service.url}") String aiServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.aiServiceUrl = aiServiceUrl;
    }

    @PostMapping("/find")
    @Operation(summary = "Find matching athletes for a brand",
               description = "Proxies to AI service hybrid matching: rule-based filtering + Claude analysis")
    public ResponseEntity<String> findMatches(@RequestBody String requestBody) {
        String url = aiServiceUrl + "/api/v1/matching/find-hybrid";
        log.info("Proxying match request to AI service: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());

        } catch (Exception e) {
            log.error("AI service request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("{\"error\": \"AI service unavailable\", \"detail\": \""
                            + e.getMessage().replace("\"", "'") + "\"}");
        }
    }

    @PostMapping("/find-local")
    @Operation(summary = "Find matching athletes using local LLM",
               description = "Proxies to AI service local matching (LM Studio)")
    public ResponseEntity<String> findMatchesLocal(@RequestBody String requestBody) {
        String url = aiServiceUrl + "/api/v1/matching/find-local";
        log.info("Proxying local match request to AI service: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());

        } catch (Exception e) {
            log.error("AI service local request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("{\"error\": \"AI service unavailable\", \"detail\": \""
                            + e.getMessage().replace("\"", "'") + "\"}");
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Check AI service health")
    public ResponseEntity<Map<String, Object>> aiHealth() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    aiServiceUrl + "/api/v1/health", String.class);

            return ResponseEntity.ok(Map.of(
                    "status", "UP",
                    "ai_service_url", aiServiceUrl,
                    "ai_service_status", response.getStatusCode().value()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "status", "DOWN",
                    "ai_service_url", aiServiceUrl,
                    "error", e.getMessage()
            ));
        }
    }
}
