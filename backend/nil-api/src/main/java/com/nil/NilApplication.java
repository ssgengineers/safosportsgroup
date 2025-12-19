package com.nil;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * NIL Platform API - Main Application Entry Point
 * 
 * This is the core backend service for the NIL matchmaking platform.
 * It handles athlete/brand profiles, campaigns, matching, and deals.
 */
@SpringBootApplication
@EnableJpaAuditing
public class NilApplication {

    public static void main(String[] args) {
        SpringApplication.run(NilApplication.class, args);
    }
}

