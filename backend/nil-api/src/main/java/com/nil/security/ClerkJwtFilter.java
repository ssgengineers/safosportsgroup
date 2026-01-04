package com.nil.security;

import com.nil.service.ClerkUserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * JWT Filter for validating Clerk authentication tokens.
 * Extracts user info from valid JWTs and sets security context.
 */
@Component
public class ClerkJwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ClerkJwtFilter.class);

    private final ClerkUserService clerkUserService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Value("${clerk.jwks-url:}")
    private String jwksUrl;
    
    @Value("${clerk.issuer:}")
    private String issuer;

    private Map<String, PublicKey> publicKeyCache = new HashMap<>();
    private long cacheExpiry = 0;

    public ClerkJwtFilter(ClerkUserService clerkUserService) {
        this.clerkUserService = clerkUserService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        
        try {
            // Parse token header to get key ID
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                log.warn("Invalid JWT format");
                filterChain.doFilter(request, response);
                return;
            }

            String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
            JsonNode header = objectMapper.readTree(headerJson);
            String kid = header.get("kid").asText();

            // Get public key for verification
            PublicKey publicKey = getPublicKey(kid);
            if (publicKey == null) {
                log.warn("Could not find public key for kid: {}", kid);
                filterChain.doFilter(request, response);
                return;
            }

            // Verify and parse token using jjwt 0.12.x API
            Claims claims = Jwts.parser()
                    .verifyWith(publicKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Validate issuer
            if (issuer != null && !issuer.isEmpty() && !issuer.equals(claims.getIssuer())) {
                log.warn("Invalid token issuer: {}", claims.getIssuer());
                filterChain.doFilter(request, response);
                return;
            }

            // Extract user info
            String clerkId = claims.getSubject();
            String email = claims.get("email", String.class);
            String firstName = claims.get("first_name", String.class);
            String lastName = claims.get("last_name", String.class);
            
            // Log all available claims for debugging
            log.debug("JWT claims for user {}: {}", clerkId, claims.keySet());
            
            // If email is not in claims, try alternative claim names
            if (email == null || email.isEmpty()) {
                email = claims.get("https://clerk.dev/email", String.class);
            }
            if (email == null || email.isEmpty()) {
                // Try to get from primary_email_address if available
                Object primaryEmailObj = claims.get("primary_email_address");
                if (primaryEmailObj != null) {
                    if (primaryEmailObj instanceof String) {
                        email = (String) primaryEmailObj;
                    } else if (primaryEmailObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> emailMap = (Map<String, Object>) primaryEmailObj;
                        email = (String) emailMap.get("email_address");
                    }
                }
            }
            
            // Log extracted values
            log.debug("Extracted from JWT - clerkId: {}, email: {}, firstName: {}, lastName: {}", 
                      clerkId, email, firstName, lastName);

            // Validate that we have required fields
            if (clerkId == null || clerkId.isEmpty()) {
                log.warn("JWT token missing required 'sub' claim (clerkId)");
                filterChain.doFilter(request, response);
                return;
            }
            
            if (email == null || email.isEmpty()) {
                log.warn("JWT token missing email for user: {}. Attempting to fetch from Clerk API.", clerkId);
                // Try to fetch user from Clerk API
                ClerkUserService.UserInfo userInfo = clerkUserService.fetchUserFromClerkApi(clerkId);
                if (userInfo != null && userInfo.email != null && !userInfo.email.isEmpty()) {
                    email = userInfo.email;
                    if (firstName == null || firstName.isEmpty()) {
                        firstName = userInfo.firstName;
                    }
                    if (lastName == null || lastName.isEmpty()) {
                        lastName = userInfo.lastName;
                    }
                    log.info("Successfully fetched email from Clerk API for user: {}", clerkId);
                } else {
                    log.error("Could not fetch email from Clerk API for user: {}. Skipping user sync.", clerkId);
                    // Still set authentication but don't sync user
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(clerkId, null, authorities);
                    Map<String, Object> details = new HashMap<>();
                    details.put("clerkId", clerkId);
                    authentication.setDetails(details);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    filterChain.doFilter(request, response);
                    return;
                }
            }

            // Sync user to local database (creates if not exists)
            try {
                clerkUserService.syncClerkUser(clerkId, email, firstName, lastName);
            } catch (IllegalArgumentException e) {
                log.error("Failed to sync user {}: {}", clerkId, e.getMessage());
                // Don't set authentication if we can't sync - this will cause issues downstream
                filterChain.doFilter(request, response);
                return;
            } catch (Exception e) {
                log.error("Failed to sync user {}: {}", clerkId, e.getMessage(), e);
                // Continue with authentication even if sync fails (for other exceptions)
            }

            // Set authentication in security context
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            
            // Add role-based authorities if present in token
            @SuppressWarnings("unchecked")
            Map<String, Object> metadata = claims.get("public_metadata", Map.class);
            if (metadata != null && metadata.containsKey("role")) {
                String role = (String) metadata.get("role");
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
            }

            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(clerkId, null, authorities);
            
            // Store additional user info in authentication details
            Map<String, Object> details = new HashMap<>();
            details.put("clerkId", clerkId);
            details.put("email", email);
            details.put("firstName", firstName);
            details.put("lastName", lastName);
            authentication.setDetails(details);
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            log.debug("Authenticated user: {} ({})", clerkId, email);

        } catch (Exception e) {
            log.error("JWT validation failed: {}", e.getMessage());
            // Continue without authentication - let security config handle access denial
        }

        filterChain.doFilter(request, response);
    }

    private PublicKey getPublicKey(String kid) {
        // Check cache
        if (System.currentTimeMillis() < cacheExpiry && publicKeyCache.containsKey(kid)) {
            return publicKeyCache.get(kid);
        }

        // Fetch JWKS
        try {
            if (jwksUrl == null || jwksUrl.isEmpty()) {
                log.warn("JWKS URL not configured");
                return null;
            }

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(jwksUrl))
                    .GET()
                    .build();

            HttpResponse<String> httpResponse = client.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode jwks = objectMapper.readTree(httpResponse.body());
            JsonNode keys = jwks.get("keys");

            publicKeyCache.clear();
            
            for (JsonNode key : keys) {
                String keyId = key.get("kid").asText();
                String n = key.get("n").asText();
                String e = key.get("e").asText();
                
                PublicKey publicKey = createRSAPublicKey(n, e);
                publicKeyCache.put(keyId, publicKey);
            }

            // Cache for 1 hour
            cacheExpiry = System.currentTimeMillis() + 3600000;

            return publicKeyCache.get(kid);

        } catch (Exception e) {
            log.error("Failed to fetch JWKS: {}", e.getMessage());
            return null;
        }
    }

    private PublicKey createRSAPublicKey(String modulusBase64, String exponentBase64) throws Exception {
        byte[] modulusBytes = Base64.getUrlDecoder().decode(modulusBase64);
        byte[] exponentBytes = Base64.getUrlDecoder().decode(exponentBase64);
        
        BigInteger modulus = new BigInteger(1, modulusBytes);
        BigInteger exponent = new BigInteger(1, exponentBytes);
        
        RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
        KeyFactory factory = KeyFactory.getInstance("RSA");
        
        return factory.generatePublic(spec);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip filter for public endpoints
        return path.startsWith("/actuator") 
            || path.startsWith("/swagger-ui")
            || path.startsWith("/api-docs")
            || path.startsWith("/h2-console")
            || path.equals("/api/v1/health")
            || path.equals("/api/v1/tables");
    }
}
