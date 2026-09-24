export type UserRole = 'student' | 'department_staff' | 'registrar' | 'admin';

export type ClearanceRequestStatus = 
  | 'draft' 
  | 'submitted' 
  | 'in_progress' 
  | 'action_required' 
  | 'ready_for_registrar' 
  | 'completed' 
  | 'rejected' 
  | 'cancelled';

export type ClearanceItemStatus = 'pending' | 'approved' | 'action_required' | 'rejected';
export type IssueStatus = 'open' | 'resolved';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  isActive: boolean;
}

export interface ClearanceItem {
  id: string;
  clearanceRequestId: string;
  departmentId: string;
  departmentName: string;
  status: ClearanceItemStatus;
  remarks?: string;
  reviewedAt?: string;
  assignedStaffName?: string;
}

export interface ClearanceIssue {
  id: string;
  clearanceItemId: string;
  departmentName: string;
  description: string;
  status: IssueStatus;
  resolvedAt?: string;
  createdAt: string;
}

export interface ClearanceRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  departmentName: string;
  academicYear: string;
  status: ClearanceRequestStatus;
  submittedAt: string;
  completedAt?: string;
  items: ClearanceItem[];
  issues: ClearanceIssue[];
}
