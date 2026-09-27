import React, { useState } from 'react';
import { Student, OfficeType, SecurityUser } from '../types';
import { AASTU_OFFICES } from '../data';
import { arePrerequisitesMet } from '../utils';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Lock, 
  Clock, 
  Check, 
  X,
  UserCheck
} from 'lucide-react';

interface OfficerWorkstationProps {
  currentUser: SecurityUser;
  students: Student[];
  onApproveStudent: (studentId: string, office: OfficeType, note: string) => void;
  onFlagHold: (studentId: string, office: OfficeType, reason: string, penaltyFee?: number) => void;
  onResolveHold: (studentId: string, office: OfficeType, obligationId: string) => void;
}

export const OfficerWorkstation: React.FC<OfficerWorkstationProps> = ({
  currentUser,
  students,
  onApproveStudent,
  onFlagHold,
  onResolveHold,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(currentUser.departmentScope || 'ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [customNote, setCustomNote] = useState('');
  const [holdTitle, setHoldTitle] = useState('');
  const [holdDetail, setHoldDetail] = useState('');
  const [penaltyFee, setPenaltyFee] = useState<number | ''>('');
  const [showHoldModal, setShowHoldModal] = useState(false);

  const [overrideOffice, setOverrideOffice] = useState<OfficeType | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HOLD' | 'PENDING' | 'APPROVED'>('ALL');

  // Security Office Enforcement
  const activeOffice = overrideOffice || currentUser.office || 'LIBRARY';
  const officeConfig = AASTU_OFFICES.find((o) => o.type === activeOffice);

  // Filter students based on search, department, and status
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.fullName.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q);

    const matchesDept =
      selectedDeptFilter === 'ALL' ||
      s.department.toLowerCase() === selectedDeptFilter.toLowerCase() ||
      s.department.toLowerCase().includes(selectedDeptFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      s.clearances[activeOffice]?.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const clearanceState = selectedStudent?.clearances[activeOffice];
  const isRegistrar = activeOffice === 'REGISTRAR';
  const prereqsMet = selectedStudent ? arePrerequisitesMet(selectedStudent) : false;

  const handleApprove = () => {
    if (!selectedStudent) return;
    const note = customNote.trim() || 'Verified all obligations cleared and authorized.';
    onApproveStudent(selectedStudent.id, activeOffice, note);
    setCustomNote('');
  };

  const handleCreateHold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !holdTitle) return;
    onFlagHold(
      selectedStudent.id,
      activeOffice,
      `${holdTitle}: ${holdDetail}`,
      typeof penaltyFee === 'number' ? penaltyFee : undefined
    );
    setShowHoldModal(false);
    setHoldTitle('');
    setHoldDetail('');
    setPenaltyFee('');
  };

  return (
    <div className="space-y-6">
      {/* Officer Credential & Security Scope Header */}
      <div className="bg-stone-900 dark:bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              Authenticated Desk
            </span>
            <span className="text-xs text-stone-400 font-mono">Badge #{currentUser.badgeId}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {officeConfig?.name} Workstation
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Officer in charge: <strong className="text-white">{currentUser.name}</strong> • Authorized scope: <span className="font-mono text-amber-400 font-bold">{activeOffice}</span> clearance queue.
          </p>
        </div>

        {/* Security Warning Badge */}
        <div className="bg-stone-800/90 border border-stone-700 rounded-2xl px-4 py-3 text-xs text-stone-300 max-w-sm">
          <div className="flex items-center gap-2 text-stone-200 font-semibold mb-1">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cryptographic Role Guard Active</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-snug">
            All approvals are signed with your badge credential and committed directly to the tamper-evident audit ledger.
          </p>
        </div>
      </div>

      {/* Station Desk Switcher Toolbar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
            Station Desk:
          </span>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:inline">
            (Switch office perspective for testing)
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {AASTU_OFFICES.map((off) => {
            const isSelected = activeOffice === off.type;
            return (
              <button
                key={off.type}
                onClick={() => setOverrideOffice(off.type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {off.name.replace('Office', '').replace('University', '').trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workstation Layout: Student Queue on Left, Action Workspace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Student Queue / Search */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-4">
            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Student (e.g. Lakin Awel, ETS...)"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-800"
              />
            </div>

            {/* AASTU Department Scope Filter */}
            <div className="mb-2">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-800"
              >
                <option value="ALL">All AASTU Departments (13)</option>
                <optgroup label="Engineering (9)">
                  <option value="Software">Software</option>
                  <option value="Electrical and computer">Electrical and computer</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electromechanical">Electromechanical</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Mining">Mining</option>
                  <option value="Chemical">Chemical</option>
                </optgroup>
                <optgroup label="Applied Science (4)">
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Industrial chemistry">Industrial chemistry</option>
                  <option value="Food science">Food science</option>
                  <option value="Geology">Geology</option>
                </optgroup>
              </select>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-[11px] mb-3">
              {[
                { id: 'ALL', label: `All (${filteredStudents.length})` },
                { id: 'HOLD', label: 'Holds' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'APPROVED', label: 'Cleared' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`flex-1 py-1 rounded-lg font-semibold transition ${
                    statusFilter === tab.id
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredStudents.map((s) => {
                const sState = s.clearances[activeOffice];
                const isCurrent = s.id === selectedStudent?.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                      isCurrent
                        ? 'bg-amber-900/10 dark:bg-amber-950/40 border-amber-800 dark:border-amber-700 ring-1 ring-amber-800/30'
                        : 'bg-white dark:bg-stone-900/60 border-stone-100 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-stone-900 dark:text-white truncate">
                        {s.fullName}
                      </span>
                      {sState.status === 'APPROVED' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                          Cleared
                        </span>
                      )}
                      {sState.status === 'HOLD' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-semibold">
                          Hold ({sState.obligations.length})
                        </span>
                      )}
                      {sState.status === 'LOCKED' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                          Locked
                        </span>
                      )}
                      {sState.status === 'PENDING' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-medium">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                      <span className="font-mono">{s.id}</span>
                      <span>Yr {s.year} {s.department.split(' ')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Student Inspection & Decision Panel */}
        <div className="lg:col-span-8">
          {selectedStudent ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                      {selectedStudent.fullName}
                    </h2>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-semibold">
                      {selectedStudent.id}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {selectedStudent.department} • Year {selectedStudent.year} (Sec {selectedStudent.section}) • {selectedStudent.college}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Season Target:</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                    {selectedStudent.clearanceSeason === 'NEW_YEAR_REGISTRATION'
                      ? 'New Year Registration'
                      : 'Graduation Exit Clearance'}
                  </span>
                </div>
              </div>

              {/* Sequential Gatekeeper Check for Registrar */}
              {isRegistrar && (
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    prereqsMet
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {prereqsMet ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                    )}
                    <span>
                      {prereqsMet
                        ? 'Institutional Clearance Unlocked'
                        : 'Institutional Gatekeeper Locked'}
                    </span>
                  </div>
                  <p>
                    {prereqsMet
                      ? 'All 6 prerequisite offices (Library, Cafeteria, Dormitory, Discipline, Department, Cost-Sharing) have verified and approved this student. The Registrar may now issue final official clearance.'
                      : 'The student still has pending requirements or holds in prerequisite offices. The Registrar is strictly prohibited from granting clearance until all departments have approved.'}
                  </p>
                </div>
              )}

              {/* Current Department Status */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                  Current {officeConfig?.name} Clearance Status
                </h3>

                <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {clearanceState.status === 'APPROVED' && (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                    {clearanceState.status === 'HOLD' && (
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    {clearanceState.status === 'LOCKED' && (
                      <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400 flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                    )}
                    {clearanceState.status === 'PENDING' && (
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                    )}

                    <div>
                      <div className="font-bold text-stone-900 dark:text-white text-sm">
                        {clearanceState.status === 'APPROVED' && 'Student is Officially Cleared'}
                        {clearanceState.status === 'HOLD' && 'Student has an Active Obligation / Hold'}
                        {clearanceState.status === 'LOCKED' && 'Clearance Gate Locked'}
                        {clearanceState.status === 'PENDING' && 'Pending Verification'}
                      </div>
                      {clearanceState.clearedAt && (
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          Cleared on {new Date(clearanceState.clearedAt).toLocaleString()} by {clearanceState.officerName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Obligations List / Resolution buttons */}
              {clearanceState.obligations && clearanceState.obligations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Recorded Obligations & Liabilities
                  </h3>
                  {clearanceState.obligations.map((ob) => (
                    <div
                      key={ob.id}
                      className="p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-amber-950 dark:text-amber-200 font-bold">{ob.title}</strong>
                          {ob.itemCode && (
                            <span className="font-mono text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded font-semibold">
                              {ob.itemCode}
                            </span>
                          )}
                          {ob.penaltyFeeETB ? (
                            <span className="font-bold text-rose-700 dark:text-rose-400">
                              ETB {ob.penaltyFeeETB} Fine
                            </span>
                          ) : null}
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 mt-1">{ob.detail}</p>
                      </div>

                      <button
                        onClick={() => onResolveHold(selectedStudent.id, activeOffice, ob.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shrink-0 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Returned / Cleared</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Controls */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Officer Audit Note / Remarks (Will be appended to institutional log)
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g. Verified return of item; approved for semester registration."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-800"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    id="btn-officer-approve"
                    disabled={isRegistrar && !prereqsMet}
                    onClick={handleApprove}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white transition-colors shadow-xs ${
                      isRegistrar && !prereqsMet
                        ? 'bg-stone-300 dark:bg-stone-800 cursor-not-allowed text-stone-500'
                        : 'bg-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Sign Clearance</span>
                  </button>

                  {!isRegistrar && (
                    <button
                      id="btn-officer-flag-hold"
                      onClick={() => setShowHoldModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                      <span>Flag New Obligation / Hold</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-stone-500 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
              Select a student from the left queue.
            </div>
          )}
        </div>
      </div>

      {/* Flag Hold Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Place Clearance Hold ({officeConfig?.name})
              </h3>
              <button
                onClick={() => setShowHoldModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHold} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Obligation Title
                </label>
                <input
                  type="text"
                  required
                  value={holdTitle}
                  onChange={(e) => setHoldTitle(e.target.value)}
                  placeholder="e.g. Unreturned Library Book"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Detailed Remarks
                </label>
                <textarea
                  rows={2}
                  value={holdDetail}
                  onChange={(e) => setHoldDetail(e.target.value)}
                  placeholder="e.g. Title: Database System Concepts (Item #AASTU-LIB-092)"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Penalty Fee in ETB (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={penaltyFee}
                  onChange={(e) => setPenaltyFee(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 150"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHoldModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Record Hold on Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};