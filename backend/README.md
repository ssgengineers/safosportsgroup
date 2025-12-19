# NIL Platform Backend

Backend API for the NIL (Name, Image, Likeness) matchmaking platform. Built with Spring Boot and PostgreSQL.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Clerk Authentication                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Spring Boot Backend (nil-api)                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │Controllers│  │ Services  │  │Repositories│  │  Entities │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                       │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Docker & Docker Compose

### 1. Start the Database

```bash
cd backend
docker-compose up -d postgres
```

This starts PostgreSQL on `localhost:5432` with:
- Database: `nil_db`
- Username: `nil_user`
- Password: `nil_password`

### 2. Run the Application

```bash
cd nil-api
./mvnw spring-boot:run
```

Or with the dev profile (uses H2 in-memory database, no Docker needed):

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Access the API

- API Base URL: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/api-docs
- H2 Console (dev only): http://localhost:8080/h2-console

## Project Structure

```
backend/
├── nil-api/                      # Spring Boot API
│   ├── src/main/java/com/nil/
│   │   ├── NilApplication.java   # Main entry point
│   │   ├── config/               # Configuration classes
│   │   ├── controller/           # REST endpoints
│   │   ├── service/              # Business logic
│   │   ├── repository/           # JPA repositories
│   │   ├── entity/               # JPA entities
│   │   │   └── enums/            # Enum types
│   │   ├── dto/                  # Request/Response DTOs
│   │   └── exception/            # Custom exceptions
│   └── src/main/resources/
│       └── application.yml       # Configuration
├── ai-service/                   # FastAPI AI service (coming soon)
├── init-scripts/                 # Database initialization
└── docker-compose.yml            # Local development services
```

## Database Schema

### Core Entities

| Entity | Description |
|--------|-------------|
| `User` | Platform user (synced from Clerk) |
| `Role` | RBAC roles (ATHLETE, BRAND, ADMIN, etc.) |
| `Organization` | Brand/agency organization |
| `AthleteProfile` | Athlete data (school, sport, stats) |
| `AthletePreferences` | Brand/content preferences |
| `AthleteSocialAccount` | Social media connections |
| `AthleteSocialSnapshot` | Time-stamped metrics |
| `AthleteMedia` | Photos, videos, highlights |
| `AuditLog` | Change tracking |

### Key Enums

- `Sport` - Normalized sport types
- `Conference` - NCAA conferences
- `SocialPlatform` - Social media platforms
- `BrandCategory` - Industry categories
- `ContentType` - Content types for deals
- `MediaType` - Media asset types

## API Endpoints (MVP)

### Athletes
```
POST   /api/v1/athletes              # Create athlete profile
GET    /api/v1/athletes/{id}         # Get profile
PUT    /api/v1/athletes/{id}         # Update profile
POST   /api/v1/athletes/{id}/socials # Add social account
POST   /api/v1/athletes/{id}/media   # Upload media
GET    /api/v1/athletes/{id}/completeness
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLERK_DOMAIN` | Clerk authentication domain | - |
| `CLERK_AUDIENCE` | Clerk JWT audience | - |
| `AWS_S3_BUCKET` | S3 bucket for media | `nil-media-bucket` |
| `AWS_REGION` | AWS region | `us-east-1` |

## Development

### Running Tests

```bash
cd nil-api
./mvnw test
```

### Building for Production

```bash
./mvnw clean package -DskipTests
java -jar target/nil-api-0.0.1-SNAPSHOT.jar
```

### Using pgAdmin (Optional)

```bash
docker-compose --profile tools up -d
```

Access pgAdmin at http://localhost:5050 (admin@nil.com / admin)

## Team Tasks

### For Emmanuel/Peter (Brand Intake)
- Create `BrandProfile` entity following `AthleteProfile` pattern
- Add `Campaign` entity for brand campaigns
- Implement brand intake endpoints

### For Mitchell/Daniel (Extensions)
- Add more fields to `AthleteProfile` as needed
- Implement profile completeness scoring
- Add validation rules

### For AI Team
- FastAPI service scaffold is in `ai-service/`
- Define feature contracts with backend
- Implement scoring endpoints

## Troubleshooting

### Port already in use
```bash
lsof -i :8080  # Find process
kill -9 <PID>  # Kill it
```

### Database connection issues
```bash
docker-compose logs postgres  # Check logs
docker-compose down -v        # Reset volumes
docker-compose up -d postgres # Restart
```

### Maven issues
```bash
./mvnw clean install -U  # Force update dependencies
```

