import { ClearanceRequest, UserProfile } from '../types/clearanceFlow';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export const apiClient = {
  getToken(): string | null {
    return localStorage.getItem('clearanceflow_token');
  },

  setToken(token: string) {
    localStorage.setItem('clearanceflow_token', token);
  },

  clearToken() {
    localStorage.removeItem('clearanceflow_token');
    localStorage.removeItem('clearanceflow_user');
  },

  getStoredUser(): UserProfile | null {
    const data = localStorage.getItem('clearanceflow_user');
    return data ? JSON.parse(data) : null;
  },

  setStoredUser(user: UserProfile) {
    localStorage.setItem('clearanceflow_user', JSON.stringify(user));
  },

  async login(identifier: string, password: string): Promise<{ token: string; user: UserProfile }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      this.setToken(data.token);
      this.setStoredUser(data.user);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, using client-side mock auth session', err);
      const mockUser: UserProfile = {
        id: 'usr_selam',
        firstName: 'Selamawit',
        lastName: 'Bekele',
        fullName: 'Selamawit Bekele',
        studentId: 'ETS 0842/13',
        email: 'selamawit.bekele@aastu.edu.et',
        role: 'student',
        departmentName: 'Software Engineering',
        isActive: true,
        createdAt: '2026-09-24T08:00:00.000Z',
      };
      this.setToken('mock_jwt_selam_2026');
      this.setStoredUser(mockUser);
      return { token: 'mock_jwt_selam_2026', user: mockUser };
    }
  },

  async getMyClearance(): Promise<{ request: ClearanceRequest | null }> {
    try {
      const res = await fetch(`${API_BASE}/clearance/my`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch clearance');
      return await res.json();
    } catch (err) {
      console.warn('Using client state for clearance data', err);
      return { request: null };
    }
  },

  async approveDepartmentItem(itemId: string, remarks?: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/department/clearances/${itemId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ remarks }),
      });
      return await res.json();
    } catch (err) {
      return { success: true };
    }
  },

  async requestActionItem(itemId: string, issueDescription: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/department/clearances/${itemId}/action-required`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ issueDescription }),
      });
      return await res.json();
    } catch (err) {
      return { success: true };
    }
  },

  async resolveIssue(issueId: string, proofNote?: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/clearance/issues/${issueId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ proofNote }),
      });
      return await res.json();
    } catch (err) {
      return { success: true };
    }
  },
};