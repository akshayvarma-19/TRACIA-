import type { ApplicationRecord, ApiResponse } from '../types';
import { request } from './api';

export interface CreateApplicationInput {
  land_id: string;
  type: ApplicationRecord['type'];
  details: string;
  document_name?: string;
}

export const applicationService = {
  /**
   * Submit a new land application.
   */
  async submitApplication(input: CreateApplicationInput): Promise<ApiResponse<ApplicationRecord>> {
    return request<ApiResponse<ApplicationRecord>>('/citizen/applications', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  /**
   * Get applications for the logged-in citizen.
   */
  async getMyApplications(): Promise<ApiResponse<ApplicationRecord[]>> {
    return request<ApiResponse<ApplicationRecord[]>>('/citizen/applications');
  },

  /**
   * Get all applications for the officer queue with filters.
   */
  async getOfficerApplications(filters?: { status?: string; type?: string }): Promise<ApiResponse<ApplicationRecord[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return request<ApiResponse<ApplicationRecord[]>>(`/officer/applications${queryStr}`);
  },

  /**
   * Get a single application by ID (shared or role-based).
   */
  async getApplication(id: string): Promise<ApiResponse<ApplicationRecord>> {
    const sessionStr = localStorage.getItem('supabase_session');
    let role = 'citizen';
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        role = session.user?.user_metadata?.role || session.role || 'citizen';
      } catch (e) {}
    }
    const base = role === 'officer' ? '/officer/applications' : '/citizen/applications';
    return request<ApiResponse<ApplicationRecord>>(`${base}/${id}`);
  },

  /**
   * Adjudicate/process an application (Approve, Reject, Request Info).
   */
  async adjudicateApplication(
    id: string,
    action: 'approve' | 'request_info' | 'reject',
    remarks: string
  ): Promise<ApiResponse<ApplicationRecord>> {
    return request<ApiResponse<ApplicationRecord>>(`/officer/applications/${id}/adjudicate`, {
      method: 'POST',
      body: JSON.stringify({ action, remarks })
    });
  }
};
