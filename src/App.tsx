import React, { useState, useEffect } from 'react';
import { Student, OfficeType, SecurityUser } from './types';
import { INITIAL_STUDENTS, DEMO_SECURITY_USERS } from './data';
import { StudentDashboard } from './components/StudentDashboard';
import { OfficerWorkstation } from './components/OfficerWorkstation';
import { GateVerifier } from './components/GateVerifier';
import { DocumentsSlips } from './components/DocumentsSlips';
import { StudentProfile } from './components/StudentProfile';
import { CertificateModal } from './components/CertificateModal';
import { VoxideAssistant } from './components/VoxideAssistant';
import { 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  FileText, 
  User, 
  Sun, 
  Moon, 
  CheckCircle2 
} from 'lucide-react';

export type AppPage = 'STUDENT_PORTAL' | 'OFFICE_PORTAL' | 'GATE_VERIFIER' | 'DOCUMENTS' | 'STUDENT_PROFILE';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('clearanceflow_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('clearanceflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('clearanceflow_theme', 'light');
    }
  }, [isDark]);

  const [activePage, setActivePage] = useState<AppPage>('STUDENT_PORTAL');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [currentStudentId, setCurrentStudentId] = useState<string>(INITIAL_STUDENTS[0].id);
  const [currentUser] = useState<SecurityUser>(DEMO_SECURITY_USERS[0]);
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentStudent = students.find(s => s.id === currentStudentId) || students[0];

  const handleApproveStudent = (studentId: string, office: OfficeType, note: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      return {
        ...s,
        clearances: {
          ...s.clearances,
          [office]: {
            ...s.clearances[office],
            office,
            status: 'APPROVED',
            clearedAt: new Date().toISOString(),
            officerNotes: note,
            obligations: [],
          }
        }
      };
    }));
    setToastMessage(`Officer approved clearance for ${office} on ${studentId}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResolveHold = (studentId: string, office: OfficeType, obligationId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const prevOffice = s.clearances[office];
      return {
        ...s,
        clearances: {
          ...s.clearances,
          [office]: {
            ...prevOffice,
            status: 'PENDING',
            officerNotes: 'Student submitted verification proof. In review queue by office reviewer.',
            obligations: prevOffice?.obligations?.map(o => o.id === obligationId ? { ...o, isResolved: true } : o) || [],
          }
        }
      };
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-200">
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-stone-900 dark:text-white text-lg tracking-tight">ClearanceFlow</span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold ml-2">AASTU Online</span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl border border-stone-200 dark:border-stone-700/60 text-xs font-semibold">
              <button
                onClick={() => setActivePage('STUDENT_PORTAL')}
                className={`px-3.5 py-1.5 rounded-xl transition ${activePage === 'STUDENT_PORTAL' ? 'bg-white dark:bg-stone-900 text-blue-600 shadow-xs font-bold' : 'text-stone-600 dark:text-stone-400'}`}
              >
                Student Clearance
              </button>
              <button
                onClick={() => setActivePage('OFFICE_PORTAL')}
                className={`px-3.5 py-1.5 rounded-xl transition ${activePage === 'OFFICE_PORTAL' ? 'bg-white dark:bg-stone-900 text-indigo-600 shadow-xs font-bold' : 'text-stone-600 dark:text-stone-400'}`}
              >
                Staff Desk
              </button>
              <button
                onClick={() => setActivePage('GATE_VERIFIER')}
                className={`px-3.5 py-1.5 rounded-xl transition ${activePage === 'GATE_VERIFIER' ? 'bg-white dark:bg-stone-900 text-emerald-600 shadow-xs font-bold' : 'text-stone-600 dark:text-stone-400'}`}
              >
                Gate Pass
              </button>
              <button
                onClick={() => setActivePage('DOCUMENTS')}
                className={`px-3.5 py-1.5 rounded-xl transition ${activePage === 'DOCUMENTS' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-bold' : 'text-stone-600 dark:text-stone-400'}`}
              >
                Guidelines & Slips
              </button>
            </nav>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                <span className="text-stone-400 font-medium">Viewing:</span>
                <select
                  value={currentStudentId}
                  onChange={(e) => setCurrentStudentId(e.target.value)}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                >
                  {students.map((s, idx) => (
                    <option key={`${s.id}-${idx}`} value={s.id}>
                      {s.fullName} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        {activePage === 'STUDENT_PORTAL' && (
          <StudentDashboard
            student={currentStudent}
            onOpenCertificateModal={() => setIsCertModalOpen(true)}
            onResolveHold={handleResolveHold}
            onApproveStudent={handleApproveStudent}
            onQuickSwitchPage={(page) => {
              if (page === 'OFFICE_PORTAL') setActivePage('OFFICE_PORTAL');
              if (page === 'DOCUMENTS') setActivePage('DOCUMENTS');
            }}
          />
        )}
        {activePage === 'OFFICE_PORTAL' && (
          <OfficerWorkstation
            currentUser={currentUser}
            students={students}
            onApproveStudent={handleApproveStudent}
            onFlagHold={() => {}}
            onResolveHold={handleResolveHold}
          />
        )}
        {activePage === 'GATE_VERIFIER' && (
          <GateVerifier
            students={students}
            onBackToApp={() => setActivePage('STUDENT_PORTAL')}
          />
        )}
        {activePage === 'DOCUMENTS' && (
          <DocumentsSlips
            student={currentStudent}
            isDarkMode={isDark}
            onOpenCertificateModal={() => setIsCertModalOpen(true)}
          />
        )}
      </main>

      <VoxideAssistant />

      <CertificateModal
        student={currentStudent}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        onOpenVerifier={() => setActivePage('GATE_VERIFIER')}
      />
    </div>
  );
}
