/**
 * API Service for connecting to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const AI_SERVICE_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000/api/v1';

// Helper to get auth headers with Clerk token
// Note: This should be called from a component that has access to Clerk hooks
// For now, we'll accept token as parameter or use window.Clerk if available
async function getAuthHeaders(token?: string): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Use provided token or try to get from Clerk
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    try {
      // @ts-ignore - Clerk may not be available in all contexts
      if (window.Clerk && window.Clerk.session) {
        const clerkToken = await window.Clerk.session.getToken();
        if (clerkToken) {
          headers['Authorization'] = `Bearer ${clerkToken}`;
        }
      }
    } catch (error) {
      // Clerk not available or not signed in
      console.debug('Clerk token not available:', error);
    }
  }
  
  return headers;
}

// Types
export interface AthleteIntakeRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  location: string;
  school: string;
  sport: string;
  position: string;
  primarySocial: {
    platform: string;
    handle: string;
  };
  additionalSocials: Array<{
    platform: string;
    handle: string;
  }>;
  bio: string;
  goals: string;
}

export interface BrandIntakeRequest {
  company: string;
  contactFirstName: string;
  contactLastName: string;
  contactTitle: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  companySize: string;
  budget: string;
  description: string;
  targetAudience: string;
  goals: string;
  timeline: string;
  athletePreferences: string;
}

export interface IntakeResponse {
  id: string;
  status: string;
  message: string;
  submittedAt: string;
}

// API Functions

/**
 * Submit athlete intake form
 */
export async function submitAthleteIntake(data: AthleteIntakeRequest): Promise<IntakeResponse> {
  const response = await fetch(`${API_BASE_URL}/intake/athlete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit application');
  }

  return response.json();
}

/**
 * Submit brand intake form
 */
export async function submitBrandIntake(data: BrandIntakeRequest): Promise<IntakeResponse> {
  const response = await fetch(`${API_BASE_URL}/intake/brand`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit application');
  }

  return response.json();
}

/**
 * Check if athlete email already exists
 */
export async function checkAthleteEmail(email: string): Promise<{ exists: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/intake/athlete/check?email=${encodeURIComponent(email)}`);
  return response.json();
}

/**
 * Check if brand email already exists
 */
export async function checkBrandEmail(email: string): Promise<{ exists: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/intake/brand/check?email=${encodeURIComponent(email)}`);
  return response.json();
}

/**
 * Get intake statistics (for admin)
 */
export async function getIntakeStats(): Promise<{
  athletes: { pending: number; approved: number; rejected: number; total: number };
  brands: { pending: number; approved: number; rejected: number; total: number };
}> {
  const response = await fetch(`${API_BASE_URL}/intake/stats`);
  return response.json();
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

// Admin API Functions

export interface AthleteIntakeRequestEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  location: string;
  school: string;
  sport: string;
  position: string;
  primarySocialPlatform: string;
  primarySocialHandle: string;
  additionalSocials: string;
  bio: string;
  goals: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandIntakeRequestEntity {
  id: string;
  company: string;
  contactFirstName: string;
  contactLastName: string;
  contactTitle: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  companySize: string;
  budget: string;
  description: string;
  targetAudience: string;
  goals: string;
  timeline: string;
  athletePreferences: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UserResponse {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  roles: string[]; // ['ATHLETE', 'BRAND', 'ADMIN']
  hasAthleteProfile: boolean;
  hasBrandProfile: boolean;
}

/**
 * Get athlete intake requests (admin)
 */
export async function getAthleteIntakeRequests(status?: string): Promise<PageResponse<AthleteIntakeRequestEntity>> {
  const url = status 
    ? `${API_BASE_URL}/admin/intake/athletes?status=${status}`
    : `${API_BASE_URL}/admin/intake/athletes`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch athlete requests');
  }
  return response.json();
}

/**
 * Get brand intake requests (admin)
 */
export async function getBrandIntakeRequests(status?: string): Promise<PageResponse<BrandIntakeRequestEntity>> {
  const url = status 
    ? `${API_BASE_URL}/admin/intake/brands?status=${status}`
    : `${API_BASE_URL}/admin/intake/brands`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch brand requests');
  }
  return response.json();
}

/**
 * Update athlete request status (admin)
 */
export async function updateAthleteRequestStatus(id: string, status: string, adminNotes?: string): Promise<AthleteIntakeRequestEntity> {
  const response = await fetch(`${API_BASE_URL}/admin/intake/athletes/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, adminNotes }),
  });
  if (!response.ok) {
    throw new Error('Failed to update athlete request');
  }
  return response.json();
}

/**
 * Update brand request status (admin)
 */
export async function updateBrandRequestStatus(id: string, status: string, adminNotes?: string): Promise<BrandIntakeRequestEntity> {
  const response = await fetch(`${API_BASE_URL}/admin/intake/brands/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, adminNotes }),
  });
  if (!response.ok) {
    throw new Error('Failed to update brand request');
  }
  return response.json();
}

/**
 * Get current authenticated user information
 * @param token Optional Clerk token. If not provided, will try to get from window.Clerk
 */
export async function getUserMe(token?: string): Promise<UserResponse> {
  const headers = await getAuthHeaders(token);
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    throw new Error('Failed to fetch user information');
  }
  
  return response.json();
}

/**
 * Athlete Profile Types
 */
export interface AthleteProfileResponse {
  id: string;
  userId: string;
  clerkId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  fullName?: string;
  sport?: string;
  position?: string;
  schoolName?: string;
  conference?: string;
  bio?: string;
  hometown?: string;
  homeState?: string;
  dateOfBirth?: string;
  gender?: string;
  teamRanking?: number;
  statsSummary?: string;
  awards?: string;
  achievements?: string;
  isActive?: boolean;
  isAcceptingDeals?: boolean;
  completenessScore?: number;
  profileCompletenessScore?: number; // Support both field names
  socialAccounts?: Array<{
    id: string;
    platform: string;
    handle: string;
    profileUrl?: string;
    followers?: number;
  }>;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

/**
 * Get all athlete profiles (for admin)
 * @param token Optional Clerk token for authenticated requests
 */
export async function getAllAthleteProfiles(page?: number, size?: number, token?: string): Promise<PageResponse<AthleteProfileResponse>> {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page.toString());
  if (size !== undefined) params.append('size', size.toString());
  
  const url = `${API_BASE_URL}/athletes${params.toString() ? '?' + params.toString() : ''}`;
  const headers = await getAuthHeaders(token);
  
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to fetch athlete profiles:', response.status, errorText);
    throw new Error(`Failed to fetch athlete profiles: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

/**
 * Delete athlete profile
 * @param profileId The ID of the athlete profile to delete
 * @param token Optional Clerk token for authenticated requests
 */
export async function deleteAthleteProfile(profileId: string, token?: string): Promise<void> {
  const headers = await getAuthHeaders(token);
  
  const response = await fetch(`${API_BASE_URL}/athletes/${profileId}`, {
    method: 'DELETE',
    headers,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to delete athlete profile:', response.status, errorText);
    throw new Error(`Failed to delete athlete profile: ${response.status} ${errorText}`);
  }
}

/**
 * Get current user's athlete profile
 * @param token Optional Clerk token for authenticated requests
 */
export async function getMyAthleteProfile(token?: string): Promise<AthleteProfileResponse> {
  const headers = await getAuthHeaders(token);
  const response = await fetch(`${API_BASE_URL}/athletes/me`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Athlete profile not found');
    }
    const error = await response.json().catch(() => ({ message: 'Failed to fetch athlete profile' }));
    throw new Error(error.message || 'Failed to fetch athlete profile');
  }
  
  return response.json();
}

/**
 * Update athlete profile
 */
export interface AthleteProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  sport?: string;
  position?: string;
  schoolName?: string;
  conference?: string;
  classYear?: string;
  jerseyNumber?: string;
  height?: string;
  weight?: string;
  city?: string;
  state?: string;
  hometown?: string;
  bio?: string;
  headshotUrl?: string;
  teamRanking?: number;
  statsSummary?: string;
  awards?: string;
  achievements?: string;
  requestedRate?: number;
  socialAccounts?: Array<{
    platform: string;
    handle: string;
    profileUrl?: string;
    followers?: number;
  }>;
}

export async function updateAthleteProfile(
  profileId: string,
  data: AthleteProfileUpdateRequest,
  token?: string
): Promise<AthleteProfileResponse> {
  const headers = await getAuthHeaders(token);
  
  // Transform social accounts to match backend format
  const requestData: any = { ...data };
  if (data.socialAccounts) {
    requestData.socialAccounts = data.socialAccounts.map(acc => ({
      platform: acc.platform, // Backend will parse this using SocialPlatform.fromString()
      handle: acc.handle,
      profileUrl: acc.profileUrl,
      followerCount: acc.followers || 0, // Backend expects followerCount, not followers
    }));
  }
  
  console.log("Sending update request:", requestData);
  const response = await fetch(`${API_BASE_URL}/athletes/${profileId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(requestData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Update failed:", response.status, errorText);
    let errorMessage = 'Failed to update athlete profile';
    try {
      const error = JSON.parse(errorText);
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

// ============= Brand Profile Types & Functions =============

export interface BrandProfileResponse {
  id: string;
  userId: string;
  clerkId?: string;
  companyName?: string;
  industry?: string;
  brandCategory?: string;
  companySize?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  fullName?: string;
  targetAudience?: string;
  marketingGoals?: string;
  budgetRange?: string;
  preferredTimeline?: string;
  athletePreferences?: string;
  contentTypesInterested?: string;
  campaignExamples?: string;
  minimumBudget?: number;
  maximumBudget?: number;
  preferredDealTypes?: string;
  exclusivityRequirements?: string;
  isAcceptingApplications?: boolean;
  preferredSports?: string; // JSON array
  preferredConferences?: string; // JSON array
  minFollowers?: string;
  maxFollowers?: string;
  interestAlignment?: string; // JSON array
  contentPreferences?: string; // JSON array
  budgetPerAthlete?: string;
  dealDuration?: string;
  matchingNotes?: string;
  profileCompletenessScore?: number;
  completenessScore?: number; // Alias for profileCompletenessScore
  isActive?: boolean;
  isVerified?: boolean;
  status?: string;
  socialAccounts?: Array<{
    id: string;
    platform: string;
    handle: string;
    profileUrl?: string;
    followers?: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandProfileUpdateRequest {
  companyName?: string;
  industry?: string;
  brandCategory?: string;
  companySize?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  targetAudience?: string;
  marketingGoals?: string;
  budgetRange?: string;
  preferredTimeline?: string;
  athletePreferences?: string;
  contentTypesInterested?: string;
  campaignExamples?: string;
  minimumBudget?: number;
  maximumBudget?: number;
  preferredDealTypes?: string;
  exclusivityRequirements?: string;
  isAcceptingApplications?: boolean;
  preferredSports?: string; // JSON array
  preferredConferences?: string; // JSON array
  minFollowers?: string;
  maxFollowers?: string;
  interestAlignment?: string; // JSON array
  contentPreferences?: string; // JSON array
  budgetPerAthlete?: string;
  dealDuration?: string;
  matchingNotes?: string;
  socialAccounts?: Array<{
    platform: string;
    handle: string;
    profileUrl?: string;
    followers?: number;
  }>;
}

/**
 * Get all brand profiles (admin)
 */
export async function getAllBrandProfiles(page?: number, size?: number, token?: string): Promise<PageResponse<BrandProfileResponse>> {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page.toString());
  if (size !== undefined) params.append('size', size.toString());
  
  const url = `${API_BASE_URL}/brands${params.toString() ? '?' + params.toString() : ''}`;
  const headers = await getAuthHeaders(token);
  
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to fetch brand profiles:', response.status, errorText);
    throw new Error(`Failed to fetch brand profiles: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

/**
 * Get brand profile by ID
 */
export async function getBrandProfileById(brandId: string, token?: string): Promise<BrandProfileResponse> {
  const headers = await getAuthHeaders(token);
  const response = await fetch(`${API_BASE_URL}/brands/${brandId}`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Brand profile not found');
    }
    const error = await response.json().catch(() => ({ message: 'Failed to fetch brand profile' }));
    throw new Error(error.message || 'Failed to fetch brand profile');
  }
  
  return response.json();
}

/**
 * Get current user's brand profile
 */
export async function getMyBrandProfile(token?: string): Promise<BrandProfileResponse> {
  const headers = await getAuthHeaders(token);
  const response = await fetch(`${API_BASE_URL}/brands/me`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Brand profile not found');
    }
    const error = await response.json().catch(() => ({ message: 'Failed to fetch brand profile' }));
    throw new Error(error.message || 'Failed to fetch brand profile');
  }
  
  return response.json();
}

/**
 * Update brand profile
 */
export async function updateBrandProfile(
  profileId: string,
  data: BrandProfileUpdateRequest,
  token?: string
): Promise<BrandProfileResponse> {
  const headers = await getAuthHeaders(token);
  
  // Transform social accounts to match backend format
  const requestData: any = { ...data };
  if (data.socialAccounts) {
    requestData.socialAccounts = data.socialAccounts.map(acc => ({
      platform: acc.platform, // Backend will parse this using SocialPlatform.fromString()
      handle: acc.handle,
      profileUrl: acc.profileUrl,
      followerCount: acc.followers || 0, // Backend expects followerCount, not followers
    }));
  }
  
  console.log("Sending brand profile update request:", requestData);
  const response = await fetch(`${API_BASE_URL}/brands/${profileId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(requestData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brand profile update failed:", response.status, errorText);
    let errorMessage = 'Failed to update brand profile';
    try {
      const error = JSON.parse(errorText);
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

/**
 * Delete brand profile
 * @param profileId The ID of the brand profile to delete
 * @param token Optional Clerk token for authenticated requests
 */
export async function deleteBrandProfile(profileId: string, token?: string): Promise<void> {
  const headers = await getAuthHeaders(token);
  
  const response = await fetch(`${API_BASE_URL}/brands/${profileId}`, {
    method: 'DELETE',
    headers,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to delete brand profile:', response.status, errorText);
    throw new Error(`Failed to delete brand profile: ${response.status} ${errorText}`);
  }
}

// ============= AI Service Types & Functions =============

export interface SimpleMatchRequest {
  brand_id: string;
  athlete_ids?: string[];
  campaign_requirements?: {
    sport_preferences?: string[];
    conference_preferences?: string[];
    min_followers?: number;
    min_engagement_rate?: number;
    content_types?: string[];
    budget_per_athlete?: number;
  };
  max_results?: number;
  use_hybrid?: boolean;
}

export interface AthleteMatchResult {
  athlete_id: string;
  athlete_name?: string;
  sport?: string;
  school?: string;
  match_score: number;
  match_reasons: string[];
  concerns?: string[];
  estimated_reach?: number;
  suggested_rate?: number;
  component_scores?: {
    rule_based?: number;
    ai_analysis?: number;
    [key: string]: number | undefined;
  };
}

export interface HybridMatchResponse {
  brand_id: string;
  brand_name?: string;
  total_candidates: number;
  passed_filters: number;
  ai_analyzed: number;
  total_matches: number;
  matches: AthleteMatchResult[];
  filter_stats?: Record<string, any>;
  generated_at: string;
}

export interface MatchResponse {
  brand_id: string;
  brand_name?: string;
  total_candidates: number;
  total_matches: number;
  matches: AthleteMatchResult[];
  generated_at: string;
}

export interface BrandMatchResult {
  brand_id: string;
  company?: string;
  industry?: string;
  fit_score: number;
  match_reasons: string[];
  concerns?: string[];
}

export interface AthleteBrandMatchesResponse {
  athlete_id: string;
  athlete_name?: string;
  total_brands: number;
  matches: BrandMatchResult[];
  generated_at: string;
}

export interface AthleteScoreResponse {
  athlete_id: string;
  athlete_name?: string;
  overall_score: number;
  scores: {
    profile_quality?: number;
    social_influence?: number;
    market_value?: number;
    nil_readiness?: number;
    [key: string]: number | undefined;
  };
  tier: string;
  recommendations: string[];
  calculated_at: string;
}

/**
 * Find matching athletes for a brand using hybrid matching (recommended).
 * @param brandId Brand profile ID or brand intake ID
 * @param options Optional matching options
 * @param token Optional Clerk token for authenticated requests
 */
export async function findAthleteMatches(
  brandId: string,
  options?: {
    athleteIds?: string[];
    campaignRequirements?: SimpleMatchRequest['campaign_requirements'];
    maxResults?: number;
    useHybrid?: boolean;
  },
  token?: string
): Promise<HybridMatchResponse> {
  const headers = await getAuthHeaders(token);
  
  const request: SimpleMatchRequest = {
    brand_id: brandId,
    athlete_ids: options?.athleteIds,
    campaign_requirements: options?.campaignRequirements,
    max_results: options?.maxResults || 10,
    use_hybrid: options?.useHybrid !== false, // Default to true
  };
  
  const response = await fetch(`${AI_SERVICE_BASE_URL}/matching/find-hybrid`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to find athlete matches:', response.status, errorText);
    throw new Error(`Failed to find athlete matches: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

/**
 * Find matching brands for an athlete.
 * @param athleteId Athlete profile ID
 * @param limit Maximum number of results
 * @param token Optional Clerk token for authenticated requests
 */
export async function findBrandMatches(
  athleteId: string,
  limit: number = 10,
  token?: string
): Promise<AthleteBrandMatchesResponse> {
  const headers = await getAuthHeaders(token);
  
  const response = await fetch(`${AI_SERVICE_BASE_URL}/matching/athlete/${athleteId}/brands?limit=${limit}`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to find brand matches:', response.status, errorText);
    throw new Error(`Failed to find brand matches: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

/**
 * Score an athlete profile using AI.
 * @param athleteId Athlete profile ID
 * @param token Optional Clerk token for authenticated requests
 */
export async function scoreAthlete(
  athleteId: string,
  token?: string
): Promise<AthleteScoreResponse> {
  const headers = await getAuthHeaders(token);
  
  const response = await fetch(`${AI_SERVICE_BASE_URL}/scoring/athlete/${athleteId}`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to score athlete:', response.status, errorText);
    throw new Error(`Failed to score athlete: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

