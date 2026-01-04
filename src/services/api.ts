/**
 * API Service for connecting to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

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

