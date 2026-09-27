import React, { useState } from 'react';
import { Student, OfficeType, QueuePrediction, SecurityUser } from '../types';
import { AASTU_OFFICES, DEMO_SECURITY_USERS } from '../data';
import { getClearanceProgress, arePrerequisitesMet } from '../utils';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Clock, 
  QrCode, 
  Sparkles, 
  Building2,
  FileCheck2,
  Calendar,
  ExternalLink,
  ChevronRight,
  UploadCloud,
  FileText,
  X,
  Check,
  UserCheck,
  Award,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  queuePredictions: QueuePrediction[];
  onOpenCertificateModal: () => void;
  onSelectOfficeTab: (office: OfficeType) => void;
  onOpenAuthModal?: (mode: 'LOGIN' | 'REGISTER') => void;
  onResolveHold?: (studentId: string, office: OfficeType, obligationId: string) => void;
  onApproveStudent?: (studentId: string, office: OfficeType, note: string) => void;
  onQuickSwitchPage?: (page: string) => void;
  onQuickSwitchUser?: (user: SecurityUser) => void;
}

const STATION_CHECKLISTS: Record<OfficeType, { items: string[]; officer: string; officerRole: string; room: string; badge: string }> = {
  DEPARTMENT: {
    items: [
      'Submit 1 hardcover copy of Senior Capstone Thesis to Department Archive',
      'Deliver final code repository and CD archive with advisor approval',
      'Clear departmental laboratory locker and return hardware equipment',
      'Obtain Department Head formal signoff & endorsement',
    ],
    officer: 'Dr. Mulu G.',
    officerRole: 'Head of Software Engineering',
    room: 'Block 45, 3rd Floor, Room 302',
    badge: 'DEP-SE-01',
  },
  LIBRARY: {
    items: [
      'Verify zero active catalog loans (all textbooks returned)',
      'Reconcile overdue circulation fines (current balance: 0.00 ETB)',
      'Deposit digital copy of senior thesis to AASTU Institutional Repository',
      'Surrender physical student library card',
    ],
    officer: 'Ato Tadesse K.',
    officerRole: 'Circulation Desk Supervisor',
    room: 'Central Library Block A, Ground Floor Desk 2',
    badge: 'LIB-01',
  },
  DORMITORY: {
    items: [
      'Hand over room key (Block 52, Room 204) to Chief Proctor',
      'Pass physical inspection of mattress, bed frame, and study desk',
      'Verify zero dormitory property damages or outstanding maintenance fees',
      'Sign Proctor Residential Exit Ledger',
    ],
    officer: 'W/ro Tigist B.',
    officerRole: 'Chief Student Proctor',
    room: 'Block 52 Proctor Office',
    badge: 'DORM-01',
  },
  CAFETERIA: {
    items: [
      'Surrender physical student dining coupon booklet',
      'Deactivate biometric dining turnstile barcode',
      'Clear dining hall cutlery and tray accountability ledger',
    ],
    officer: 'Ato Worku N.',
    officerRole: 'Cafeteria Operations Lead',
    room: 'Central Cafeteria Window 3',
    badge: 'CAF-01',
  },
  DISCIPLINE: {
    items: [
      'Verify zero active campus disciplinary hearings or infractions',
      'Clearance from Student Code of Conduct Directorate',
      'Student Affairs Dean final endorsement',
    ],
    officer: 'Ato Mengistu T.',
    officerRole: 'Dean of Student Affairs',
    room: 'Admin Building Room 204',
    badge: 'DISC-01',
  },
  COST_SHARING: {
    items: [
      'Present Ministry of Education Cost-Sharing beneficiary voucher',
      'Verify student beneficiary tax identification & CBE payment receipt',
      'Sign Form-CS/2026 legally binding cost sharing repayment contract',
      'Finance Directorate official audit stamp',
    ],
    officer: 'W/ro Roman A.',
    officerRole: 'Senior Financial Auditor',
    room: 'Administration Building, Cashier Wing Room 108',
    badge: 'FIN-01',
  },
  REGISTRAR: {
    items: [
      'All 6 departmental clearances signed and cryptographically verified',
      'Verify degree completion and academic eligibility threshold',
      'Graduation gown issuance pass authorization',
      'Official tamper-proof Digital Clearance Slip & QR Pass generation',
    ],
    officer: 'Dr. Kebede B.',
    officerRole: 'University Registrar',
    room: 'Registrar Main Building, Central Gate',
    badge: 'REG-01',
  },
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  queuePredictions,
  onOpenCertificateModal,
  onSelectOfficeTab,
  onOpenAuthModal,
  onResolveHold,
  onApproveStudent,
  onQuickSwitchPage,
  onQuickSwitchUser,
}) => {
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState<string>('ALL');
  const [isProofModalOpen, setIsProofModalOpen] = useState<boolean>(false);
  const [inspectingOffice, setInspectingOffice] = useState<OfficeType | null>(null);
  const [proofFileUploaded, setProofFileUploaded] = useState<boolean>(false);
  const [submittingProof, setSubmittingProof] = useState<boolean>(false);
  const [stationProofNote, setStationProofNote] = useState<string>('');

  const progress = getClearanceProgress(student);
  const prereqsReady = arePrerequisitesMet(student);

  // Department obligation if any
  const deptClearance = student.clearances.DEPARTMENT;
  const deptObligation = deptClearance?.obligations?.[0];
  const hasDeptHold = deptClearance?.status === 'HOLD';

  // Finance obligation if any
  const finClearance = student.clearances.COST_SHARING;
  const finObligation = finClearance?.obligations?.[0];

  // Circle stroke calculations for 67% or dynamic progress
  const percentage = progress.percentage;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Handle student submitting proof for Department hold
  const handleConfirmSubmitProof = () => {
    setSubmittingProof(true);
    setTimeout(() => {
      setSubmittingProof(false);
      setIsProofModalOpen(false);
      if (onResolveHold && deptObligation) {
        onResolveHold(student.id, 'DEPARTMENT', deptObligation.id);
      }
      if (onApproveStudent) {
        onApproveStudent(
          student.id, 
          'DEPARTMENT', 
          'Senior Project hardcover copy & CD received and archived at SE Department office. Clearance approved by Dr. Mulu G.'
        );
      }
    }, 700);
  };

  // Submit proof for any inspecting office
  const handleStationSubmitProof = (office: OfficeType) => {
    setSubmittingProof(true);
    setTimeout(() => {
      setSubmittingProof(false);
      setInspectingOffice(null);
      setProofFileUploaded(false);
      const note = stationProofNote.trim();
      setStationProofNote('');
      const officeHold = student.clearances[office]?.obligations?.[0];
      if (onResolveHold && officeHold) {
        onResolveHold(student.id, office, officeHold.id);
      }
      if (onApproveStudent) {
        const info = STATION_CHECKLISTS[office] || { officer: 'Department Officer', officerRole: 'Authorized Staff', room: 'AASTU Office' };
        onApproveStudent(
          student.id,
          office,
          note 
            ? `Verification submitted ("${note}"). Approved by ${info.officer} (${info.officerRole}).`
            : `Requirements verified & approved by ${info.officer} (${info.officerRole}).`
        );
      }
    }, 700);
  };

  // Fast approve a specific station
  const handleFastApproveStation = (office: OfficeType) => {
    const officeHold = student.clearances[office]?.obligations?.[0];
    if (onResolveHold && officeHold) {
      onResolveHold(student.id, office, officeHold.id);
    }
    if (onApproveStudent) {
      const info = STATION_CHECKLISTS[office] || { officer: 'Department Officer', officerRole: 'Authorized Staff', room: 'AASTU Office' };
      onApproveStudent(
        student.id,
        office,
        `Station verified and fast-approved by ${info.officer} (${info.room}). Requirements cleared.`
      );
    }
  };

  // Quick action: Dr. Mulu clears SE Department
  const handleQuickApproveDept = () => {
    if (onApproveStudent) {
      onApproveStudent(
        student.id,
        'DEPARTMENT',
        'Senior Project hardcover copy & CD verified in person by Dr. Mulu G. Clearance approved.'
      );
    }
  };

  // Quick action: Clear Finance too to reach 100%
  const handleQuickApproveFinance = () => {
    if (onApproveStudent) {
      onApproveStudent(
        student.id,
        'COST_SHARING',
        'Cost-Sharing contract verification complete. Form-CS/2026 stamped. Approved by W/ro Roman.'
      );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 🚀 STARK Hackathon Quick Role Switcher Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-sm border border-blue-800/40 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-xs uppercase tracking-wider text-blue-200">
            STARK Hackathon Sprint 3 Live
          </span>
          <span className="hidden sm:inline text-xs text-blue-300">• Interactive Multi-Station Testing:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onQuickSwitchPage && onQuickSwitchPage('STUDENT_TRACKER')}
            className="px-3 py-1 rounded-xl bg-blue-500/30 hover:bg-blue-500/50 border border-blue-400/40 text-xs font-semibold text-white transition flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
            <span>Student (Selam - {percentage}%)</span>
          </button>
          <button
            onClick={() => {
              const mulu = DEMO_SECURITY_USERS.find(u => u.badgeId === 'DEP-SE-01');
              if (mulu && onQuickSwitchUser) onQuickSwitchUser(mulu);
              if (onQuickSwitchPage) onQuickSwitchPage('OFFICE_PORTAL');
            }}
            className="px-3 py-1 rounded-xl bg-indigo-600/50 hover:bg-indigo-600/70 border border-indigo-400/40 text-xs font-semibold text-white transition flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-300" />
            <span>Staff Workstation (All Desks)</span>
          </button>
          <button
            onClick={() => onQuickSwitchPage && onQuickSwitchPage('DOCUMENTS')}
            className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Clearance Slip & PDF</span>
          </button>
        </div>
      </div>

      {/* 🌟 Figma Aligned Hero Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Greeting & Student Details */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                {student.fullName.split(' ')[0][0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-stone-900 flex items-center justify-center">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
                  Hello, {student.fullName.split(' ')[0]} 👋
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active Clearance
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">
                  {student.id}
                </span>
                <span>•</span>
                <span>Year {student.year} {student.department}</span>
                <span>•</span>
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  Class of 2026
                </span>
              </div>
            </div>
          </div>

          {/* Progress Ring & Stats */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-start lg:self-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-stone-100 dark:border-stone-800">
            {/* SVG Circular Progress Ring */}
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r={radius}
                    className="text-stone-200 dark:text-stone-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r={radius}
                    className="text-blue-600 dark:text-blue-500 transition-all duration-700 ease-out"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold text-stone-900 dark:text-white leading-none">
                    {percentage}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold mt-0.5">
                    Cleared
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-white">
                  {progress.approvedCount} of {progress.totalCount} Stations
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  {progress.holdsCount > 0 ? `${progress.holdsCount} station hold pending` : 'All stations authorized!'}
                </div>
                {progress.isFullyCleared && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <Sparkles className="w-3 h-3" /> Ready for Certificate
                  </span>
                )}
              </div>
            </div>

            {/* Expected Completion Date Card */}
            <div className="bg-stone-50 dark:bg-stone-800/80 px-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700/80">
              <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold">Graduation Target</span>
              </div>
              <div className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">
                October 08, 2026
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">
                12 Days Remaining
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⚠️ Next Required Action Prominent Banner */}
      {hasDeptHold && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-800/80 rounded-3xl p-5 sm:p-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Next Required Action
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 rounded-full">
                    Department Head Approval
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white mt-1">
                  Final Senior Project Hardcover Copy Submission
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                  Dr. Mulu G. requires 1 hardcover copy and CD archive of your project (&ldquo;ClearanceFlow: Automated Clearance Management&rdquo;) at Room 302.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => setInspectingOffice('DEPARTMENT')}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Submit Project Proof</span>
              </button>
              <button
                onClick={handleQuickApproveDept}
                title="Simulate Dr. Mulu approving this directly"
                className="px-3 py-2.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-amber-100 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-semibold transition"
              >
                ⚡ Fast-Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Clearance Stations Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <span>Department Clearance Stations</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-medium">
                {progress.totalCount} Stations
              </span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              All 6 departments must issue digital signatures before the Registrar unlocks the clearance certificate.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs self-start sm:self-auto">
            {['ALL', 'PENDING', 'CLEARED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedOfficeFilter(filter)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  selectedOfficeFilter === filter
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {filter === 'ALL' ? 'All (7)' : filter === 'PENDING' ? `Pending (${progress.holdsCount})` : `Cleared (${progress.approvedCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AASTU_OFFICES.filter((officeConfig) => {
            const officeState = student.clearances[officeConfig.type];
            if (!officeState) return false;
            if (selectedOfficeFilter === 'CLEARED') return officeState.status === 'APPROVED';
            if (selectedOfficeFilter === 'PENDING') return officeState.status !== 'APPROVED';
            return true;
          }).map((officeConfig) => {
            const officeState = student.clearances[officeConfig.type];
            const isApproved = officeState.status === 'APPROVED';
            const isHold = officeState.status === 'HOLD';
            const isLocked = officeState.status === 'LOCKED';
            const isPending = officeState.status === 'PENDING';

            return (
              <div
                key={officeConfig.type}
                className={`p-5 rounded-2xl border transition-all ${
                  isApproved
                    ? 'bg-white dark:bg-stone-900 border-emerald-200 dark:border-emerald-950/60 shadow-xs'
                    : isHold
                    ? 'bg-white dark:bg-stone-900 border-amber-200 dark:border-amber-950/60 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 opacity-90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isApproved 
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                        : isHold
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                        {officeConfig.name}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {officeConfig.location}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cleared</span>
                      </span>
                    )}
                    {isHold && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Action Required</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>In Review</span>
                      </span>
                    )}
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Remarks & Officer notes */}
                <div className="mt-3.5 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                  {officeState.officerNotes ? (
                    <p className="text-stone-600 dark:text-stone-300">
                      <span className="font-semibold text-stone-700 dark:text-stone-200">Remarks: </span>
                      {officeState.officerNotes}
                    </p>
                  ) : (
                    <p className="text-stone-400 italic">No outstanding requirements recorded.</p>
                  )}

                  {officeState.officerName && (
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified by {officeState.officerName} ({officeState.officerBadgeId})</span>
                    </p>
                  )}
                </div>

                {/* Direct Action Buttons per Station */}
                <div className="mt-3.5 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                  <button
                    onClick={() => setInspectingOffice(officeConfig.type)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-stone-500" />
                    <span>View Requirements</span>
                  </button>
                  {isHold && (
                    <button
                      onClick={() => setInspectingOffice(officeConfig.type)}
                      className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition flex items-center gap-1 shrink-0"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Submit Proof</span>
                    </button>
                  )}
                  {!isApproved && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFastApproveStation(officeConfig.type);
                      }}
                      title="Simulate station signoff"
                      className="py-1.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold text-xs transition shrink-0"
                    >
                      ⚡ Clear
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registrar Gate & Certificate Card */}
      <div className={`p-6 rounded-3xl border transition-all ${
        progress.isFullyCleared
          ? 'bg-gradient-to-r from-emerald-900 to-teal-950 text-white border-emerald-600 shadow-md'
          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
              progress.isFullyCleared ? 'bg-emerald-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
            }`}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${progress.isFullyCleared ? 'text-white' : 'text-stone-900 dark:text-white'}`}>
                {progress.isFullyCleared 
                  ? '🎉 Official Clearance Completed & Authorized!' 
                  : 'Stage 3: Registrar Final Gate & Digital Certificate'}
              </h3>
              <p className={`text-xs mt-0.5 ${progress.isFullyCleared ? 'text-emerald-100' : 'text-stone-500 dark:text-stone-400'}`}>
                {progress.isFullyCleared
                  ? 'Your digital clearance certificate with official cryptographic QR seal has been authorized by the University Registrar.'
                  : 'Registrar gate requires 100% sign-off from all 6 stations before issuing your Graduation Clearance Pass.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {progress.isFullyCleared ? (
              <button
                onClick={onOpenCertificateModal}
                className="px-5 py-3 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition shadow flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>View Clearance Pass & QR</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleQuickApproveDept();
                    handleQuickApproveFinance();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate 100% Clearance</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🏛️ Universal Station Verification & Proof Drawer / Modal */}
      {(inspectingOffice || isProofModalOpen) && (() => {
        const targetOffice = inspectingOffice || 'DEPARTMENT';
        const officeConfig = AASTU_OFFICES.find(o => o.type === targetOffice);
        const checklist = STATION_CHECKLISTS[targetOffice] || STATION_CHECKLISTS.DEPARTMENT;
        const officeState = student.clearances[targetOffice];
        const isApproved = officeState?.status === 'APPROVED';
        const isHold = officeState?.status === 'HOLD';
        const obligations = officeState?.obligations || [];

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b pb-4 dark:border-stone-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      AASTU Station Verification
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isHold
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}>
                      {isApproved ? 'Cleared' : isHold ? 'Action Required' : 'In Review'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-stone-900 dark:text-white">
                    {officeConfig?.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {checklist.room} • {checklist.officer} ({checklist.officerRole})
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setInspectingOffice(null);
                    setIsProofModalOpen(false);
                  }}
                  className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Station Clearance Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                  Mandatory Station Requirements:
                </span>
                <div className="space-y-1.5 bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700/60">
                  {checklist.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 dark:text-stone-300">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isApproved ? 'bg-emerald-500 text-white' : 'bg-stone-300 dark:bg-stone-700 text-stone-600'
                      }`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className={isApproved ? 'line-through text-stone-400 dark:text-stone-500' : ''}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outstanding Obligations if any */}
              {obligations.length > 0 && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs space-y-1.5">
                  <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Recorded Obligation / Issue</span>
                  </span>
                  {obligations.map(ob => (
                    <div key={ob.id}>
                      <strong className="text-stone-900 dark:text-white">{ob.title}</strong>
                      <p className="text-stone-600 dark:text-stone-400 mt-0.5">{ob.detail}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Status / Officer Verification Info */}
              {isApproved ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs space-y-1 text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Station Digitally Authorized</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                    Authorized by {officeState?.officerName || checklist.officer} (Badge #{officeState?.officerBadgeId || checklist.badge}).
                  </p>
                  {officeState?.clearedAt && (
                    <p className="text-[10px] text-emerald-700 font-mono">
                      Timestamp: {new Date(officeState.clearedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                /* Verification Submission Form */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Submission Notes / Receipt or Voucher Ref (Optional)
                    </label>
                    <input
                      type="text"
                      value={stationProofNote}
                      onChange={(e) => setStationProofNote(e.target.value)}
                      placeholder="e.g. Returned to Room 302 Desk; receiving slip #90214 attached"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-800"
                    />
                  </div>

                  {/* Upload Dropzone */}
                  <div 
                    onClick={() => setProofFileUploaded(true)}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                      proofFileUploaded 
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                        : 'border-stone-300 dark:border-stone-700 hover:border-blue-500'
                    }`}
                  >
                    <UploadCloud className={`w-7 h-7 mx-auto mb-1.5 ${
                      proofFileUploaded ? 'text-emerald-600' : 'text-stone-400'
                    }`} />
                    {proofFileUploaded ? (
                      <div>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 text-xs block">
                          AASTU_Verification_Document.pdf (1.2 MB)
                        </span>
                        <span className="text-[10px] text-emerald-600">Attached successfully • Tap to replace</span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-stone-700 dark:text-stone-200 text-xs block">
                          Tap to attach receiving slip, thesis receipt, or book card image/PDF
                        </span>
                        <span className="text-[10px] text-stone-400">PDF, JPG, PNG up to 5MB</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t dark:border-stone-800">
                <button
                  onClick={() => {
                    setInspectingOffice(null);
                    setIsProofModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {!isApproved && (
                    <>
                      <button
                        onClick={() => handleFastApproveStation(targetOffice)}
                        title="Simulate station officer approving immediately"
                        className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-semibold transition"
                      >
                        ⚡ Fast-Approve
                      </button>
                      <button
                        disabled={submittingProof}
                        onClick={() => handleStationSubmitProof(targetOffice)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                      >
                        {submittingProof ? (
                          <span>Verifying...</span>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Submit Proof & Clear</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};