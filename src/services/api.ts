/**
 * API Service for connecting to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

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

