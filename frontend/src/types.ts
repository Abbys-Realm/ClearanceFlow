export type OfficeType =
  | 'LIBRARY'
  | 'CAFETERIA'
  | 'DORMITORY'
  | 'DISCIPLINE'
  | 'DEPARTMENT'
  | 'COST_SHARING'
  | 'REGISTRAR';

export type ClearanceStatus = 'PENDING' | 'APPROVED' | 'HOLD' | 'LOCKED';

export type ClearanceSeason = 'NEW_YEAR_REGISTRATION' | 'END_OF_YEAR' | 'GRADUATION_EXIT' | 'GRADUATION_FINAL_CLEARANCE';

export interface ObligationItem {
  id: string;
  title: string;
  detail: string;
  penaltyFeeETB?: number;
  itemCode?: string;
  isResolved: boolean;
}

export interface DepartmentClearanceState {
  office: OfficeType;
  status: ClearanceStatus;
  obligations: ObligationItem[];
  clearedAt?: string;
  officerName?: string;
  officerBadgeId?: string;
  officerNotes?: string;
}

export interface Student {
  id: string; // e.g., "ETS 0842/13"
  fullName: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: number; // 1 to 5
  section: string;
  dormBlock?: string;
  roomNumber?: string;
  program: 'REGULAR' | 'EXTENSION';
  clearanceSeason: ClearanceSeason;
  academicYear: string;
  isEnrolled: boolean;
  clearances: Record<OfficeType, DepartmentClearanceState>;
}

export interface SecurityUser {
  id: string;
  name: string;
  badgeId: string;
  role: 'OFFICER' | 'ADMIN' | 'GATE_SECURITY' | 'STUDENT';
  office?: OfficeType;
  departmentScope?: string;
}

export interface QueuePrediction {
  office: OfficeType;
  currentWaitMinutes: number;
  crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  peakHours: string;
  bestTimeToVisit: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorBadge: string;
  action: 'APPROVED' | 'FLAGGED_HOLD' | 'RESOLVED_HOLD' | 'SCANNED_PASS' | 'INITIATED_SEASON';
  studentId: string;
  office: OfficeType;
  notes: string;
  tamperProofHash: string;
}

export interface PaymentTransaction {
  id: string;
  obligationId: string;
  studentId: string;
  office: OfficeType;
  amountETB: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  telebirrRef?: string;
  timestamp: string;
}