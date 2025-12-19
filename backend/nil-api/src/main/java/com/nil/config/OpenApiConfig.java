package com.nil.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI / Swagger configuration for API documentation.
 * Access docs at /swagger-ui.html after starting the app.
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port}")
    private String serverPort;

    @Bean
    public OpenAPI nilPlatformOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("NIL Platform API")
                        .description("Backend API for NIL Matchmaking Platform - Connecting Athletes with Brands")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("NIL Platform Team")
                                .email("engineering@nilplatform.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://nilplatform.com")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Local Development Server")))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Clerk JWT token")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));
    }
}

