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
import java.util.HashMap;
import java.util.Map;

/**
 * Service for interacting with Clerk's REST API.
 * Handles sending invitation emails when admins approve intake requests.
 */
@Service
public class ClerkApiService {

    private static final Logger log = LoggerFactory.getLogger(ClerkApiService.class);
    private static final String CLERK_API_BASE_URL = "https://api.clerk.com/v1";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${clerk.secret-key:}")
    private String clerkSecretKey;

    /**
     * Send an invitation email via Clerk to a user.
     * This is called when an admin approves an intake request.
     *
     * @param email The email address to send the invitation to
     * @param role The role to assign (ATHLETE or BRAND)
     * @param redirectUrl Optional URL to redirect after signup
     * @return InvitationResult containing success status and details
     */
    public InvitationResult sendInvitation(String email, String role, String redirectUrl) {
        if (clerkSecretKey == null || clerkSecretKey.isEmpty()) {
            log.error("Clerk secret key is not configured. Cannot send invitation.");
            return new InvitationResult(false, null, "Clerk secret key not configured");
        }

        try {
            // Build the invitation request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("email_address", email);
            
            // Add public metadata with the user's role
            Map<String, Object> publicMetadata = new HashMap<>();
            publicMetadata.put("role", role);
            publicMetadata.put("source", "admin_approval");
            requestBody.put("public_metadata", publicMetadata);

            // Add redirect URL if provided
            if (redirectUrl != null && !redirectUrl.isEmpty()) {
                requestBody.put("redirect_url", redirectUrl);
            }

            String jsonBody = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CLERK_API_BASE_URL + "/invitations"))
                    .header("Authorization", "Bearer " + clerkSecretKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 201) {
                JsonNode responseJson = objectMapper.readTree(response.body());
                String invitationId = responseJson.has("id") ? responseJson.get("id").asText() : null;
                log.info("Successfully sent Clerk invitation to {} with role {}. Invitation ID: {}", 
                        email, role, invitationId);
                return new InvitationResult(true, invitationId, "Invitation sent successfully");
            } else {
                // Parse error response
                JsonNode errorJson = objectMapper.readTree(response.body());
                String errorMessage = "Unknown error";
                if (errorJson.has("errors") && errorJson.get("errors").isArray()) {
                    JsonNode firstError = errorJson.get("errors").get(0);
                    if (firstError.has("message")) {
                        errorMessage = firstError.get("message").asText();
                    }
                }
                log.error("Failed to send Clerk invitation to {}. Status: {}, Error: {}", 
                        email, response.statusCode(), errorMessage);
                return new InvitationResult(false, null, errorMessage);
            }

        } catch (Exception e) {
            log.error("Exception while sending Clerk invitation to {}: {}", email, e.getMessage(), e);
            return new InvitationResult(false, null, "Failed to send invitation: " + e.getMessage());
        }
    }

    /**
     * Send invitation with default redirect URL.
     */
    public InvitationResult sendInvitation(String email, String role) {
        return sendInvitation(email, role, null);
    }

    /**
     * Revoke a pending invitation.
     *
     * @param invitationId The Clerk invitation ID to revoke
     * @return true if revocation was successful
     */
    public boolean revokeInvitation(String invitationId) {
        if (clerkSecretKey == null || clerkSecretKey.isEmpty()) {
            log.error("Clerk secret key is not configured. Cannot revoke invitation.");
            return false;
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CLERK_API_BASE_URL + "/invitations/" + invitationId + "/revoke"))
                    .header("Authorization", "Bearer " + clerkSecretKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                log.info("Successfully revoked Clerk invitation: {}", invitationId);
                return true;
            } else {
                log.error("Failed to revoke Clerk invitation {}. Status: {}", invitationId, response.statusCode());
                return false;
            }

        } catch (Exception e) {
            log.error("Exception while revoking Clerk invitation {}: {}", invitationId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Delete a user from Clerk.
     *
     * @param clerkUserId The Clerk user ID to delete
     * @return true if deletion was successful
     */
    public boolean deleteUser(String clerkUserId) {
        if (clerkSecretKey == null || clerkSecretKey.isEmpty()) {
            log.error("Clerk secret key is not configured. Cannot delete user.");
            return false;
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CLERK_API_BASE_URL + "/users/" + clerkUserId))
                    .header("Authorization", "Bearer " + clerkSecretKey)
                    .DELETE()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                log.info("Successfully deleted Clerk user: {}", clerkUserId);
                return true;
            } else {
                log.error("Failed to delete Clerk user {}. Status: {}", clerkUserId, response.statusCode());
                return false;
            }

        } catch (Exception e) {
            log.error("Exception while deleting Clerk user {}: {}", clerkUserId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Result object for invitation operations.
     */
    public record InvitationResult(
            boolean success,
            String invitationId,
            String message
    ) {}
}

