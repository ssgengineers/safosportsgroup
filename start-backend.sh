#!/bin/bash

# Load environment variables from .env file safely
if [ -f .env ]; then
    # Use a safer method to load .env file (handles spaces and special chars better)
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
fi

# Start the backend
cd backend/nil-api
./mvnw spring-boot:run

