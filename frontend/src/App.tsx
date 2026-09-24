import React from 'react';
import { StudentDashboard } from './components/StudentDashboard';
import { GraduationCap } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg">ClearanceFlow</span>
            <span className="text-xs text-blue-600 font-semibold ml-2">AASTU Online</span>
          </div>
        </div>
        <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
          STARK Hackathon 2026
        </span>
      </header>
      <main className="py-6">
        <StudentDashboard />
      </main>
    </div>
  );
}
