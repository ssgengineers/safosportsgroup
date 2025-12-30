# AI Matching Algorithm Guide

This guide explains how to use the AI-powered matching and scoring endpoints that use Claude API.

## Setup

### 1. Install Dependencies

```bash
cd backend/ai-service
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in `backend/ai-service/` with:

```bash
# Required
ANTHROPIC_API_KEY=your_claude_api_key_here

# Optional (has defaults)
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=2000

# Main API URL (Spring Boot backend)
MAIN_API_URL=http://localhost:8080
```

### 3. Run the Service

```bash
cd backend/ai-service
uvicorn app.main:app --reload --port 8000
```

The service will be available at `http://localhost:8000` with docs at `/docs`.

---

## API Endpoints

### Recommended Endpoints (Simple - Just Provide IDs)

These endpoints automatically fetch all needed data from the main API.

#### Find Athlete Matches for Brand

**Endpoint:** `POST /api/v1/matching/find`

**Description:** Find best matching athletes for a brand. Just provide the brand ID and optionally specific athlete IDs to evaluate.

**Request Body:**
```json
{
  "brand_id": "uuid-of-brand-intake",
  "athlete_ids": ["athlete-uuid-1", "athlete-uuid-2"],
  "campaign_requirements": {
    "sport_preferences": ["FOOTBALL", "BASKETBALL"],
    "min_followers": 10000,
    "min_engagement_rate": 3.0
  },
  "max_results": 10
}
```

Note: `athlete_ids` and `campaign_requirements` are optional. If `athlete_ids` is omitted, all active athletes are evaluated.

**Response:**
```json
{
  "brand_id": "uuid-of-brand",
  "brand_name": "Sports Nutrition Co",
  "total_candidates": 50,
  "total_matches": 10,
  "matches": [
    {
      "athlete_id": "athlete-uuid-1",
      "athlete_name": "John Doe",
      "sport": "FOOTBALL",
      "school": "State University",
      "match_score": 87.5,
      "match_reasons": [
        "Strong alignment in target demographics (18-24 age group)",
        "High engagement rate (5.2%) indicates authentic audience",
        "Sport (Football) matches brand's athletic focus"
      ],
      "concerns": ["Limited campaign history"],
      "estimated_reach": 45000,
      "suggested_rate": 500.0,
      "component_scores": {
        "demographic_fit": 90,
        "engagement_quality": 85,
        "brand_alignment": 88,
        "reach_value": 82
      }
    }
  ],
  "generated_at": "2025-12-30T12:00:00Z"
}
```

#### Get Top Athletes for Brand (GET)

**Endpoint:** `GET /api/v1/matching/brand/{brand_id}/athletes`

**Query Parameters:**
- `sport` (optional): Filter by sport
- `conference` (optional): Filter by conference
- `min_followers` (optional): Minimum follower count
- `limit` (optional): Maximum results (default 10, max 50)

**Example:** `GET /api/v1/matching/brand/uuid-123/athletes?sport=FOOTBALL&limit=5`

#### Get Matching Brands for Athlete

**Endpoint:** `GET /api/v1/matching/athlete/{athlete_id}/brands`

**Query Parameters:**
- `limit` (optional): Maximum results (default 10, max 50)

**Example:** `GET /api/v1/matching/athlete/uuid-456/brands?limit=10`

---

### Scoring Endpoints

#### Score Athlete by ID

**Endpoint:** `GET /api/v1/scoring/athlete/{athlete_id}`

**Description:** Get comprehensive AI scoring for an athlete. Just provide the ID.

**Response:**
```json
{
  "athlete_id": "athlete-uuid-1",
  "athlete_name": "John Doe",
  "overall_score": 78.5,
  "scores": {
    "profile_quality": 20.0,
    "social_influence": 25.0,
    "market_value": 20.0,
    "nil_readiness": 13.5
  },
  "tier": "PREMIUM",
  "recommendations": [
    "Continue growing Instagram following",
    "Consider connecting TikTok account"
  ],
  "calculated_at": "2025-12-30T12:00:00Z"
}
```

#### Batch Score Athletes

**Endpoint:** `GET /api/v1/scoring/athletes/batch?athlete_ids=uuid1,uuid2,uuid3`

**Description:** Score multiple athletes at once (max 20).

#### Score Brand-Athlete Fit by IDs

**Endpoint:** `POST /api/v1/scoring/brand-fit/by-ids`

**Request Body:**
```json
{
  "athlete_id": "athlete-uuid",
  "brand_id": "brand-uuid"
}
```

**Response:**
```json
{
  "athlete_id": "athlete-uuid",
  "athlete_name": "John Doe",
  "brand_id": "brand-uuid",
  "brand_name": "Athletic Apparel Co",
  "brand_category": "ATHLETIC_APPAREL",
  "fit_score": 85.0,
  "match_reasons": [
    "Athlete's sport aligns with brand category",
    "Strong social media presence matches brand's target audience"
  ],
  "concerns": [
    "Limited campaign history to assess performance"
  ]
}
```

---

### Legacy Endpoints

These endpoints are maintained for backward compatibility but require you to pass all data:

| Legacy Endpoint | Recommended Alternative |
|-----------------|------------------------|
| `POST /matching/campaign/ai` | `POST /matching/find` |
| `POST /scoring/athlete/ai` | `GET /scoring/athlete/{id}` |
| `POST /scoring/brand-fit/ai` | `POST /scoring/brand-fit/by-ids` |

---

## Scoring Tiers

| Tier | Score Range | Description | Typical Deal Range |
|------|-------------|-------------|-------------------|
| ELITE | 80-100 | Top-tier athletes with strong brand potential | $10,000+ |
| PREMIUM | 65-79 | Strong candidates for brand partnerships | $2,500 - $10,000 |
| STANDARD | 50-64 | Solid athletes building their brand | $500 - $2,500 |
| DEVELOPING | 0-49 | Emerging athletes with growth potential | $100 - $500 |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   AI Service    │────▶│  Claude API     │
│   (React)       │     │   (FastAPI)     │     │  (Anthropic)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Main API       │
                        │  (Spring Boot)  │
                        └─────────────────┘
```

**Flow:**
1. Frontend calls AI Service with just IDs
2. AI Service fetches full data from Spring Boot API
3. AI Service formats data and sends to Claude
4. Claude analyzes and returns scores/matches
5. AI Service normalizes response and returns to frontend

---

## Error Handling

All endpoints include:
- Input validation with clear error messages
- 404 errors when athlete/brand not found
- 500 errors with details for configuration issues
- Automatic fallback for batch operations

### Common Errors

**"Configuration error: ANTHROPIC_API_KEY environment variable is required"**
- Ensure `.env` file exists with `ANTHROPIC_API_KEY` set
- Restart the service after adding the key

**"Athlete not found" / "Brand not found"**
- Verify the UUID is correct
- Ensure the main API is running at the configured URL

**Slow Responses**
- Claude API calls typically take 2-5 seconds
- Batch endpoints may take longer for many athletes
- Consider implementing caching for frequently accessed profiles

---

## Tips for Best Results

1. **Complete Profiles**: AI performs better with complete athlete and brand profiles
2. **Social Metrics**: Include follower counts, engagement rates, and platform information
3. **Campaign Details**: Specify campaign requirements for more accurate matching
4. **Batch Operations**: Use batch endpoints when scoring multiple athletes
5. **Rate Limits**: Be aware of Claude API rate limits for production use

---

## Development

### Running Tests

```bash
cd backend/ai-service
pytest
```

### API Documentation

When the service is running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/api-docs
