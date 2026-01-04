package com.nil.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Service for sending Clerk email invitations.
 * Creates invitations via Clerk API when admin approves intake requests.
 */
@Service
public class ClerkInvitationService {

    private static final Logger log = LoggerFactory.getLogger(ClerkInvitationService.class);
    private static final String CLERK_API_BASE = "https://api.clerk.com/v1";

    private final String clerkSecretKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ClerkInvitationService(@Value("${clerk.secret-key:}") String clerkSecretKey) {
        this.clerkSecretKey = clerkSecretKey;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Send an email invitation to a user via Clerk.
     * 
     * @param email The email address to send the invitation to
     * @param firstName First name of the user (optional)
     * @param lastName Last name of the user (optional)
     * @return The invitation ID if successful, null if failed
     */
    public String sendInvitation(String email, String firstName, String lastName) {
        if (clerkSecretKey == null || clerkSecretKey.isEmpty()) {
            log.warn("Clerk secret key not configured. Skipping invitation for: {}", email);
            return null;
        }

        try {
            // Build request body
            String requestBody = buildInvitationRequestBody(email, firstName, lastName);
            
            // Create HTTP request
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CLERK_API_BASE + "/invitations"))
                    .header("Authorization", "Bearer " + clerkSecretKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            // Send request
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 201) {
                JsonNode responseJson = objectMapper.readTree(response.body());
                String invitationId = responseJson.get("id").asText();
                log.info("Clerk invitation sent successfully to {} (invitation ID: {})", email, invitationId);
                return invitationId;
            } else {
                log.error("Failed to send Clerk invitation to {}. Status: {}, Response: {}", 
                        email, response.statusCode(), response.body());
                return null;
            }

        } catch (Exception e) {
            log.error("Error sending Clerk invitation to {}: {}", email, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Build the request body for Clerk invitation API
     */
    private String buildInvitationRequestBody(String email, String firstName, String lastName) {
        try {
            StringBuilder body = new StringBuilder();
            body.append("{");
            body.append("\"email_address\":\"").append(email).append("\"");
            
            if (firstName != null && !firstName.isEmpty()) {
                body.append(",\"public_metadata\":{");
                body.append("\"first_name\":\"").append(firstName).append("\"");
                if (lastName != null && !lastName.isEmpty()) {
                    body.append(",\"last_name\":\"").append(lastName).append("\"");
                }
                body.append("}");
            }
            
            body.append("}");
            return body.toString();
        } catch (Exception e) {
            log.error("Error building invitation request body: {}", e.getMessage());
            return "{\"email_address\":\"" + email + "\"}";
        }
    }
}

