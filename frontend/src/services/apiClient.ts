import { ClearanceRequest, ClearanceItem, ClearanceIssue } from '../types/clearanceFlow';

const API_BASE = '/api';

export const apiClient = {
  async getMyClearance(): Promise<{ request: ClearanceRequest | null }> {
    const res = await fetch(`${API_BASE}/clearance/my`);
    return res.json();
  },

  async submitClearanceRequest(): Promise<{ message: string; request: ClearanceRequest }> {
    const res = await fetch(`${API_BASE}/clearance/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async approveDepartmentItem(itemId: string, remarks?: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/department/clearances/${itemId}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remarks }),
    });
    return res.json();
  },

  async requestActionItem(itemId: string, issueDescription: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/department/clearances/${itemId}/action-required`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueDescription }),
    });
    return res.json();
  },

  async resolveIssue(issueId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/clearance/issues/${issueId}/resolve`, {
      method: 'PUT',
    });
    return res.json();
  }
};
