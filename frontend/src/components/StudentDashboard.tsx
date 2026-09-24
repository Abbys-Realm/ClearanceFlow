import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { ClearanceItem, ClearanceIssue } from '../types/clearanceFlow';

interface Props {
  studentName?: string;
  studentId?: string;
  department?: string;
}

export const StudentDashboard: React.FC<Props> = ({
  studentName = 'Selamawit Bekele',
  studentId = 'ETS/0842/13',
  department = 'Software Engineering'
}) => {
  const [items, setItems] = useState<ClearanceItem[]>([
    { id: '1', clearanceRequestId: 'req-1', departmentId: 'd1', departmentName: 'Library', status: 'approved', remarks: 'All textbooks returned' },
    { id: '2', clearanceRequestId: 'req-1', departmentId: 'd2', departmentName: 'Dormitory', status: 'approved', remarks: 'Room key & locker cleared' },
    { id: '3', clearanceRequestId: 'req-1', departmentId: 'd3', departmentName: 'Cafeteria', status: 'approved', remarks: 'Meal card verified' },
    { id: '4', clearanceRequestId: 'req-1', departmentId: 'd4', departmentName: 'Department Head', status: 'action_required', remarks: 'Final Senior Project Hardcover copy pending' },
    { id: '5', clearanceRequestId: 'req-1', departmentId: 'd5', departmentName: 'Finance Office', status: 'pending' },
    { id: '6', clearanceRequestId: 'req-1', departmentId: 'd6', departmentName: 'Sports & Property', status: 'approved', remarks: 'No sports dues' },
  ]);

  const [issueResolved, setIssueResolved] = useState(false);

  const approvedCount = items.filter(i => i.status === 'approved').length;
  const progressPercent = Math.round((approvedCount / items.length) * 100);

  const handleResolveIssue = () => {
    setIssueResolved(true);
    setItems(prev => prev.map(item => 
      item.departmentName === 'Department Head' 
        ? { ...item, status: 'pending', remarks: 'Hardcover submitted to department secretary, awaiting signature' }
        : item
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider bg-white/20 px-2 py-1 rounded">2026 Graduating Class</span>
            <h1 className="text-2xl font-bold mt-2">Hello, {studentName} 👋</h1>
            <p className="text-blue-100 text-sm">{studentId} • {department}</p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 rounded-xl p-3">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-emerald-400 font-bold text-lg">
              {progressPercent}%
            </div>
            <div>
              <p className="text-xs text-blue-200">Clearance Progress</p>
              <p className="font-semibold text-sm">{approvedCount} of {items.length} Departments Cleared</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Required Banner if Department has issue */}
      {!issueResolved && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 text-sm">Action Required: Department Head</h3>
              <p className="text-amber-800 text-xs mt-0.5">Remark: Final Senior Project Hardcover copy pending at SE Department Office.</p>
            </div>
          </div>
          <button 
            onClick={handleResolveIssue}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            Mark Resolved
          </button>
        </div>
      )}

      {/* Clearance Stations Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Department Clearance Stations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">{item.departmentName}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{item.remarks || 'Awaiting officer review'}</p>
              </div>
              <div>
                {item.status === 'approved' && (
                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 text-xs px-2.5 py-1 rounded-full font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                  </span>
                )}
                {item.status === 'action_required' && (
                  <span className="flex items-center gap-1 text-amber-700 bg-amber-100 text-xs px-2.5 py-1 rounded-full font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> Action
                  </span>
                )}
                {item.status === 'pending' && (
                  <span className="flex items-center gap-1 text-blue-700 bg-blue-100 text-xs px-2.5 py-1 rounded-full font-medium">
                    <Clock className="w-3.5 h-3.5" /> In Review
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
